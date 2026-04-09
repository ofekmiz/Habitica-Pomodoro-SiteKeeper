/**
 * Capture a failure screenshot and attach it to the test report.
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').TestInfo} testInfo
 */
async function attachFailureScreenshot(page, testInfo) {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshotPath = testInfo.outputPath('failure.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await testInfo.attach('failure screenshot', { path: screenshotPath, contentType: 'image/png' });
  }
}

module.exports = { attachFailureScreenshot };
