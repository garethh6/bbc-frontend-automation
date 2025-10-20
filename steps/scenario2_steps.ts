// steps/scenario2_steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { Page } from 'playwright';
import { page as worldPage } from '../support/hooks';

let page!: Page;

Given('I open the BBC Sport homepage', async () => {
  // Use the Playwright Page created in hooks.ts
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

When('I search for {string}', async (query: string) => {
  // Open the search UI if present
  const searchButton = page.getByRole('button', { name: /search/i }).first();
  if (await searchButton.isVisible().catch(() => false)) {
    await searchButton.click().catch(() => {});
  }

  // Find a usable input (role first, then common fallbacks)
  let searchBox = page.getByRole('searchbox').first();
  if (!(await searchBox.isVisible().catch(() => false))) {
    const fallbacks = [
      'input[type="search"]',
      'input[name="q"]',
      '[data-testid="search-input"]',
      'input[placeholder*="Search"]',
    ];
    for (const sel of fallbacks) {
      const cand = page.locator(sel).first();
      if (await cand.isVisible().catch(() => false)) {
        searchBox = cand;
        break;
      }
    }
  }

  await searchBox.fill(query);
  await searchBox.press('Enter');

  // Wait for results to load/settle
  await page.waitForLoadState('networkidle');
});

// Regex form tolerates tiny wording variations in the feature text
Then(/^I should see at least (\d+) search results$/, async (minRaw: string) => {
  const min = Number(minRaw);

  // Generic but reliable targets for BBC result promos/headlines
  const results = page.locator('a:has(h3), .ssrcss-1ynlzyd-PromoHeadline');

  // Give the page a moment to render results if slow
  await results.first().waitFor({ timeout: 10_000 }).catch(() => {});

  const count = await results.count();
  expect(count).toBeGreaterThanOrEqual(min);
});
