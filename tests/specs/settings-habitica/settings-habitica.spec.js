const { test, expect } = require('../../fixtures');

test.describe('Settings: Habitica Tab (UI Only, no API calls)', () => {
  // 6.1
  test('should fade habitica-setting elements when ConnectHabitica is OFF; footer hidden', async ({ popupPage }) => {
    await popupPage.openSettingsHabiticaTab();
    if (await popupPage.connectHabiticaToggle.isChecked()) {
      await popupPage.connectHabiticaLabel.click();
    }

    await expect(popupPage.connectHabiticaToggle).not.toBeChecked();

    const habiticaSettingEls = popupPage.habiticaSettings;
    const count = await habiticaSettingEls.count();
    expect(count).toBeGreaterThan(0);

    await expect
      .poll(
        () =>
          habiticaSettingEls.evaluateAll((els) =>
            Math.max(0, ...els.map((el) => parseFloat(getComputedStyle(el).opacity))),
          ),
        { timeout: 5_000, interval: 1_000 },
      )
      .toBeLessThan(0.5);

    await expect(popupPage.uidInput).toBeVisible();
    await expect(popupPage.apiTokenInput).toBeVisible();

    await expect(popupPage.footer).toBeHidden();
  });

  // 6.2
  test('should toggle habitica-setting opacity: ON → full opacity, OFF → faded', async ({ popupPage }) => {
    await popupPage.openSettingsHabiticaTab();

    if (!(await popupPage.connectHabiticaToggle.isChecked())) {
      await popupPage.connectHabiticaLabel.click();
    }

    await expect
      .poll(
        () =>
          popupPage.habiticaSettings.evaluateAll((els) =>
            Math.min(...els.map((el) => parseFloat(getComputedStyle(el).opacity))),
          ),
        { timeout: 5_000, interval: 1_000 },
      )
      .toBeGreaterThan(0.99);

    if (await popupPage.connectHabiticaToggle.isChecked()) {
      await popupPage.connectHabiticaLabel.click();
    }

    await expect
      .poll(
        () =>
          popupPage.habiticaSettings.evaluateAll((els) =>
            Math.max(0, ...els.map((el) => parseFloat(getComputedStyle(el).opacity))),
          ),
        { timeout: 5_000, interval: 1_000 },
      )
      .toBeLessThan(0.5);
  });
});
