/**
 * Locators for an ordinary browser tab (not the extension popup).
 */
class ContentPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  get body() {
    return this.page.locator('body');
  }
}

module.exports = { ContentPage };
