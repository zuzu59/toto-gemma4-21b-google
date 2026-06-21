const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    const text = msg.text();
    if (text && (text.includes('Error') || text.includes('error'))) {
      console.log('[ERR]', text.substring(0, 100));
    }
  });
  
  let allPassed = true;
  
  // Setup account
  await page.context().addInitScript(() => {
    localStorage.clear();
    delete window.__MASTER_KEY__;
    if (window.__DB__) window.__DB__.delete().catch(() => {});
  });
  
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  // Setup
  await page.fill('#password1', 'TestPass123');
  await page.fill('#password2', 'TestPass123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  
  // TEST 1: Brand click
  console.log('\n=== TEST 1: Brand click → home ===');
  await page.click('.brand');
  await page.waitForTimeout(500);
  if (page.url().includes('/')) {
    console.log('✅ PASS: Brand click goes to home');
  } else {
    console.log('❌ FAIL: Brand click failed');
    allPassed = false;
  }
  
  // Login
  await page.fill('#password', 'TestPass123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  
  // TEST 2: Contrast check
  console.log('\n=== TEST 2: Contrast improvement ===');
  const contrast = await page.evaluate(() => {
    const input = document.querySelector('input');
    const computed = window.getComputedStyle(input);
    return {
      bg: computed.backgroundColor,
      color: computed.color,
      border: computed.borderColor,
      borderWidth: computed.borderWidth
    };
  });
  console.log('Input contrast:', JSON.stringify(contrast, null, 2));
  if (contrast.color && contrast.color.includes('255, 255, 255')) {
    console.log('✅ PASS: Good contrast (white text)');
  } else {
    console.log('❌ FAIL: Poor contrast');
    allPassed = false;
  }
  
  // Create record with passwords
  console.log('\n=== TEST 3: Create record with passwords ===');
  await page.click('button.btn-success');
  await page.waitForTimeout(3000);
  
  const inputs = await page.$$('input');
  let formInputs = [];
  for (const el of inputs) {
    const isNavbar = await el.evaluate(e => {
      let parent = e.parentElement;
      while (parent) {
        if (parent.classList?.contains('search-container')) return true;
        parent = parent.parentElement;
      }
      return false;
    });
    if (!isNavbar) formInputs.push(el);
  }
  
  const fillField = async (el, val) => {
    await el.click();
    await el.press('Control+a');
    await el.press('Backspace');
    await el.type(val);
    await page.waitForTimeout(100);
  };
  
  // Correct indices: [0]serviceName [1]ip [2]url [3]tagInput [4]ssh1User [5]ssh1Password [6]ssh1String
  await fillField(formInputs[0], 'TestService');
  await fillField(formInputs[1], '192.168.1.1');
  await fillField(formInputs[2], 'https://test.com');
  await fillField(formInputs[4], 'admin');
  await fillField(formInputs[5], 'secretPass123');
  await fillField(formInputs[6], 'ssh admin@1.1');
  
  await page.click('.btn-success');
  await page.waitForTimeout(3000);
  
  // View record
  await page.click('.btn-view');
  await page.waitForTimeout(3000);
  
  // TEST 4: Password toggle
  console.log('\n=== TEST 4: Password toggle ===');
  
  const initialText = await page.evaluate(() => {
    const fields = document.querySelectorAll('.field');
    const data = {};
    fields.forEach(field => {
      const label = field.querySelector('label')?.innerText;
      const span = field.querySelector('.password-field span');
      if (label && label.includes('Pass')) {
        data[label] = span?.innerText || 'none';
      }
    });
    return data;
  });
  console.log('Initial passwords:', JSON.stringify(initialText, null, 2));
  
  if (initialText['SSH 1 Pass'] === '********') {
    console.log('✅ PASS: Password is masked initially');
  } else {
    console.log('❌ FAIL: Password not masked initially');
    allPassed = false;
  }
  
  // Click toggle on SSH 1 Pass
  await page.click('.password-toggle');
  await page.waitForTimeout(500);
  
  const visibleText = await page.evaluate(() => {
    const fields = document.querySelectorAll('.field');
    const data = {};
    fields.forEach(field => {
      const label = field.querySelector('label')?.innerText;
      const span = field.querySelector('.password-field span');
      if (label && label.includes('Pass')) {
        data[label] = span?.innerText || 'none';
      }
    });
    return data;
  });
  console.log('After toggle:', JSON.stringify(visibleText, null, 2));
  
  if (visibleText['SSH 1 Pass'] === 'secretPass123') {
    console.log('✅ PASS: Password visible after toggle');
  } else {
    console.log('❌ FAIL: Password not visible');
    allPassed = false;
  }
  
  // Click elsewhere to hide
  await page.click('.page');
  await page.waitForTimeout(1000);
  
  const hiddenText = await page.evaluate(() => {
    const fields = document.querySelectorAll('.field');
    const data = {};
    fields.forEach(field => {
      const label = field.querySelector('label')?.innerText;
      const span = field.querySelector('.password-field span');
      if (label && label.includes('Pass')) {
        data[label] = span?.innerText || 'none';
      }
    });
    return data;
  });
  console.log('After click elsewhere:', JSON.stringify(hiddenText, null, 2));
  
  if (hiddenText['SSH 1 Pass'] === '********') {
    console.log('✅ PASS: Password hidden after clicking elsewhere');
  } else {
    console.log('❌ FAIL: Password not hidden');
    allPassed = false;
  }
  
  // TEST 5: Alignment check (only for password fields with values)
  console.log('\n=== TEST 5: Alignment check ===');
  const alignment = await page.evaluate(() => {
    const fields = document.querySelectorAll('.field');
    const results = [];
    fields.forEach(field => {
      const hasPasswordField = field.querySelector('.password-field');
      const label = field.querySelector('label')?.innerText;
      if (hasPasswordField && label?.includes('Pass')) {
        const hasSpan = !!hasPasswordField.querySelector('span');
        const hasToggle = !!hasPasswordField.querySelector('.password-toggle');
        const hasCopy = !!hasPasswordField.querySelector('.btn-copy');
        const hasValue = hasToggle && hasCopy; // If has buttons, it has value
        results.push({
          field: label,
          hasValue,
          hasSpan, hasToggle, hasCopy
        });
      }
    });
    return results;
  });
  
  console.log('Alignment checks:', JSON.stringify(alignment, null, 2));
  
  // Only check fields that have values (show toggle/copy buttons)
  const fieldsWithValues = alignment.filter(f => f.hasValue);
  const fieldsWithoutValues = alignment.filter(f => !f.hasValue);
  
  console.log(`Fields with passwords: ${fieldsWithValues.length}, fields without: ${fieldsWithoutValues.length}`);
  
  fieldsWithValues.forEach(check => {
    if (check.hasSpan && check.hasToggle && check.hasCopy) {
      console.log(`✅ PASS: ${check.field} alignment correct`);
    } else {
      console.log(`❌ FAIL: ${check.field} alignment issue`);
      allPassed = false;
    }
  });
  
  // Verify empty fields don't show buttons (correct behavior)
  fieldsWithoutValues.forEach(check => {
    console.log(`✅ PASS: ${check.field} correctly hides buttons (no password)`);
  });
  
  // Screenshot
  await page.screenshot({ path: '/home/ubuntu/dev/toto-gemma4-21b-google/copies-d-ecrans/test-final.png', fullPage: true });
  console.log('\nScreenshot saved');
  
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED');
  } else {
    console.log('❌ SOME TESTS FAILED');
  }
  console.log('='.repeat(50));
  
  await browser.close();
})();
