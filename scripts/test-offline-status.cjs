const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('=== TEST: Offline status simulation ===');
  
  // Navigate to the app
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  // Verify online state
  const onlineState = await page.evaluate(() => {
    const indicator = document.querySelector('.status-indicator');
    return {
      text: indicator?.innerText || 'N/A',
      dotClass: indicator?.querySelector('.status-dot')?.className || 'N/A'
    };
  });
  console.log('Online:', JSON.stringify(onlineState));
  
  // Simulate offline
  await page.evaluate(() => {
    window.dispatchEvent(new Event('offline'));
  });
  await page.waitForTimeout(500);
  
  // Verify offline state
  const offlineState = await page.evaluate(() => {
    const indicator = document.querySelector('.status-indicator');
    return {
      text: indicator?.innerText || 'N/A',
      dotClass: indicator?.querySelector('.status-dot')?.className || 'N/A'
    };
  });
  console.log('Offline:', JSON.stringify(offlineState));
  
  if (offlineState.text.includes('Hors ligne')) {
    console.log('✅ Shows "Hors ligne" when offline');
  } else {
    console.log('❌ Does not show "Hors ligne"');
  }
  if (offlineState.dotClass.includes('offline')) {
    console.log('✅ Dot has "offline" class');
  } else {
    console.log('❌ Dot missing "offline" class');
  }
  
  // Simulate online again
  await page.evaluate(() => {
    window.dispatchEvent(new Event('online'));
  });
  await page.waitForTimeout(500);
  
  const restoredState = await page.evaluate(() => {
    const indicator = document.querySelector('.status-indicator');
    return {
      text: indicator?.innerText || 'N/A',
      dotClass: indicator?.querySelector('.status-dot')?.className || 'N/A'
    };
  });
  console.log('Restored:', JSON.stringify(restoredState));
  
  if (restoredState.text.includes('Connecté')) {
    console.log('✅ Restores "Connecté" when back online');
  } else {
    console.log('❌ Does not restore "Connecté"');
  }
  
  // Screenshot
  await page.screenshot({ path: '/home/ubuntu/dev/toto-gemma4-21b-google/copies-d-ecrans/test-offline-status.png', fullPage: true });
  console.log('\nScreenshot saved');
  
  await browser.close();
})();
