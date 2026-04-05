const { test, expect } = require('../../fixtures');

test.describe('Settings: Habitica Tab (UI Only, no API calls)', () => {
  // 6.1
  test('should fade habitica-setting elements when ConnectHabitica is OFF; footer hidden', async ({ popupPage }) => {
    // Arrange — default USER_DATA has ConnectHabitica on; turn off via visible label, then assert
    await popupPage.openSettingsHabiticaTab();
    if (await popupPage.connectHabiticaToggle.isChecked()) {
      await popupPage.connectHabiticaLabel.click();
    }

    // Assert toggle is OFF
    await expect(popupPage.connectHabiticaToggle).not.toBeChecked();

    // Assert habitica-setting elements have reduced opacity
    const habiticaSettingEls = popupPage.habiticaSettings;
    const count = await habiticaSettingEls.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const opacity = await habiticaSettingEls.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).opacity),
      );
      expect(opacity).toBeLessThan(0.5);
    }

    // Assert uid / api-token visible but faded
    await expect(popupPage.uidInput).toBeVisible();
    await expect(popupPage.apiTokenInput).toBeVisible();

    // Assert footer not visible
    await expect(popupPage.footer).toBeHidden();
  });

  // 6.2
  test('should toggle habitica-setting opacity: ON → full opacity, OFF → faded', async ({ popupPage }) => {
    // Arrange
    await popupPage.openSettingsHabiticaTab();

    // Act – turn ON (native checkbox is CSS-hidden; use the visible label)
    if (!(await popupPage.connectHabiticaToggle.isChecked())) {
      await popupPage.connectHabiticaLabel.click();
    }

    // Assert full opacity
    const habiticaSettingEls = popupPage.habiticaSettings;
    const count = await habiticaSettingEls.count();
    for (let i = 0; i < count; i++) {
      const opacity = await habiticaSettingEls.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).opacity),
      );
      expect(opacity).toBeCloseTo(1, 1);
    }

    // Act – turn OFF
    if (await popupPage.connectHabiticaToggle.isChecked()) {
      await popupPage.connectHabiticaLabel.click();
    }

    // Assert faded again
    for (let i = 0; i < count; i++) {
      const opacity = await habiticaSettingEls.nth(i).evaluate(
        (el) => parseFloat(getComputedStyle(el).opacity),
      );
      expect(opacity).toBeLessThan(0.5);
    }
  });
});
