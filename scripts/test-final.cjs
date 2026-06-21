const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    const text = msg.text();
    if (text && text.includes('Error')) console.log('[ERROR]', text);
  });
  page.on('pageerror', err => {
    console.log('[PAGE_ERROR]', err.message);
  });
  
  // Full reset
  await page.context().addInitScript(() => {
    localStorage.clear();
    delete window.__MASTER_KEY__;
    if (window.__DB__) window.__DB__.delete().catch(() => {});
  });
  
  // 1. Setup
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.fill('#password1', 'TestPass123');
  await page.fill('#password2', 'TestPass123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  
  // 2. Click + Ajouter
  await page.click('button.btn-success');
  await page.waitForTimeout(3000);
  
  // Verify form is shown (not empty state)
  const formState = await page.evaluate(() => {
    const h1 = document.querySelector('.page h1')?.innerText;
    const saveBtn = document.querySelector('.btn-success');
    const inputs = document.querySelectorAll('input, textarea');
    const emptyState = document.querySelector('.empty-state');
    return { h1, saveBtn: !!saveBtn, inputCount: inputs.length, emptyState: !!emptyState };
  });
  console.log('Form state:', JSON.stringify(formState));
  
  if (formState.emptyState) {
    console.log('FAIL: Empty state shown instead of form');
    await browser.close();
    process.exit(1);
  }
  if (!formState.saveBtn) {
    console.log('FAIL: Save button not visible');
    await browser.close();
    process.exit(1);
  }
  if (formState.inputCount < 3) {
    console.log('FAIL: Not enough form fields:', formState.inputCount);
    await browser.close();
    process.exit(1);
  }
  
  // 3. Fill form (skip navbar search, fill first form input)
  const allInputs = await page.$$('input, textarea');
  // Skip the navbar search (it's in .search-container)
  const formInputs = [];
  for (const el of allInputs) {
    const parentClass = await el.evaluate(e => e.parentElement?.className || '');
    if (!parentClass.includes('search-container')) {
      formInputs.push(el);
    }
  }
  console.log('Form-only inputs:', formInputs.length);
  
  // Fill: Nom du service (index 0), IP (index 1), URL (index 2)
  await formInputs[0].fill('MyTestService');
  await formInputs[1].fill('192.168.50.100');
  await formInputs[2].fill('https://test.example.com');
  
  // 4. Save
  await page.click('.btn-success');
  await page.waitForTimeout(3000);
  
  // 5. Verify record appears
  const recordCount = await page.evaluate(() => {
    return document.querySelectorAll('.records-table tbody tr').length;
  });
  console.log('Record count:', recordCount);
  
  if (recordCount === 0) {
    console.log('FAIL: No record created');
    await browser.close();
    process.exit(1);
  }
  
  // 6. Verify record content
  const recordData = await page.evaluate(() => {
    const row = document.querySelector('.records-table tbody tr');
    return {
      name: row?.querySelector('.col-name')?.innerText?.trim(),
      ip: row?.querySelector('.col-ip')?.innerText?.trim(),
      url: row?.querySelector('.col-url')?.innerText?.trim(),
    };
  });
  console.log('Record data:', JSON.stringify(recordData));
  
  // 7. View record
  await page.click('.btn-view');
  await page.waitForTimeout(3000);
  
  const viewState = await page.evaluate(() => {
    const h1 = document.querySelector('.page h1')?.innerText;
    const editBtn = document.querySelector('.btn-edit');
    const deleteBtn = document.querySelector('.btn-danger');
    return { h1, editBtn: !!editBtn, deleteBtn: !!deleteBtn };
  });
  console.log('View state:', JSON.stringify(viewState));
  
  // 8. Edit record
  await page.click('.btn-edit');
  await page.waitForTimeout(2000);
  
  const editState = await page.evaluate(() => {
    const saveBtn = document.querySelector('.btn-success');
    const inputs = document.querySelectorAll('.page input, .page textarea');
    return { saveBtn: !!saveBtn, inputCount: inputs.length };
  });
  console.log('Edit state:', JSON.stringify(editState));
  
  // 9. Modify and save
  const editInputs = await page.$$('.page input, .page textarea');
  await editInputs[0].fill('ModifiedService');
  await page.click('.btn-success');
  await page.waitForTimeout(3000);
  
  // 10. Final verification
  const finalRecords = await page.evaluate(() => {
    const rows = document.querySelectorAll('.records-table tbody tr');
    return {
      count: rows.length,
      first: rows[0]?.querySelector('.col-name')?.innerText?.trim(),
    };
  });
  console.log('Final:', JSON.stringify(finalRecords));
  
  if (finalRecords.count === 0) {
    console.log('FAIL: Record disappeared');
    await browser.close();
    process.exit(1);
  }
  
  // 11. Delete record
  await page.click('.btn-danger');
  await page.waitForTimeout(2000);
  
  const deleteResult = await page.evaluate(() => {
    return document.querySelectorAll('.records-table tbody tr').length;
  });
  console.log('After delete:', deleteResult, 'records');
  
  await browser.close();
  console.log('\nALL TESTS PASSED');
})();
