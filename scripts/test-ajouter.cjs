const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    const text = msg.text();
    if (text) console.log('[LOG]', text);
  });
  page.on('pageerror', err => {
    console.log('[ERROR]', err.message);
  });
  
  // Clear everything to simulate fresh state
  await page.context().addInitScript(() => {
    localStorage.clear();
    delete window.__MASTER_KEY__;
    if (window.__DB__) {
      window.__DB__.delete().catch(() => {});
    }
  });
  
  // Setup a new account
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  await page.fill('#password1', 'TestPass123');
  await page.fill('#password2', 'TestPass123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  
  // Verify we're on Records page
  const url = page.url();
  const hasRecordsTable = await page.evaluate(() => !!document.querySelector('.records-table'));
  
  console.log('URL:', url);
  console.log('Has records table:', hasRecordsTable);
  
  // Now try clicking the Ajouter button
  const btn = await page.$('button.btn-success');
  if (!btn) {
    console.log('ERR: Ajouter button NOT FOUND');
  } else {
    console.log('OK: Ajouter button found');
    console.log('Button text:', await btn.evaluate(el => el.innerText));
    console.log('Button disabled:', await btn.evaluate(el => el.disabled));
    
    // Click the button
    await btn.click();
    await page.waitForTimeout(3000);
    
    // Check what happened
    const newUrl = page.url();
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 300));
    console.log('URL after click:', newUrl);
    console.log('Body after click:', bodyText);
    
    // Check if we got the empty state or form
    const emptyState = await page.evaluate(() => !!document.querySelector('.empty-state'));
    const hasForm = await page.evaluate(() => !!document.querySelector('input[type="text"]'));
    const hasEditBtn = await page.evaluate(() => !!document.querySelector('.btn-edit'));
    const hasPageTitle = await page.evaluate(() => document.querySelector('.page h1')?.innerText);
    
    console.log('Empty state shown:', emptyState);
    console.log('Form inputs visible:', hasForm);
    console.log('Edit button visible:', hasEditBtn);
    console.log('Page title:', hasPageTitle);
    
    // Screenshot
    await page.screenshot({ path: '/home/ubuntu/dev/toto-gemma4-21b-google/copies-d-ecrans/debug-ajouter-fail.png', fullPage: true });
    console.log('Screenshot saved');
  }
  
  await browser.close();
})();
