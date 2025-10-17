import { chromium } from 'playwright';
import assert from 'assert';

export class BbcF1ResultsPage {
  browser: any;
  page: any;

  async openF1Page() {
    this.browser = await chromium.launch({ headless: process.env.HEADLESS !== '0' });
    const context = await this.browser.newContext();
    this.page = await context.newPage();
    await this.page.goto('https://www.bbc.com/sport/formula1');
  }

  async navigateToVegasResults() {
    await this.page.waitForSelector('text=Las Vegas', { timeout: 10000 });
    await this.page.click('text=Las Vegas');
  }

  async verifyTop3(dataTable) {
    const rows = dataTable.hashes();
    for (const row of rows) {
      const driver = row.driver;
      const found = await this.page.locator(`text=${driver}`).count();
      assert.ok(found > 0, `Driver ${driver} not found in results.`);
    }
    await this.browser.close();
  }
}
