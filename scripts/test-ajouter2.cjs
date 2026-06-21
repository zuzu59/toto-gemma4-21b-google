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
  
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.fill('#password1', 'TestPass123');
  await page.fill('#password2', 'TestPass123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  
  // Click Ajouter
  await page.click('button.btn-success');
  await page.waitForTimeout(3000);
  
  // Deep diagnosis
  const details = await page.evaluate(() => {
    const app = document.getElementById('app');
    const html = app ? app.innerHTML.substring(0, 2000) : 'NO APP';
    
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"], textarea');
    const spans = document.querySelectorAll('.page span:not(.tag-chip):not(.version-badge)');
    
    return {
      htmlSnippet: html.substring(0, 1500),
      inputCount: inputs.length,
      inputNames: Array.from(inputs).map(i => ({
        type: i.type,
        name: i.name || i.id || 'none',
        value: i.value
      })),
      spanCount: spans.length,
      spanTexts: Array.from(spans).map(s => s.innerText),
      hasEmptyState: !!document.querySelector('.empty-state'),
      hasEditBtn: !!document.querySelector('.btn-edit'),
      hasSaveBtn: !!document.querySelector('.btn-success'),
      hasDeleteBtn: !!document.querySelector('.btn-danger'),
      pageTitle: document.querySelector('.page h1')?.innerText || 'NO TITLE',
      viewMode: document.querySelector('.page')?.className || 'NO CLASS',
    };
  });
  
  console.log('Input count:', details.inputCount);
  console.log('Inputs:', JSON.stringify(details.inputNames));
  console.log('Span count:', details.spanCount);
  console.log('Span texts:', details.spanTexts);
  console.log('Empty state:', details.hasEmptyState);
  console.log('Has Edit button:', details.hasEditBtn);
  console.log('Has Save button:', details.hasSaveBtn);
  console.log('Has Delete button:', details.hasDeleteBtn);
  console.log('Page title:', details.pageTitle);
  console.log('HTML snippet:', details.htmlSnippet);
  
  // Check if "Modifier" button is clickable
  const modifierBtn = await page.$('.btn-edit');
  if (modifierBtn) {
    console.log('OK: Modifier button found and clickable');
    await modifierBtn.click();
    await page.waitForTimeout(2000);
    console.log('After click, URL:', page.url());
    const afterClick = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
      return {
        inputCount: inputs.length,
        hasSaveBtn: !!document.querySelector('.btn-success'),
        hasEditBtn: !!document.querySelector('.btn-edit'),
        pageTitle: document.querySelector('.page h1')?.innerText
      };
    });
    console.log('After edit mode:', JSON.stringify(afterClick));
  } else {
    console.log('MISSING: Modifier button');
  }
  
  await browser.close();
})();
