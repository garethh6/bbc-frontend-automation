import { chromium } from 'playwright';
import assert from 'assert';

export class BbcSportHomePage {
  browser: any;
  page: any;

  async openHomePage() {
    this.browser = await chromium.launch({ headless: process.env.HEADLESS !== '0' });
    const context = await this.browser.newContext();
    this.page = await context.newPage();
    await this.page.goto('https://www.bbc.com/sport');
  }

  async searchFor(query: string) {
    await this.page.click('[aria-label="Search"]');
    await this.page.fill('input[type="search"]', query);
    await this.page.press('input[type="search"]', 'Enter');
    await this.page.waitForSelector('article, .ssrcss-1aofmbn-PromoHeadline');
  }

  async verifySearchResults() {
    const count = await this.page.locator('article, .ssrcss-1aofmbn-PromoHeadline').count();
    assert.ok(count >= 4, `Expected at least 4 results, found ${count}`);
    await this.browser.close();
  }
}
