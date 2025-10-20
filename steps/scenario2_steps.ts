import { Given, When, Then } from '@cucumber/cucumber';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';

let page: any;

GivenWithTimeout('I open the BBC Sport homepage', async () => {
  const browser = await chromium.launch({ headless: process.env.HEADLESS !== '0' });
  const context = await browser.newContext();
  page = await context.newPage();
  await page.goto('https://www.bbc.com/sport');
});

WhenWithTimeout('I search for {string}', async (query: string) => {
  const searchButton = page.getByRole('button', { name: /search/i });
  await searchButton.click();
  const searchBox = page.getByRole('searchbox');
  await searchBox.fill(query);
  await searchBox.press('Enter');
  await page.waitForLoadState('networkidle');
});

ThenWithTimeout('I should see at least {int} search results', async (min: number) => {
  const results = page.locator('a:has(h3), .ssrcss-1ynlzyd-PromoHeadline');
  const count = await results.count();
  expect(count).toBeGreaterThanOrEqual(min);
});
