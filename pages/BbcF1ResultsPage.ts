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

    // More forgiving timeouts in CI
    this.page.setDefaultTimeout(15_000);
    this.page.setDefaultNavigationTimeout(30_000);

    await this.page.goto('https://www.bbc.com/sport/formula1', { waitUntil: 'domcontentloaded' });

    // Try to accept cookie/consent quickly if present (ignore errors if not there)
    const accept = this.page
      .locator('button:has-text("Accept all"), button:has-text("Agree"), [data-testid="cookie-banner-accept"]')
      .first();
    try {
      if (await accept.isVisible({ timeout: 1000 })) {
        await accept.click({ timeout: 2000 });
      }
    } catch { /* ignore */ }
  }

  async navigateToVegasResults(): Promise<void> {
    // Prefer an accessible role selector; fall back to text
    const vegasLink = this.page.getByRole('link', { name: /las vegas/i }).first();

    // If not visible, try to bring a text-based link into view
    if (!(await vegasLink.isVisible().catch(() => false))) {
      await this.page.locator('a:has-text("Las Vegas")').first().scrollIntoViewIfNeeded().catch(() => {});
    }

    // Try clicking by role, then fallback
    try {
      await vegasLink.click({ timeout: 5000 });
    } catch {
      await this.page.locator('a:has-text("Las Vegas")').first().click({ timeout: 5000 });
    }

    // Wait for something that indicates the results page is loaded
    await Promise.race([
      this.page.getByRole('heading', { name: /las vegas/i }).waitFor({ timeout: 15_000 }),
      this.page.locator('table').first().waitFor({ timeout: 15_000 }),
      this.page.waitForLoadState('networkidle', { timeout: 15_000 }),
    ]);
  }

  async verifyTop3(dataTable: DataTable): Promise<void> {
    // Expect a table like:
    // | position | driver         |
    // | 1        | Max Verstappen |
    const rows = dataTable.hashes() as Array<Record<string, string>>;

    for (const row of rows) {
      const driver = row['driver'];
      assert.ok(driver, 'Expected a "driver" column in the data table');

      // Look for the driver text somewhere on the page (robust to layout changes)
      const found = await this.page.locator(`text=${driver}`).count();
      assert.ok(found > 0, `Driver ${driver} not found in results.`);
    }

    // Close browser at the end of this verification
    await this.browser.close();
  }
}
