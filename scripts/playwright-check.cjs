const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:4173');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 14);
    await page.screenshot({ path: path.join(__dirname, `../copies-d-ecrans/home-${timestamp}.png`) });
    console.log(`Screenshot saved to copies-d-ecrans/home-${timestamp}.png`);
  } catch (error) {
    console.error('Error during screenshot:', error);
  } finally {
    await browser.close();
  }
})();
