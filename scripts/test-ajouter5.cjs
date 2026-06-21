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
  
  // Setup account
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.fill('#password1', 'TestPass123');
  await page.fill('#password2', 'TestPass123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  
  // Verify auth
  const isAuthenticated = await page.evaluate(() => {
    return !!window.__MASTER_KEY__;
  });
  console.log('Is authenticated:', isAuthenticated);
  console.log('Current URL:', page.url());
  
  // Click Ajouter button
  console.log('Clicking Ajouter...');
  await page.click('button.btn-success');
  await page.waitForTimeout(3000);
  
  // Check result
  const result = await page.evaluate(() => {
    const body = document.body.innerHTML.substring(0, 3000);
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"], textarea');
    const h1 = document.querySelector('.page h1');
    const editBtn = document.querySelector('.btn-edit');
    const saveBtn = document.querySelector('.btn-success');
    const deleteBtn = document.querySelector('.btn-danger');
    const emptyState = document.querySelector('.empty-state');
    
    return {
      url: window.location.href,
      inputCount: inputs.length,
      inputTypes: Array.from(inputs).map(i => i.type),
      h1Text: h1 ? h1.innerText : 'NO H1',
      hasEditBtn: !!editBtn,
      hasSaveBtn: !!saveBtn,
      hasDeleteBtn: !!deleteBtn,
      hasEmptyState: !!emptyState,
      hasForm: body.includes('Nom du service') || body.includes('Nouveau Service'),
    };
  });
  
  console.log('URL:', result.url);
  console.log('Input count:', result.inputCount);
  console.log('Input types:', result.inputTypes);
  console.log('H1 text:', result.h1Text);
  console.log('Has edit button:', result.hasEditBtn);
  console.log('Has save button:', result.hasSaveBtn);
  console.log('Has delete button:', result.hasDeleteBtn);
  console.log('Has empty state:', result.hasEmptyState);
  console.log('Has form:', result.hasForm);
  
  // If we see the form, try to fill it
  if (result.hasForm && result.hasEditBtn) {
    console.log('\n=== FILLING THE FORM ===');
    await page.fill('input[type="text"]', 'Mon Service Test');
    await page.fill('input[type="password"]', 'testpass');
    await page.click('.btn-edit'); // Switch to edit mode if in view mode
    await page.waitForTimeout(2000);
    
    const afterFill = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
      const saveBtn = document.querySelector('.btn-success');
      return {
        inputCount: inputs.length,
        hasSaveBtn: !!saveBtn,
        firstInputValue: inputs[0]?.value || '',
        body: document.body.innerHTML.substring(0, 500),
      };
    });
    console.log('After fill:', JSON.stringify(afterFill));
  }
  
  // Screenshot
  await page.screenshot({ path: '/home/ubuntu/dev/toto-gemma4-21b-google/copies-d-ecrans/debug-ajouter-fix.png', fullPage: true });
  console.log('Screenshot saved');
  
  await browser.close();
})();
