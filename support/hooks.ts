import { BeforeAll, After, AfterAll, Status } from '@cucumber/cucumber';
import { chromium, Browser, Page } from 'playwright';
import fs from 'fs';
import path from 'path';

let browser: Browser;
let page: Page;

BeforeAll(async () => {
  browser = await chromium.launch({ headless: process.env.HEADLESS !== '0' });
});

After(async function (scenario) {
  if (scenario.result?.status === Status.FAILED) {
    const screenshotPath = path.join('reports', `${scenario.pickle.name.replace(/\s+/g, '_')}.png`);
    await page.screenshot({ path: screenshotPath });
  }
});

AfterAll(async () => {
  await browser.close();
  if (!fs.existsSync('reports')) fs.mkdirSync('reports');
});
import { setDefaultTimeout } from '@cucumber/cucumber';

import { setDefaultTimeout } from '@cucumber/cucumber';
setDefaultTimeout(60_000); // 60 seconds per step
});
