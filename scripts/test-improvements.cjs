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
  
  // Setup account
  await page.context().addInitScript(() => {
    localStorage.clear();
    delete window.__MASTER_KEY__;
    if (window.__DB__) window.__DB__.delete().catch(() => {});
  });
  
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.fill('#password1', 'TestPass123');
  await page.fill('#password2', 'TestPass123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  
  // Test 1: Click on brand to go home
  console.log('=== TEST 1: Click brand to go home ===');
  const brandText = await page.evaluate(() => document.querySelector('.brand')?.innerText);
  console.log('Brand:', brandText);
  await page.click('.brand');
  await page.waitForTimeout(1000);
  const afterBrandClick = page.url();
  console.log('URL after brand click:', afterBrandClick);
  if (afterBrandClick.includes('/')) {
    console.log('✅ Brand click goes to home');
  } else {
    console.log('❌ Brand click failed');
  }
  
  // Login again
  await page.fill('#password', 'TestPass123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  
  // Create a record with passwords
  console.log('\n=== TEST 2: Create record with passwords ===');
  await page.click('button.btn-success');
  await page.waitForTimeout(3000);
  
  // Get form inputs
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
  
  // Fill fields
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
  
  // Test 2: Password toggle
  console.log('\n=== TEST 3: Password toggle ===');
  const hasToggleBtn = await page.evaluate(() => {
    const toggle = document.querySelector('.password-toggle');
    return !!toggle;
  });
  console.log('Has password toggle button:', hasToggleBtn);
  
  if (hasToggleBtn) {
    // Click toggle to show password
    await page.click('.password-toggle');
    await page.waitForTimeout(500);
    
    const inputType = await page.evaluate(() => {
      const input = document.querySelector('input[type="password"], input[type="text"]');
      return input?.type;
    });
    console.log('Input type after toggle:', inputType);
    
    if (inputType === 'text') {
      console.log('✅ Password visible after toggle');
    }
    
    // Click elsewhere to hide
    await page.click('.page');
    await page.waitForTimeout(500);
    
    const inputTypeAfterHide = await page.evaluate(() => {
      const input = document.querySelector('input[type="password"], input[type="text"]');
      return input?.type;
    });
    console.log('Input type after click elsewhere:', inputTypeAfterHide);
    
    if (inputTypeAfterHide === 'password') {
      console.log('✅ Password hidden after clicking elsewhere');
    }
  }
  
  // Test 4: Contrast check
  console.log('\n=== TEST 4: Contrast check ===');
  const inputStyles = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, textarea');
    const styles = Array.from(inputs).map(el => {
      const computed = window.getComputedStyle(el);
      return {
        bg: computed.backgroundColor,
        color: computed.color,
        border: computed.borderColor,
        borderWidth: computed.borderWidth
      };
    });
    return styles[0];
  });
  console.log('Input styles:', JSON.stringify(inputStyles, null, 2));
  
  // Screenshot
  await page.screenshot({ path: '/home/ubuntu/dev/toto-gemma4-21b-google/copies-d-ecrans/test-improvements.png', fullPage: true });
  console.log('\nScreenshot saved');
  
  await browser.close();
})();
