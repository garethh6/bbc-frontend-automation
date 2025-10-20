import { BeforeAll, AfterAll, Before, After, Status } from '@cucumber/cucumber';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

let browser: Browser;
let context: BrowserContext | undefined;
export let page: Page | undefined;

BeforeAll(async () => {
  browser = await chromium.launch({ headless: process.env.HEADLESS !== '0' });
});

Before(async () => {
  context = await browser.newContext();
  page = await context.newPage();
  page.setDefaultTimeout(15_000);
  page.setDefaultNavigationTimeout(30_000);
});

After(async function (scenario) {
  // (Optional) take a screenshot on failure
  if (scenario.result?.status === Status.FAILED && page) {
    try { await page.screenshot({ path: `reports/${Date.now()}-failed.png`, fullPage: true }); } catch {}
  }
  await context?.close().catch(()=>{});
  context = undefined;
  page = undefined;
});

AfterAll(async () => {
  await browser?.close().catch(()=>{});
});
import { setDefaultTimeout } from '@cucumber/cucumber';
setDefaultTimeout(60_000); // 60 seconds per step
});
