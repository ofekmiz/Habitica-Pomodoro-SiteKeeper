const { test: historyTest, expect } = require('../../fixtures/index');
const path = require('path');

const HISTORY_FIXTURE_PATH = path.join(__dirname, '../../fixtures/data/HistoryTestData.json');

historyTest.describe('History Panel (with fixture data)', () => {
  // 10.1
  historyTest('should display non-zero history stats after loading fixture data', async ({ popupPageWithHistory: popupPage }) => {
    // Arrange
    await popupPage.clickHistory();

    // Assert
    await expect(popupPage.historyPanel).toBeVisible();

    const pomoTotalText = await popupPage.pomoTotal.textContent();
    expect(parseInt(pomoTotalText, 10)).toBeGreaterThan(0);

    const hoursTotalText = await popupPage.hoursTotal.textContent();
    expect(parseFloat(hoursTotalText)).toBeGreaterThan(0);

    const pomoAvgText = await popupPage.pomoAvg.textContent();
    expect(parseFloat(pomoAvgText)).toBeGreaterThan(0);

    const hoursAvgText = await popupPage.hoursAvg.textContent();
    expect(parseFloat(hoursAvgText)).toBeGreaterThan(0);
  });

  // 10.2
  historyTest('should render history chart canvas with Sum/Avg summary label', async ({ popupPageWithHistory: popupPage }) => {
    // Arrange
    await popupPage.clickHistory();

    // Assert
    await expect(popupPage.historyChart).toBeVisible();
    const totalText = await popupPage.historyChartTotal.textContent();
    expect(totalText).toMatch(/Sum:/i);
    expect(totalText).toMatch(/Avg:/i);
  });

  // 10.3
  historyTest('should toggle chart view: Pomodoros → Hours → Pomodoros', async ({ popupPageWithHistory: popupPage }) => {
    // Arrange
    await popupPage.clickHistory();
    const initialTotal = await popupPage.historyChartTotal.textContent();

    // Act – switch to Hours
    await popupPage.historyChartShowHours.click();
    const hoursTotal = await popupPage.historyChartTotal.textContent();
    expect(hoursTotal).not.toBe(initialTotal);

    // Act – switch back to Pomodoros
    await popupPage.historyChartShowPomodoros.click();
    const revertedTotal = await popupPage.historyChartTotal.textContent();
    expect(revertedTotal).toBe(initialTotal);
  });

  // 10.4
  historyTest('should navigate chart prev/next windows', async ({ popupPageWithHistory: popupPage }) => {
    // Arrange
    await popupPage.clickHistory();
    const currentWindowTotal = await popupPage.historyChartTotal.textContent();

    // Act – navigate to previous window
    await popupPage.historyChartPrev.click();
    const prevWindowTotal = await popupPage.historyChartTotal.textContent();
    expect(prevWindowTotal).not.toBe(currentWindowTotal);

    // Act – navigate back to current window
    await popupPage.historyChartNext.click();
    const nextWindowTotal = await popupPage.historyChartTotal.textContent();
    expect(nextWindowTotal).toBe(currentWindowTotal);
  });

  // 10.5
  historyTest('should show Full History & Backup link and open fullHistory.html in new tab', async ({ popupPageWithHistory: popupPage, extensionContext }) => {
    // Arrange
    await popupPage.clickHistory();
    await expect(popupPage.fullHistoryLink).toBeVisible();

    // Act
    const [newTab] = await Promise.all([
      extensionContext.waitForEvent('page'),
      popupPage.fullHistoryLink.click(),
    ]);

    // Assert
    await newTab.waitForLoadState('domcontentloaded');
    expect(newTab.url()).toMatch(/fullHistory\.html/);
    await newTab.close();
  });

  // 10.6
  historyTest('should display backup data warning in the history panel', async ({ popupPageWithHistory: popupPage }) => {
    // Arrange
    await popupPage.clickHistory();

    // Assert
    await expect(popupPage.backupDataWarning).toBeVisible();
  });

  // 10.7
  historyTest('should trigger download when download-histogram is clicked', async ({ popupPageWithHistory: popupPage }) => {
    // Arrange
    await popupPage.clickHistory();

    // Set up download listener
    const [download] = await Promise.all([
      popupPage.page.waitForEvent('download'),
      popupPage.downloadHistogram.click(),
    ]);

    // Assert download triggered
    expect(download).toBeTruthy();
    expect(download.suggestedFilename()).toMatch(/histogram|history/i);
  });

  // 10.8
  historyTest('should import fixture JSON and show non-zero stats; clear resets all to 0', async ({ popupPageWithHistory: popupPage }) => {
    // Arrange
    await popupPage.clickHistory();

    // Act – import via file input
    await popupPage.importHistogramFile.setInputFiles(HISTORY_FIXTURE_PATH);
    await popupPage.importHistogramButton.click();

    // Assert non-zero after import
    const pomoTotalAfterImport = await popupPage.pomoTotal.textContent();
    expect(parseInt(pomoTotalAfterImport, 10)).toBeGreaterThan(0);

    // Act – clear
    await popupPage.clearHistogram.click();

    // Assert reset to 0
    await expect(popupPage.pomoTotal).toHaveText('0');
    await expect(popupPage.hoursTotal).toHaveText('0');
    await expect(popupPage.pomoAvg).toHaveText('0');
  });
});
