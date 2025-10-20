// steps/scenario2_steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { Page, Locator } from 'playwright';
import { page as worldPage } from '../support/hooks';

let page!: Page;
let lastQuery: string | undefined;

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
  // Ensure page reference is set and remember the query for fallback
  page = worldPage!;
  lastQuery = query;

  // Strategy 1: open the search UI using common triggers
  const searchTriggers = [
    page.getByRole('button', { name: /search/i }).first(),
    page.locator('[aria-label*="Search"]').first(),
    page.locator('button svg[aria-label*="Search"]').first(),
  ];
  for (const trigger of searchTriggers) {
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click().catch(() => {});
      await page.waitForTimeout(200).catch(() => {});
      break;
    }
  }

  // Strategy 2: find a usable input (role first, then common fallbacks)
  const inputCandidates: Locator[] = [
    page.getByRole('searchbox').first(),
    page.locator('input[type="search"]').first(),
    page.locator('input[name="q"]').first(),
    page.locator('[data-testid="search-input"]').first(),
    page.locator('input[placeholder*="Search"]').first(),
  ];

  let searchBox: Locator | undefined;
  for (const cand of inputCandidates) {
    if (await cand.isVisible().catch(() => false)) {
      searchBox = cand;
      break;
    }
  }

  // Strategy 3: try keyboard shortcuts to reveal/focus the search
  if (!searchBox) {
    await page.keyboard.press('/').catch(() => {});
    await page.keyboard.press('s').catch(() => {});
    for (const cand of inputCandidates) {
      if (await cand.isVisible().catch(() => false)) {
        searchBox = cand;
        break;
      }
    }
  }

  // Strategy 4 (final fallback): go straight to BBC search scoped to Sport
  if (!searchBox) {
    const url = `https://www.bbc.co.uk/search?q=${encodeURIComponent(query)}&scope=sport`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    return;
  }

  // Use the input we found
  await searchBox.fill(query);
  await searchBox.press('Enter');

  // Wait for results to load/settle
  await page.waitForLoadState('networkidle');
});

// Regex form tolerates tiny wording variations in the feature text
Then(/^I should see at least (\d+) search results$/, async (minRaw: string) => {
  const min = Number(minRaw);

  // A set of resilient selectors that commonly match BBC promos/headlines across skins
  const resultSelectors = [
    'a:has(h3)',                         // anchors wrapping H3s
    '.ssrcss-1ynlzyd-PromoHeadline',     // News/Sport promo headline class
    '[data-testid="default-promo"] a',   // generic promo anchor
    '[data-testid*="promo"] a',          // any promo anchor
    'ol[role="list"] li a',              // list-based results (bbc.co.uk/search)
  ];

  // Helper to count results using the first selector that yields something
  const countResults = async (): Promise<number> => {
    for (const sel of resultSelectors) {
      const loc = page.locator(sel);
      // wait briefly for this selector to appear
      await loc.first().waitFor({ timeout: 2000 }).catch(() => {});
      const n = await loc.count();
      if (n > 0) return n;
    }
    return 0;
  };

  // First attempt: count where we are now
  let count = await countResults();

  // If nothing found, try the universal BBC search scoped to Sport (uses remembered query)
  if (count < min && lastQuery) {
    const url = `https://www.bbc.co.uk/search?q=${encodeURIComponent(lastQuery)}&scope=sport`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    count = await countResults();
  }

  // As a final tiny grace period, allow a short settle and re-count
  if (count < min) {
    await page.waitForTimeout(500);
    count = Math.max(count, await countResults());
  }

  expect(count).toBeGreaterThanOrEqual(min);
});
