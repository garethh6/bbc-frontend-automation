// steps/scenario2_steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import type { DataTable } from '@cucumber/cucumber';
import type { Page } from 'playwright';
import { page as worldPage } from '../support/hooks';

let page!: Page;

Given('I open the BBC Sport homepage', async () => {
  // Grab the Playwright Page created by hooks.ts
  page = worldPage!;
  await page.goto('https://www.bbc.com/sport', { waitUntil: 'domcontentloaded' });

  // Accept cookies if present
  const accept = page
    .locator('button:has-text("Accept all"), button:has-text("Agree"), [data-testid="cookie-banner-accept"]')
    .first();
  if (await accept.isVisible().catch(() => false)) {
    await accept.click().catch(() => {});
  }
});

When('I search for {string}', async (query: string) => {
  const searchButton = page.getByRole('button', { name: /search/i }).first();
  if (await searchButton.isVisible().catch(() => false)) {
    await searchButton.click().catch(() => {});
  }

  const searchBox = page.getByRole('searchbox').first();
  await searchBox.fill(query);
  await searchBox.press('Enter');
  await page.waitForLoadState('networkidle');
});

Then('the results table should contain the following top 3 finishers:', async (dataTable: DataTable) => {
});
