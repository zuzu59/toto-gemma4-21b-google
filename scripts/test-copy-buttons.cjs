const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    const text = msg.text();
    if (text && (text.includes('Error') || text.includes('error'))) console.log('[ERROR]', text);
  });
  
  // Full reset
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
  
  // Create a record
  await page.click('button.btn-success');
  await page.waitForTimeout(3000);
  
  // Get all inputs excluding navbar search
  const allInputs = await page.$$('input, textarea');
  let formInputs = [];
  for (const el of allInputs) {
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
  
  console.log('Total form inputs:', formInputs.length);
  
  // Fill fields
  const fillField = async (input, value) => {
    const type = await input.evaluate(el => el.type);
    await input.click();
    await input.press('Control+a');
    await input.press('Backspace');
    await input.type(value);
    await page.waitForTimeout(100);
  };
  
  // Fill: Nom, IP, URL, SSH1User, SSH1Pass, SSH1String, SSH2User, SSH2Pass, 
  //       HTML1User, HTML1Pass, HTML2User, HTML2Pass
  await fillField(formInputs[0], 'MonProxmox');
  await fillField(formInputs[1], '192.168.1.1');
  await fillField(formInputs[2], 'https://proxmox.local');
  // Skip description, tags, note
  await fillField(formInputs[6], 'admin');
  await fillField(formInputs[7], 'secretpass1');
  await fillField(formInputs[8], 'ssh admin@192.168.1.1');
  await fillField(formInputs[9], 'user2');
  await fillField(formInputs[10], 'pass2');
  await fillField(formInputs[11], 'ssh user2@192.168.1.2');
  await fillField(formInputs[12], 'htmluser1');
  await fillField(formInputs[13], 'htmlpass1');
  await fillField(formInputs[15], 'htmluser2');
  await fillField(formInputs[16], 'htmlpass2');
  
  console.log('Form filled');
  
  // Save
  await page.click('.btn-success');
  await page.waitForTimeout(3000);
  
  // Verify record
  const recordCount = await page.evaluate(() => {
    return document.querySelectorAll('.records-table tbody tr').length;
  });
  console.log('Record count:', recordCount);
  
  // Click View
  await page.click('.btn-view');
  await page.waitForTimeout(3000);
  
  // Check copy buttons in view mode
  console.log('\n=== COPY BUTTONS IN VIEW MODE ===');
  const viewButtons = await page.evaluate(() => {
    const buttons = document.querySelectorAll('.page .btn-copy');
    return Array.from(buttons).map(b => ({
      text: b.innerText,
      parentText: b.parentElement?.innerText?.trim().substring(0, 50) || ''
    }));
  });
  console.log('Count:', viewButtons.length);
  viewButtons.forEach((b, i) => console.log(`  [${i}] ${b.text}: ${b.parentText}`));
  
  const expectedViewButtons = 13;
  if (viewButtons.length === expectedViewButtons) {
    console.log(`✅ Correct number of view mode buttons: ${expectedViewButtons}`);
  } else {
    console.log(`❌ Wrong view mode count: ${viewButtons.length} (expected ${expectedViewButtons})`);
  }
  
  // Test copy
  console.log('\n=== COPY TEST ===');
  const firstBtn = await page.$('.btn-copy');
  if (firstBtn) {
    await firstBtn.click();
    await page.waitForTimeout(100);
    const btnText = await page.evaluate(() => document.querySelector('.btn-copy')?.innerText);
    console.log('After click:', btnText);
    
    await page.waitForTimeout(2500);
    const revertText = await page.evaluate(() => document.querySelector('.btn-copy')?.innerText);
    console.log('After 2.5s:', revertText);
    
    if (btnText === 'Copié' && revertText === 'Copier') {
      console.log('✅ Copy functionality works!');
    }
  }
  
  // Check edit mode
  console.log('\n=== COPY BUTTONS IN EDIT MODE ===');
  await page.click('.btn-edit');
  await page.waitForTimeout(2000);
  
  const editButtons = await page.evaluate(() => {
    const buttons = document.querySelectorAll('.page .btn-copy');
    return Array.from(buttons).map(b => ({
      text: b.innerText,
      parentText: b.parentElement?.innerText?.trim().substring(0, 50) || ''
    }));
  });
  console.log('Count:', editButtons.length);
  editButtons.forEach((b, i) => console.log(`  [${i}] ${b.text}: ${b.parentText}`));
  
  const expectedEditButtons = 13;
  if (editButtons.length === expectedEditButtons) {
    console.log(`✅ Correct number of edit mode buttons: ${expectedEditButtons}`);
  } else {
    console.log(`❌ Wrong edit mode count: ${editButtons.length} (expected ${expectedEditButtons})`);
  }
  
  // Screenshot
  await page.screenshot({ path: '/home/ubuntu/dev/toto-gemma4-21b-google/copies-d-ecrans/test-copy-buttons.png', fullPage: true });
  console.log('\nScreenshot saved');
  
  await browser.close();
})();
