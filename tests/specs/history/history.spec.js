const { test: historyTest, expect } = require('../../fixtures/index');
const { loadRemappedHistogramForPage } = require('../../fixtures/historyFixture');

historyTest.describe('History Panel (with fixture data)', () => {
  // 10.1
  historyTest('should display non-zero history stats after loading fixture data', async ({ popupPageWithHistory: popupPage }) => {
    await popupPage.openHistoryPanel();
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
    await popupPage.openHistoryPanel();

    await expect(popupPage.historyChart).toBeVisible();
    const totalText = await popupPage.historyChartTotal.textContent();
    expect(totalText).toMatch(/Sum:/i);
    expect(totalText).toMatch(/Avg:/i);
  });

  // 10.3
  historyTest('should toggle chart view: Pomodoros → Hours → Pomodoros', async ({ popupPageWithHistory: popupPage }) => {
    await popupPage.openHistoryPanel();
    const initialTotal = await popupPage.historyChartTotal.textContent();

    await popupPage.historyChartShowHours.click();
    const hoursTotal = await popupPage.historyChartTotal.textContent();
    expect(hoursTotal).not.toBe(initialTotal);

    await popupPage.historyChartShowPomodoros.click();
    const revertedTotal = await popupPage.historyChartTotal.textContent();
    expect(revertedTotal).toBe(initialTotal);
  });

  // 10.4
  historyTest('should navigate chart prev/next windows', async ({ popupPageWithHistory: popupPage }) => {
    await popupPage.openHistoryPanel();
    const currentWindowTotal = await popupPage.historyChartTotal.textContent();

    await popupPage.historyChartPrev.click();
    const prevWindowTotal = await popupPage.historyChartTotal.textContent();
    expect(prevWindowTotal).not.toBe(currentWindowTotal);

    await popupPage.historyChartNext.click();
    const nextWindowTotal = await popupPage.historyChartTotal.textContent();
    expect(nextWindowTotal).toBe(currentWindowTotal);
  });

  // 10.5
  historyTest('should show Full History & Backup link and open fullHistory.html in new tab', async ({ popupPageWithHistory: popupPage, extensionContext }) => {
    await popupPage.openHistoryPanel();
    await expect(popupPage.fullHistoryLink).toBeVisible();

    const [newTab] = await Promise.all([
      extensionContext.waitForEvent('page'),
      popupPage.fullHistoryLink.click(),
    ]);

    await newTab.waitForLoadState('domcontentloaded');
    expect(newTab.url()).toMatch(/fullHistory\.html/);
    // Cleanup
    await newTab.close();
  });

  // 10.6
  historyTest('should display backup data warning in the history panel', async ({ popupPageWithHistory: popupPage }) => {
    await popupPage.openHistoryPanel();

    await expect(popupPage.backupDataWarning).toBeVisible();
  });

  // 10.7
  historyTest('should trigger download when download-histogram is clicked', async ({ popupPageWithHistory: popupPage }) => {
    await popupPage.openHistoryPanel();

    const [download] = await Promise.all([
      popupPage.page.waitForEvent('download'),
      popupPage.downloadHistogram.click(),
    ]);

    expect(download).toBeTruthy();
    expect(download.suggestedFilename()).toMatch(/histogram|history/i);
  });

  // 10.8
  historyTest('should import fixture JSON and show non-zero stats; clear resets all to 0', async ({ popupPageWithHistory: popupPage }) => {
    await popupPage.openHistoryPanel();

    const remapped = await loadRemappedHistogramForPage(popupPage.page);
    await popupPage.importHistogramFile.setInputFiles({
      name: 'Histogram.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(remapped)),
    });
    await popupPage.importHistogramButton.click();
    await popupPage.waitForReady();
    //BUG -> this is a workaround should not be needed to open the history panel again
    await popupPage.openHistoryPanel();
    const pomoTotalAfterImport = await popupPage.pomoTotal.textContent();
    expect(parseInt(pomoTotalAfterImport, 10)).toBeGreaterThan(0);

    await popupPage.clearHistogram.click();
    //BUG -> this is a workaround should not be needed to open the history panel again
    await popupPage.openHistoryPanel();

    await expect(popupPage.pomoToday).toHaveText('0');
    await expect(popupPage.hoursToday).toHaveText('0');
    await expect(popupPage.pomoTotal).toHaveText('0');
    await expect(popupPage.hoursTotal).toHaveText('0.0');
    await expect(popupPage.pomoAvg).toHaveText('0.0');
    await expect(popupPage.hoursAvg).toHaveText('0.0');
  });
});
