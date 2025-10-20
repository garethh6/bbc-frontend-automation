// steps/scenario2_steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { Page } from 'playwright';
import { page as worldPage } from '../support/hooks';

let page!: Page;

Given('I open the BBC Sport homepage', async () => {
  // Grab the Playwright Page created by hooks.ts
  page = worldPage!;
  page.setDefaultTimeout(15_000);
  page.setDefaultNavigationTimeout(30_000);

  await page.goto('https://www.bbc.com/sport', { waitUntil: 'domcontentloaded' });

  // Accept cookies if present (try a few common variants; ignore failures)
  const cookieCandidates = [
    'button:has-text("Accept all")',
    'button:has-text("Agree")',
    'button:has-text("I agree")',
    '[data-testid="cookie-banner-accept"]',
  ];
  for (const sel of cookieCandidates) {
    const btn = page.locator(sel).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click().catch(() => {});
      break;
    }
  }
});

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
        /* ignore and try next */
      }
    }
  }

  async navigateToVegasResults(): Promise<void> {
    // Try several robust ways to reach the Vegas GP results/article.
    // 1) Role-based link text (preferred)
    const byRole = this.page.getByRole('link', { name: /las vegas( grand prix)?/i }).first();

    // 2) Text link fallback
    const byText = this.page.locator('a:has-text("Las Vegas")').first();

    // 3) Any element containing text (last resort)
    const anyVegas = this.page.locator(':text("Las Vegas")').first();

    // Bring something into view if nothing is visible yet
    if (!(await byRole.isVisible().catch(() => false)) && !(await byText.isVisible().catch(() => false))) {
      await anyVegas.scrollIntoViewIfNeeded().catch(() => {});
      await this.page.waitForTimeout(300); // brief settle
    }

    // Try clicking in descending preference order
    const tried: Array<() => Promise<void>> = [
      async () => await byRole.click({ timeout: 6_000 }),
      async () => await byText.click({ timeout: 6_000 }),
      async () => await anyVegas.click({ timeout: 6_000 }),
    ];

    let clicked = false;
    for (const attempt of tried) {
      try {
        await attempt();
        clicked = true;
        break;
      } catch {
        // try next
      }
    }
    assert.ok(clicked, 'Could not find/click a Las Vegas link on the page');

    // Wait for an indication we actually navigated to related content
    await Promise.race([
      this.page.getByRole('heading', { name: /las vegas/i }).first().waitFor({ timeout: 18_000 }),
      this.page.locator('table').first().waitFor({ timeout: 18_000 }),
      this.page.waitForLoadState('networkidle', { timeout: 18_000 }),
    ]).catch(() => { /* allow verify step to still attempt lookup */ });
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

  // Type and submit
  await searchBox.fill(query);
  await searchBox.press('Enter');

  // Wait for results to load/settle
  await page.waitForLoadState('networkidle');
});
<<<<<<< HEAD
=======

Then('I should see at least {int} search results', async (min: number) => {
  // Generic but reliable targets for BBC result promos/headlines
  const results = page.locator('a:has(h3), .ssrcss-1ynlzyd-PromoHeadline');
  // Give the page a moment to render results if slow
  await results.first().waitFor({ timeout: 10_000 }).catch(() => {});
  const count = await results.count();

  expect(count).toBeGreaterThanOrEqual(min);
});
>>>>>>> 128d407 (fix: updated Vegas navigation and scenario step definitions)
