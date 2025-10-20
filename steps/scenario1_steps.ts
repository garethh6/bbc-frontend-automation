import { GivenWithTimeout, WhenWithTimeout, ThenWithTimeout } from '../support/step-timeout';
import { expect } from '@playwright/test';
import { BbcF1ResultsPage } from '../pages/BbcF1ResultsPage';

const pageModel = new BbcF1ResultsPage();

GivenWithTimeout('I open the BBC Sport Formula 1 page', async () => {
  await pageModel.openF1Page();
});

WhenWithTimeout('I navigate to the Las Vegas Grand Prix results', async () => {
  await pageModel.navigateToVegasResults();
});

ThenWithTimeout(
  'the results table should contain the following top 3 finishers:',
  async (dataTable) => {
    await pageModel.verifyTop3(dataTable);
  }
);
