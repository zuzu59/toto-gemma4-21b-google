const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let allPassed = true;
  
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
  
  await page.click('.btn-view');
  await page.waitForTimeout(3000);
  
  // Debug: check what's in the page
  const debug = await page.evaluate(() => {
    const allSpans = document.querySelectorAll('.password-field span');
    const allButtons = document.querySelectorAll('.password-toggle');
    const formData = window.__REACTIVE__;
    
    return {
      passwordFieldCount: allSpans.length,
      toggleButtonCount: allButtons.length,
      spanTexts: Array.from(allSpans).map(s => s.innerText),
      buttonIcons: Array.from(allButtons).map(b => b.innerText),
      hasShh1Password: document.querySelector('.password-field')?.closest('.field')?.querySelector('label')?.innerText
    };
  });
  
  console.log('Debug:', JSON.stringify(debug, null, 2));
  
  // Try clicking toggle
  const beforeToggle = await page.evaluate(() => {
    const spans = document.querySelectorAll('.password-field span');
    return Array.from(spans).map(s => s.innerText);
  });
  console.log('Before toggle:', beforeToggle);
  
  await page.click('.password-toggle');
  await page.waitForTimeout(500);
  
  const afterToggle = await page.evaluate(() => {
    const spans = document.querySelectorAll('.password-field span');
    return Array.from(spans).map(s => s.innerText);
  });
  console.log('After toggle:', afterToggle);
  
  // Check if visiblePasswords was updated
  const reactiveCheck = await page.evaluate(() => {
    // Check if there's a reactive state we can inspect
    const app = document.querySelector('[data-v-app]');
    return {
      hasApp: !!app,
      html: app?.innerHTML?.substring(0, 500) || 'none'
    };
  });
  console.log('Reactive check:', JSON.stringify(reactiveCheck, null, 2));
  
  await browser.close();
})();
