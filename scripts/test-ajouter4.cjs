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
  
  await page.context().addInitScript(() => {
    localStorage.clear();
    delete window.__MASTER_KEY__;
    if (window.__DB__) window.__DB__.delete().catch(() => {});
  });
  
  // Setup
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.fill('#password1', 'TestPass123');
  await page.fill('#password2', 'TestPass123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  
  // Navigate directly to /record (no id)
  console.log('Navigating to /record directly...');
  await page.goto('http://localhost:4173/record', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(5000);
  
  // Check what's on the page
  const result = await page.evaluate(() => {
    const body = document.body.innerHTML.substring(0, 2000);
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"], textarea');
    const h1 = document.querySelector('.page h1');
    const editBtn = document.querySelector('.btn-edit');
    const saveBtn = document.querySelector('.btn-success');
    const deleteBtn = document.querySelector('.btn-danger');
    
    return {
      body,
      inputCount: inputs.length,
      inputDetails: Array.from(inputs).map(i => ({
        type: i.type,
        value: i.value,
        id: i.id,
        class: i.className
      })),
      h1Text: h1 ? h1.innerText : 'NO H1',
      hasEditBtn: !!editBtn,
      hasSaveBtn: !!saveBtn,
      hasDeleteBtn: !!deleteBtn,
    };
  });
  
  console.log('Input count:', result.inputCount);
  console.log('Inputs:', JSON.stringify(result.inputDetails));
  console.log('H1 text:', result.h1Text);
  console.log('Has edit btn:', result.hasEditBtn);
  console.log('Has save btn:', result.hasSaveBtn);
  console.log('Has delete btn:', result.hasDeleteBtn);
  console.log('Body HTML (first 2000):', result.body.substring(0, 2000));
  
  await browser.close();
})();
