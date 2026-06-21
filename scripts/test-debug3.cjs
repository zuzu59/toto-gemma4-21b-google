const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
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
  
  await fillField(formInputs[0], 'TestService');
  await fillField(formInputs[1], '192.168.1.1');
  await fillField(formInputs[2], 'https://test.com');
  await fillField(formInputs[6], 'admin');
  await fillField(formInputs[7], 'secretPass123');
  await fillField(formInputs[8], 'ssh admin@1.1');
  await page.click('.btn-success');
  await page.waitForTimeout(3000);
  
  // Check the record in the DB before viewing
  const dbData = await page.evaluate(async () => {
    const { db } = window.__DB__ || {};
    if (!db) return 'No DB';
    const records = await db.records.toArray();
    return JSON.stringify(records, null, 2).substring(0, 1000);
  });
  console.log('DB data:', dbData);
  
  // View record
  await page.click('.btn-view');
  await page.waitForTimeout(3000);
  
  // Check the reactive data
  const reactiveData = await page.evaluate(() => {
    // Try to access Vue app instance
    const app = document.querySelector('[data-v-app]');
    if (!app) return 'No app';
    
    // Try to find the record detail component
    const pageEl = document.querySelector('.page');
    if (!pageEl) return 'No page element';
    
    // Check all spans in password fields
    const spans = document.querySelectorAll('.password-field span');
    const passwordData = {};
    spans.forEach((span, i) => {
      passwordData[`field${i}`] = {
        text: span.innerText,
        parent: span.parentElement?.className
      };
    });
    
    // Check what the form data looks like
    // Try to access the component's data through Vue devtools-like approach
    const labels = document.querySelectorAll('.field label');
    const labelTexts = Array.from(labels).map(l => l.innerText);
    
    return {
      passwordData,
      labels: labelTexts,
      pageHTML: pageEl.innerHTML.substring(0, 2000)
    };
  });
  console.log('Reactive data:', JSON.stringify(reactiveData, null, 2).substring(0, 2000));
  
  await browser.close();
})();
