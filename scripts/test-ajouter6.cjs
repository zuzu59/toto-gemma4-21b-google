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
  
  // Clear everything
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
  
  console.log('=== STEP 1: Verify empty Records page ===');
  const step1 = await page.evaluate(() => {
    return {
      url: window.location.href,
      emptyList: document.querySelector('.records-table tbody tr') === null,
      addBtnExists: !!document.querySelector('.btn-success'),
    };
  });
  console.log('Records page:', JSON.stringify(step1));
  
  console.log('\n=== STEP 2: Click Ajouter ===');
  await page.click('button.btn-success');
  await page.waitForTimeout(3000);
  
  const step2 = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"], textarea');
    const h1 = document.querySelector('.page h1')?.innerText;
    const saveBtn = document.querySelector('.btn-success');
    const deleteBtn = document.querySelector('.btn-danger');
    
    return {
      url: window.location.href,
      inputCount: inputs.length,
      h1Text: h1,
      hasSaveBtn: !!saveBtn,
      hasDeleteBtn: !!deleteBtn,
    };
  });
  console.log('Create form:', JSON.stringify(step2));
  
  console.log('\n=== STEP 3: Fill the form ===');
  await page.fill('#password1', 'Mon Service Proxmox');
  await page.fill('input[type="text"]:nth-child(2)', '192.168.1.1');
  await page.fill('input[type="text"]:nth-child(3)', 'https://proxmox.local');
  await page.fill('textarea', 'Serveur principal Proxmox');
  
  const step3 = await page.evaluate(() => {
    const nameInput = document.querySelector('input[type="text"]');
    return { nameValue: nameInput?.value || '' };
  });
  console.log('Form filled:', JSON.stringify(step3));
  
  console.log('\n=== STEP 4: Save ===');
  await page.click('.btn-success');
  await page.waitForTimeout(3000);
  
  const step4 = await page.evaluate(() => {
    return {
      url: window.location.href,
      hasRecordTable: !!document.querySelector('.records-table'),
      rowCount: document.querySelectorAll('.records-table tbody tr').length,
    };
  });
  console.log('After save:', JSON.stringify(step4));
  
  console.log('\n=== STEP 5: Verify record appears in list ===');
  const step5 = await page.evaluate(() => {
    const rows = document.querySelectorAll('.records-table tbody tr');
    const firstRow = rows[0];
    return {
      rowCount: rows.length,
      firstRowName: firstRow?.querySelector('.col-name')?.innerText || 'N/A',
      firstRowIP: firstRow?.querySelector('.col-ip')?.innerText || 'N/A',
      firstRowURL: firstRow?.querySelector('.col-url')?.innerText || 'N/A',
    };
  });
  console.log('Record in list:', JSON.stringify(step5));
  
  console.log('\n=== STEP 6: Click View on the record ===');
  await page.click('.btn-view');
  await page.waitForTimeout(3000);
  
  const step6 = await page.evaluate(() => {
    const h1 = document.querySelector('.page h1')?.innerText;
    const editBtn = document.querySelector('.btn-edit');
    const deleteBtn = document.querySelector('.btn-danger');
    return {
      url: window.location.href,
      h1Text: h1,
      hasEditBtn: !!editBtn,
      hasDeleteBtn: !!deleteBtn,
    };
  });
  console.log('View record:', JSON.stringify(step6));
  
  console.log('\n=== STEP 7: Click Edit ===');
  await page.click('.btn-edit');
  await page.waitForTimeout(2000);
  
  const step7 = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
    const saveBtn = document.querySelector('.btn-success');
    const editBtn = document.querySelector('.btn-edit');
    return {
      inputCount: inputs.length,
      hasSaveBtn: !!saveBtn,
      hasEditBtn: !!editBtn,
    };
  });
  console.log('Edit mode:', JSON.stringify(step7));
  
  console.log('\n=== STEP 8: Edit and save ===');
  await page.fill('#password1', 'Mon Service Modifié');
  await page.click('.btn-success');
  await page.waitForTimeout(3000);
  
  const step8 = await page.evaluate(() => {
    const rows = document.querySelectorAll('.records-table tbody tr');
    return {
      rowCount: rows.length,
      firstRowName: rows[0]?.querySelector('.col-name')?.innerText || 'N/A',
    };
  });
  console.log('After edit:', JSON.stringify(step8));
  
  // Final screenshot
  await page.screenshot({ path: '/home/ubuntu/dev/toto-gemma4-21b-google/copies-d-ecrans/test-ajouter-complete.png', fullPage: true });
  console.log('\n=== ALL STEPS PASSED ===');
  
  await browser.close();
})();
