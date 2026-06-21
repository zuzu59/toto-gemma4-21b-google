const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    const text = msg.text();
    if (text && (text.includes('Error') || text.includes('error') || text.includes('Decryption'))) {
      console.log('[LOG]', text.substring(0, 150));
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
  
  // Setup
  await page.fill('#password1', 'TestPass123');
  await page.fill('#password2', 'TestPass123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  
  // Create record
  await page.click('button.btn-success');
  await page.waitForTimeout(3000);
  
  const inputs = await page.$$('input');
  console.log('Inputs found:', inputs.length);
  
  // Fill fields
  if (inputs.length >= 3) {
    await inputs[0].fill('TestService');
    await inputs[1].fill('192.168.1.1');
    await inputs[2].fill('https://test.com');
    
    // Find password fields
    const passwordInputs = await page.$$('input[type="password"]');
    console.log('Password inputs found:', passwordInputs.length);
    
    if (passwordInputs.length >= 1) {
      await passwordInputs[0].fill('secretPass123');
      console.log('Password filled');
    }
  }
  
  await page.click('.btn-success');
  await page.waitForTimeout(3000);
  console.log('After save:', page.url());
  
  // View record
  await page.click('.btn-view');
  await page.waitForTimeout(3000);
  
  // Check DOM
  const domInfo = await page.evaluate(() => {
    const pageEl = document.querySelector('.page');
    const innerHTML = pageEl ? pageEl.innerHTML.substring(0, 2000) : 'No .page element';
    
    const passwordFields = document.querySelectorAll('.password-field');
    const toggleButtons = document.querySelectorAll('.password-toggle');
    
    return {
      hasPage: !!pageEl,
      passwordFieldCount: passwordFields.length,
      toggleButtonCount: toggleButtons.length,
      innerHTML: innerHTML
    };
  });
  
  console.log('DOM info:', JSON.stringify(domInfo, null, 2));
  
  await browser.close();
})();
