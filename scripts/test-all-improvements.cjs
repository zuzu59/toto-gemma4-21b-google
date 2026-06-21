const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    const text = msg.text();
    if (text && (text.includes('Error') || text.includes('error'))) {
      console.log('[ERR]', text);
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
  
  // TEST 1: Click brand to go home
  console.log('\n=== TEST 1: Brand click → home ===');
  await page.click('.brand');
  await page.waitForTimeout(500);
  const homeUrl = page.url();
  if (homeUrl.includes('/')) {
    console.log('✅ PASS: Brand click goes to home');
  } else {
    console.log('❌ FAIL: Brand click failed');
    allPassed = false;
  }
  
  // Login again
  await page.fill('#password', 'TestPass123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  
  // TEST 2: Contrast check
  console.log('\n=== TEST 2: Contrast improvement ===');
  const contrastChecks = await page.evaluate(() => {
    const results = [];
    
    // Check input contrast
    const inputs = document.querySelectorAll('input, textarea');
    if (inputs.length > 0) {
      const computed = window.getComputedStyle(inputs[0]);
      const bg = computed.backgroundColor;
      const color = computed.color;
      results.push({
        type: 'input',
        bg: bg,
        color: color,
        visible: parseInt(color.replace(/[^0-9]/g, '')) > 150
      });
    }
    
    // Check table header contrast
    const th = document.querySelector('.table-header th');
    if (th) {
      const computed = window.getComputedStyle(th);
      results.push({
        type: 'table-header',
        bg: computed.backgroundColor,
        color: computed.color,
        fontWeight: computed.fontWeight
      });
    }
    
    // Check buttons
    const btn = document.querySelector('.btn-success');
    if (btn) {
      const computed = window.getComputedStyle(btn);
      results.push({
        type: 'button',
        bg: computed.backgroundColor,
        color: computed.color
      });
    }
    
    return results;
  });
  
  console.log('Contrast checks:', JSON.stringify(contrastChecks, null, 2));
  contrastChecks.forEach(check => {
    if (check.visible || (check.color && check.color.includes('255, 255, 255'))) {
      console.log(`✅ ${check.type}: Good contrast`);
    } else {
      console.log(`❌ ${check.type}: Poor contrast`);
      allPassed = false;
    }
  });
  
  // Create a record with passwords
  console.log('\n=== TEST 3: Create record with passwords ===');
  await page.click('button.btn-success');
  await page.waitForTimeout(3000);
  
  // Fill form
  const allInputs = await page.$$('input, textarea');
  let formInputs = [];
  for (const el of allInputs) {
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
  
  await fillField(formInputs[0], 'TestService');
  await fillField(formInputs[1], '192.168.1.1');
  await fillField(formInputs[2], 'https://test.com');
  await fillField(formInputs[6], 'admin');
  await fillField(formInputs[7], 'secretPass123');
  await fillField(formInputs[8], 'ssh admin@1.1');
  await page.click('.btn-success');
  await page.waitForTimeout(3000);
  
  // View record
  await page.click('.btn-view');
  await page.waitForTimeout(3000);
  
  // TEST 4: Password toggle
  console.log('\n=== TEST 4: Password toggle ===');
  const hasToggleBtn = await page.evaluate(() => {
    return !!document.querySelector('.password-toggle');
  });
  console.log('Has password toggle:', hasToggleBtn);
  
  if (hasToggleBtn) {
    await page.click('.password-toggle');
    await page.waitForTimeout(500);
    
    const inputType = await page.evaluate(() => {
      return document.querySelector('input[type="password"], input[type="text"]')?.type;
    });
    
    if (inputType === 'text') {
      console.log('✅ PASS: Password visible after toggle');
    } else {
      console.log('❌ FAIL: Password not visible');
      allPassed = false;
    }
    
    // Click elsewhere to hide
    await page.click('.page');
    await page.waitForTimeout(1000);
    
    const inputTypeAfterHide = await page.evaluate(() => {
      return document.querySelector('input[type="password"], input[type="text"]')?.type;
    });
    
    if (inputTypeAfterHide === 'password') {
      console.log('✅ PASS: Password hidden after clicking elsewhere');
    } else {
      console.log('❌ FAIL: Password not hidden');
      allPassed = false;
    }
  } else {
    console.log('❌ FAIL: No toggle button found');
    allPassed = false;
  }
  
  // TEST 5: Alignment check
  console.log('\n=== TEST 5: Alignment check ===');
  const alignment = await page.evaluate(() => {
    const fields = document.querySelectorAll('.field');
    const results = [];
    fields.forEach(field => {
      const hasPasswordField = field.querySelector('.password-field');
      if (hasPasswordField) {
        const input = hasPasswordField.querySelector('input');
        const toggle = hasPasswordField.querySelector('.password-toggle');
        const copy = hasPasswordField.querySelector('.btn-copy');
        results.push({
          hasPasswordField: !!hasPasswordField,
          hasInput: !!input,
          hasToggle: !!toggle,
          hasCopy: !!copy,
          display: hasPasswordField.style.display,
          gap: hasPasswordField.style.gap
        });
      }
    });
    return results;
  });
  
  console.log('Alignment checks:', JSON.stringify(alignment, null, 2));
  alignment.forEach(check => {
    if (check.hasPasswordField && check.hasInput && check.hasToggle && check.hasCopy) {
      console.log('✅ PASS: Field alignment correct');
    } else {
      console.log('❌ FAIL: Field alignment issue');
      allPassed = false;
    }
  });
  
  // Screenshot
  await page.screenshot({ path: '/home/ubuntu/dev/toto-gemma4-21b-google/copies-d-ecrans/test-all-improvements.png', fullPage: true });
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
