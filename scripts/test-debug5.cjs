const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.startsWith('[decrypt]') || text.startsWith('[ERR]')) {
      console.log('[BROWSER]', text.substring(0, 200));
    }
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
  
  // Check the record data in the page's IndexedDB
  const recordData = await page.evaluate(async () => {
    // Try to access IndexedDB directly
    return new Promise((resolve) => {
      const request = indexedDB.open('toto-gemma4-db', 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('records')) {
          db.createObjectStore('records', { keyPath: 'id', autoIncrement: true });
        }
      };
      request.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction('records', 'readonly');
        const store = tx.objectStore('records');
        const allRequest = store.getAll();
        allRequest.onsuccess = () => {
          const records = allRequest.result;
          if (records && records.length > 0) {
            resolve(JSON.stringify(records[0], null, 2).substring(0, 1000));
          } else {
            resolve('No records found');
          }
        };
      };
      request.onerror = () => resolve('DB error');
    });
  });
  console.log('\n[RECORD]', recordData);
  
  // View record
  await page.click('.btn-view');
  await page.waitForTimeout(3000);
  
  // Check decrypted values
  const afterDecrypt = await page.evaluate(() => {
    const fields = document.querySelectorAll('.field');
    const fieldData = {};
    
    fields.forEach(field => {
      const label = field.querySelector('label')?.innerText;
      const span = field.querySelector('.password-field span');
      if (label && label.includes('Pass')) {
        fieldData[label] = span?.innerText || 'no span';
      }
    });
    
    return fieldData;
  });
  console.log('[AFTER DECRYPT]', JSON.stringify(afterDecrypt, null, 2));
  
  await browser.close();
})();
