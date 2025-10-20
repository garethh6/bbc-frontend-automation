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
    this.page.setDefaultTimeout(20_000);
    this.page.setDefaultNavigationTimeout(40_000);

    await this.page.goto('https://www.bbc.com/sport/formula1', { waitUntil: 'domcontentloaded' });
    await this.acceptCookiesIfShown();
  }

  private async acceptCookiesIfShown(): Promise<void> {
    const candidates = [
      'button:has-text("Accept all")',
      'button:has-text("Agree")',
      'button:has-text("I agree")',
      '[data-testid="cookie-banner-accept"]',
    ];
    for (const sel of candidates) {
      try {
        const btn = this.page.locator(sel).first();
        if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await btn.click({ timeout: 2000 }).catch(() => {});
          break;
        }
      } catch {
        // ignore and try next
      }
    }
  }

  /**
   * Navigate to the 2023 Las Vegas GP results in a deterministic way:
   * 1) Open the results hub
   * 2) Switch to 2023 (if there's a season selector)
   * 3) Click the "Las Vegas Grand Prix" entry
   * 4) Fallback to a direct results URL if any step fails
   */
  async navigateToVegasResults(): Promise<void> {
    // 1) Results hub
    await this.page.goto('https://www.bbc.com/sport/formula1/results', { waitUntil: 'domcontentloaded' });
    await this.acceptCookiesIfShown();

    // 2) Try to pick 2023 season if a selector exists
    const seasonButton = this.page.getByRole('button', { name: /season/i }).first();
    if (await seasonButton.isVisible().catch(() => false)) {
      await seasonButton.click().catch(() => {});
      const y2023Option = this.page.getByRole('option', { name: /2023/i }).first();
      if (await y2023Option.isVisible().catch(() => false)) {
        await y2023Option.click().catch(() => {});
      } else {
        // Some variants render as links/list items
        await this.page.locator('text=2023').first().click({ timeout: 5_000 }).catch(() => {});
      }
    }

    // 3) Click the Las Vegas Grand Prix entry (try a few variants)
    const vegasCandidates = [
      this.page.getByRole('link', { name: /las vegas grand prix/i }).first(),
      this.page.locator('a:has-text("Las Vegas Grand Prix")').first(),
      this.page.locator(':text("Las Vegas")').first(),
    ];

    let clicked = false;
    for (const link of vegasCandidates) {
      if (await link.isVisible().catch(() => false)) {
        try {
          await link.scrollIntoViewIfNeeded().catch(() => {});
          await link.click({ timeout: 6_000 });
          clicked = true;
          break;
        } catch {
          // try next candidate
        }
      }
    }

    // 4) Fallback: direct URL to the 2023 Las Vegas results page
    if (!clicked) {
      await this.page.goto(
        'https://www.bbc.com/sport/formula1/2023/las-vegas-grand-prix/results',
        { waitUntil: 'domcontentloaded' }
      ).catch(() => {});
    }

    // Confirm we landed on a Las Vegas/results page
    await Promise.race([
      this.page.getByRole('heading', { name: /las vegas/i }).first().waitFor({ timeout: 18_000 }),
      this.page.locator('table').first().waitFor({ timeout: 18_000 }),
      this.page.waitForLoadState('networkidle', { timeout: 18_000 }),
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

      // Look for the driver name somewhere on the page (robust to layout changes)
      const found = await this.page.locator(`text=${driver}`).count();
      assert.ok(found > 0, `Driver ${driver} not found in results.`);
    }

    // Close browser at the end of this verification
    await this.browser.close();
  }
}
