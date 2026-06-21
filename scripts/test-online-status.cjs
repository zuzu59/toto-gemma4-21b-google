const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    const text = msg.text();
    if (text && (text.includes('Error') || text.includes('error'))) console.log('[ERR]', text);
  });
  
  console.log('=== TEST 1: Online status indicator ===');
  
  // Navigate to the app
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  // Check if status indicator exists
  const hasStatus = await page.evaluate(() => {
    const indicator = document.querySelector('.status-indicator');
    return {
      exists: !!indicator,
      text: indicator?.innerText || 'N/A',
      dotClass: indicator?.querySelector('.status-dot')?.className || 'N/A'
    };
  });
  
  console.log('Status indicator:', JSON.stringify(hasStatus));
  
  if (hasStatus.exists) {
    console.log('✅ Status indicator exists');
    if (hasStatus.text.includes('Connecté')) {
      console.log('✅ Shows "Connecté" when online');
    } else {
      console.log('❌ Does not show "Connecté"');
    }
    if (hasStatus.dotClass.includes('online')) {
      console.log('✅ Dot has "online" class');
    } else {
      console.log('❌ Dot missing "online" class');
    }
  } else {
    console.log('❌ Status indicator not found');
  }
  
  // Take screenshot
  await page.screenshot({ path: '/home/ubuntu/dev/toto-gemma4-21b-google/copies-d-ecrans/test-online-status.png', fullPage: true });
  console.log('\nScreenshot saved');
  
  await browser.close();
})();
