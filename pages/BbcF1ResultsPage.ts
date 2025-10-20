import { type Page } from 'playwright';
import type { DataTable } from '@cucumber/cucumber';
import assert from 'assert';
import { page as sharedPage } from '../support/hooks';

export class BbcF1ResultsPage {
  private get page(): Page {
    if (!sharedPage) throw new Error('Page is not initialized');
    return sharedPage;
  }

  async openF1Page(): Promise<void> {
    await this.page.goto('https://www.bbc.com/sport/formula1', { waitUntil: 'domcontentloaded' });

    // try to accept cookies quickly if present
    const accept = this.page.locator('button:has-text("Accept all"), button:has-text("Agree")').first();
    if (await accept.isVisible().catch(()=>false)) await accept.click().catch(()=>{});
  }

  async navigateToVegasResults(): Promise<void> {
    // robust link matching
    const vegas = this.page.getByRole('link', { name: /las vegas/i }).first();
    if (!(await vegas.isVisible().catch(()=>false))) {
      await this.page.locator('a:has-text("Las Vegas")').first().scrollIntoViewIfNeeded().catch(()=>{});
    }
    await vegas.click().catch(async () => {
      await this.page.locator('a:has-text("Las Vegas")').first().click();
    });

    await Promise.race([
      this.page.getByRole('heading', { name: /las vegas/i }).waitFor({ timeout: 15_000 }),
      this.page.locator('table').first().waitFor({ timeout: 15_000 }),
      this.page.waitForLoadState('networkidle', { timeout: 15_000 }),
    ]);
  }

  async verifyTop3(dataTable: DataTable): Promise<void> {
    const rows = dataTable.hashes() as Array<Record<string, string>>;
    for (const r of rows) {
      const driver = r['driver'];
      assert.ok(driver, 'Expected "driver" column in the data table');
      const found = await this.page.locator(`text=${driver}`).count();
      assert.ok(found > 0, `Driver ${driver} not found in results.`);
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
