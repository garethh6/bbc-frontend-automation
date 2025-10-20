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
  // Ensure page reference is set
  page = worldPage!;

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
  const inputCandidates = [
    page.getByRole('searchbox').first(),
    page.locator('input[type="search"]').first(),
    page.locator('input[name="q"]').first(),
    page.locator('[data-testid="search-input"]').first(),
    page.locator('input[placeholder*="Search"]').first(),
  ];

  let searchBox: undefined | import('playwright').Locator;
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

  // Generic but reliable targets for BBC result promos/headlines
  const results = page.locator('a:has(h3), .ssrcss-1ynlzyd-PromoHeadline');

  // Give the page a moment to render results if slow
  await results.first().waitFor({ timeout: 10_000 }).catch(() => {});

  const count = await results.count();
  expect(count).toBeGreaterThanOrEqual(min);
});
