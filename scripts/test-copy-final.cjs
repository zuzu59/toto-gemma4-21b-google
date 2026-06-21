const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    const text = msg.text();
    if (text && (text.includes('Error') || text.includes('error'))) console.log('[ERR]', text);
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
  
  // Create record
  await page.click('button.btn-success');
  await page.waitForTimeout(3000);
  
  // Fill ONLY some fields
  const allInputs = await page.$$('input, textarea');
  const formInputs = [];
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
  
  // Only fill: Nom(0), IP(1), URL(2), SSH1User(6), SSH1String(8), SSH2User(9), HTML1User(12), HTML2User(15)
  // Leave passwords, strings, description, tags, note EMPTY
  const fillField = async (el, val) => {
    await el.click();
    await el.press('Control+a');
    await el.press('Backspace');
    await el.type(val);
    await page.waitForTimeout(100);
  };
  
  await fillField(formInputs[0], 'MonService');   // Nom
  await fillField(formInputs[1], '192.168.1.1');  // IP
  await fillField(formInputs[2], 'https://test.com'); // URL
  // Skip description, tags, note
  await fillField(formInputs[6], 'admin');        // SSH1 User
  // SSH1 Pass EMPTY
  await fillField(formInputs[8], 'ssh admin@1.1'); // SSH1 String
  await fillField(formInputs[9], 'user2');        // SSH2 User
  // SSH2 Pass EMPTY
  // SSH2 String EMPTY
  await fillField(formInputs[12], 'htmluser1');   // HTML1 User
  // HTML1 Pass EMPTY
  // HTML1 String EMPTY
  await fillField(formInputs[15], 'htmluser2');   // HTML2 User
  // HTML2 Pass EMPTY
  // HTML2 String EMPTY
  
  console.log('Form filled - only some fields have data');
  
  // Save
  await page.click('.btn-success');
  await page.waitForTimeout(3000);
  
  // Verify record
  const count = await page.evaluate(() => document.querySelectorAll('.records-table tbody tr').length);
  console.log('Record count:', count);
  
  // View record
  await page.click('.btn-view');
  await page.waitForTimeout(3000);
  
  // Check copy buttons in VIEW mode
  const viewButtons = await page.evaluate(() => {
    const buttons = document.querySelectorAll('.page .btn-copy');
    return Array.from(buttons).map(b => ({
      label: b.parentElement?.querySelector('label')?.innerText || 
             b.parentElement?.previousElementSibling?.innerText || 'N/A',
      text: b.innerText,
      parentHTML: b.parentElement?.innerHTML?.substring(0, 100) || 'N/A'
    }));
  });
  console.log('\n=== VIEW MODE COPY BUTTONS ===');
  console.log('Count:', viewButtons.length);
  viewButtons.forEach(b => console.log(`  - ${b.label}: ${b.text}`));
  
  // Count non-empty fields that should have buttons
  const expectedFields = [
    'Nom du service', 'IP', 'URL',
    'SSH 1 User', 'SSH 1 Pass', 'SSH 1 String',
    'SSH 2 User', 'SSH 2 Pass', 'SSH 2 String',
    'HTML 1 User', 'HTML 1 Pass', 'HTML 1 String',
    'HTML 2 User', 'HTML 2 Pass', 'HTML 2 String'
  ];
  // Fields with data: Nom, IP, URL, SSH1User, SSH1String, SSH2User, HTML1User, HTML2User = 8
  // Fields without data: SSH1Pass, SSH2Pass, SSH2String, HTML1Pass, HTML1String, HTML2Pass, HTML2String = 7
  const expectedCount = 8;
  console.log(`\nExpected buttons (non-empty fields): ${expectedCount}`);
  console.log(`Actual buttons: ${viewButtons.length}`);
  
  if (viewButtons.length === expectedCount) {
    console.log('✅ COPY BUTTONS CORRECT - only on non-empty fields');
  } else {
    console.log('❌ MISMATCH - button count wrong');
    console.log('Fields with data: Nom, IP, URL, SSH1User, SSH1String, SSH2User, HTML1User, HTML2User');
  }
  
  // Check edit mode
  await page.click('.btn-edit');
  await page.waitForTimeout(2000);
  
  const editButtons = await page.evaluate(() => {
    const buttons = document.querySelectorAll('.page .btn-copy');
    return Array.from(buttons).map(b => ({
      label: b.parentElement?.querySelector('label')?.innerText || 'N/A',
      text: b.innerText,
    }));
  });
  console.log('\n=== EDIT MODE COPY BUTTONS ===');
  console.log('Count:', editButtons.length);
  editButtons.forEach(b => console.log(`  - ${b.label}: ${b.text}`));
  
  // Screenshot
  await page.screenshot({ path: '/home/ubuntu/dev/toto-gemma4-21b-google/copies-d-ecrans/test-copy-buttons-final.png', fullPage: true });
  console.log('\nScreenshot saved');
  
  await browser.close();
})();
