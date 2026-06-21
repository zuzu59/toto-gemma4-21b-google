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
  
  // Check Vue app internals
  const vueState = await page.evaluate(() => {
    const bodyInner = document.body.innerHTML.substring(0, 2000);
    return bodyInner;
  });
  
  console.log('Body HTML (first 2000):', vueState);
  
  // Count v-if/v-else branches
  const branches = await page.evaluate(() => {
    const comments = document.querySelectorAll('![----]');
    const vIfComments = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
    while (walker.nextNode()) {
      vIfComments.push(walker.currentNode.textContent);
    }
    return {
      commentCount: vIfComments.length,
      comments: vIfComments,
      bodyLength: document.body.innerHTML.length
    };
  });
  
  console.log('Vue comments:', JSON.stringify(branches));
  
  await browser.close();
})();
