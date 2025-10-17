// pages/BbcF1ResultsPage.ts
import { chromium, type Browser, type Page } from 'playwright';
import type { DataTable } from '@cucumber/cucumber';
import assert from 'assert';

export class BbcF1ResultsPage {
  private browser!: Browser;
  private page!: Page;

  async openF1Page(): Promise<void> {
    this.browser = await chromium.launch({ headless: process.env.HEADLESS !== '0' });
    const context = await this.browser.newContext();
    this.page = await context.newPage();
    await this.page.goto('https://www.bbc.com/sport/formula1', { waitUntil: 'domcontentloaded' });
  }

  async navigateToVegasResults(): Promise<void> {
    await this.page.waitForSelector('text=Las Vegas', { timeout: 10000 });
    await this.page.click('text=Las Vegas');
  }

  async verifyTop3(dataTable: DataTable): Promise<void> {
    // Gherkin table like:
    // | driver         |
    // | Max Verstappen |
    // | ...            |
    const rows = dataTable.hashes() as Array<Record<string, string>>;

    for (const row of rows) {
      const driver = row['driver'];
      assert.ok(driver, 'Expected a "driver" column in the data table');

      const found = await this.page.locator(`text=${driver}`).count();
      assert.ok(found > 0, `Driver ${driver} not found in results.`);
    }

    await this.browser.close();
  }
}
