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
  
  // Setup account
  await page.context().addInitScript(() => {
    localStorage.clear();
    delete window.__MASTER_KEY__;
    if (window.__DB__) window.__DB__.delete().catch(() => {});
  });
  
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  // Fill setup form
  await page.fill('#password1', 'TestPass123');
  await page.fill('#password2', 'TestPass123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  
  console.log('Setup complete, URL:', page.url());
  
  // TEST 1: Click brand to go home
  console.log('\n=== TEST 1: Brand click ===');
  await page.click('.brand');
  await page.waitForTimeout(1000);
  console.log('After brand click:', page.url());
  if (page.url().includes('/')) console.log('✅ Brand click works');
  else console.log('❌ Brand click failed');
  
  // Login
  console.log('\n=== TEST 2: Login ===');
  await page.fill('#password', 'TestPass123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  console.log('After login:', page.url());
  
  // Check contrast
  console.log('\n=== TEST 3: Contrast ===');
  const contrast = await page.evaluate(() => {
    const input = document.querySelector('input');
    const computed = window.getComputedStyle(input);
    return {
      bg: computed.backgroundColor,
      color: computed.color,
      border: computed.borderColor
    };
  });
  console.log('Input contrast:', JSON.stringify(contrast, null, 2));
  
  // Create record
  console.log('\n=== TEST 4: Create record ===');
  await page.click('button.btn-success');
  await page.waitForTimeout(3000);
  
  const inputs = await page.$$('input');
  console.log('Found inputs:', inputs.length);
  
  // Fill first few fields
  if (inputs.length >= 3) {
    await inputs[0].fill('TestService');
    await inputs[1].fill('192.168.1.1');
    await inputs[2].fill('https://test.com');
    console.log('Fields filled');
  }
  
  await page.click('.btn-success');
  await page.waitForTimeout(3000);
  console.log('After save:', page.url());
  
  // View record
  await page.click('.btn-view');
  await page.waitForTimeout(3000);
  
  // Check password toggle
  console.log('\n=== TEST 5: Password toggle ===');
  const hasToggle = await page.evaluate(() => !!document.querySelector('.password-toggle'));
  console.log('Has toggle:', hasToggle);
  
  if (hasToggle) {
    await page.click('.password-toggle');
    await page.waitForTimeout(500);
    const inputType = await page.evaluate(() => document.querySelector('input')?.type);
    console.log('Input type after toggle:', inputType);
    if (inputType === 'text') console.log('✅ Toggle works');
    else console.log('❌ Toggle failed');
    
    // Click elsewhere
    await page.click('.page');
    await page.waitForTimeout(1000);
    const inputTypeAfter = await page.evaluate(() => document.querySelector('input')?.type);
    console.log('Input type after click elsewhere:', inputTypeAfter);
    if (inputTypeAfter === 'password') console.log('✅ Hide works');
    else console.log('❌ Hide failed');
  }
  
  // Screenshot
  await page.screenshot({ path: '/home/ubuntu/dev/toto-gemma4-21b-google/copies-d-ecrans/test-simple.png', fullPage: true });
  console.log('\nScreenshot saved');
  
  await browser.close();
})();
