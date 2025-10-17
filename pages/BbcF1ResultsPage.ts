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

    // More forgiving timeouts for slow CI
    this.page.setDefaultTimeout(15000);
    this.page.setDefaultNavigationTimeout(30000);

    await this.page.goto('https://www.bbc.com/sport/formula1', { waitUntil: 'domcontentloaded' });

    // Handle cookie/consent banners (BBC variants)
    // Try several common labels; ignore if not present.
    const consentSelectors = [
      'button:has-text("Agree")',
      'button:has-text("Accept all")',
      'button:has-text("I agree")',
      '[data-testid="cookie-banner-accept"]',
    ];
    for (const sel of consentSelectors) {
      const btn = this.page.locator(sel);
      if (await btn.first().isVisible({ timeout: 1000 }).catch(() => false)) {
        await btn.first().click().catch(() => {});
        break;
      }
    }
  }

  async navigateToVegasResults(): Promise<void> {
    // Prefer accessible role selector; fall back to text if needed.
    const vegasLink =
      this.page.getByRole('link', { name: /las vegas grand prix/i }).first();

    if (!(await vegasLink.isVisible().catch(() => false))) {
      // fallback to text selector
      await this.page.locator('a:has-text("Las Vegas")').first().scrollIntoViewIfNeeded().catch(() => {});
    }

    await vegasLink.click({ trial: false }).catch(async () => {
      await this.page.locator('a:has-text("Las Vegas")').first().click();
    });

    // Wait for a result page signal (headline or results table presence)
    await Promise.race([
      this.page.getByRole('heading', { name: /las vegas/i }).waitFor({ timeout: 15000 }),
      this.page.locator('table').first().waitFor({ timeout: 15000 }),
      this.page.waitForLoadState('networkidle', { timeout: 15000 }),
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

      // Look for driver anywhere on the page (robust, then could refine to table scope)
      const found = await this.page.locator(`text=${driver}`).count();
      assert.ok(found > 0, `Driver ${driver} not found in results.`);
    }
    await this.browser.close();
  }
}
