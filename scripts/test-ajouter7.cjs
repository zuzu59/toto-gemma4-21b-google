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
  
  console.log('=== TEST 1: Click Ajouter ===');
  await page.click('button.btn-success');
  await page.waitForTimeout(3000);
  
  const formOk = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"], textarea');
    const h1 = document.querySelector('.page h1')?.innerText;
    const saveBtn = document.querySelector('.btn-success');
    return { inputs: inputs.length, h1: h1, saveBtn: !!saveBtn };
  });
  console.log('Form loaded:', JSON.stringify(formOk));
  
  // Fill first 4 fields (Nom, IP, URL, Description)
  console.log('\n=== TEST 2: Fill form ===');
  const allInputs = await page.$$('input[type="text"], input[type="password"], textarea');
  console.log('Total inputs:', allInputs.length);
  
  if (allInputs.length >= 4) {
    await allInputs[0].fill('Proxmox Main');
    await allInputs[1].fill('192.168.1.1');
    await allInputs[2].fill('https://proxmox.local');
    await allInputs[3].fill('Serveur principal');
    console.log('Form filled');
  }
  
  // Click save
  console.log('\n=== TEST 3: Save ===');
  await page.click('.btn-success');
  await page.waitForTimeout(3000);
  
  const afterSave = await page.evaluate(() => {
    return {
      url: window.location.href,
      rowCount: document.querySelectorAll('.records-table tbody tr').length,
    };
  });
  console.log('After save:', JSON.stringify(afterSave));
  
  // Verify record in list
  console.log('\n=== TEST 4: Record visible ===');
  const recordVisible = await page.evaluate(() => {
    const rows = document.querySelectorAll('.records-table tbody tr');
    return {
      count: rows.length,
      name: rows[0]?.querySelector('.col-name')?.innerText,
      ip: rows[0]?.querySelector('.col-ip')?.innerText,
      url: rows[0]?.querySelector('.col-url')?.innerText,
    };
  });
  console.log('Record:', JSON.stringify(recordVisible));
  
  // View the record
  console.log('\n=== TEST 5: View record ===');
  await page.click('.btn-view');
  await page.waitForTimeout(3000);
  
  const viewOk = await page.evaluate(() => {
    const h1 = document.querySelector('.page h1')?.innerText;
    const editBtn = document.querySelector('.btn-edit');
    const deleteBtn = document.querySelector('.btn-danger');
    return { h1: h1, hasEdit: !!editBtn, hasDelete: !!deleteBtn };
  });
  console.log('View record:', JSON.stringify(viewOk));
  
  // Edit the record
  console.log('\n=== TEST 6: Edit ===');
  await page.click('.btn-edit');
  await page.waitForTimeout(2000);
  
  const editOk = await page.evaluate(() => {
    const saveBtn = document.querySelector('.btn-success');
    const editBtn = document.querySelector('.btn-edit');
    return { hasSave: !!saveBtn, hasEdit: !!editBtn };
  });
  console.log('Edit mode:', JSON.stringify(editOk));
  
  // Modify and save
  const inputs = await page.$$('input[type="text"]');
  if (inputs.length > 0) {
    await inputs[0].fill('Proxmox Main MODIFIED');
    await page.click('.btn-success');
    await page.waitForTimeout(2000);
  }
  
  const finalCheck = await page.evaluate(() => {
    const rows = document.querySelectorAll('.records-table tbody tr');
    return {
      rowCount: rows.length,
      name: rows[0]?.querySelector('.col-name')?.innerText,
    };
  });
  console.log('\n=== TEST 7: Final ===', JSON.stringify(finalCheck));
  
  // Screenshot
  await page.screenshot({ path: '/home/ubuntu/dev/toto-gemma4-21b-google/copies-d-ecrans/test-ajouter-complete2.png', fullPage: true });
  
  // Summary
  const allPassed = formOk.inputs >= 18 && afterSave.rowCount >= 1 && recordVisible.count >= 1;
  console.log('\n=== RESULT:', allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED', '===');
  
  await browser.close();
})();
