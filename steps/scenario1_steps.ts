import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { BbcF1ResultsPage } from '../pages/BbcF1ResultsPage';

const pageModel = new BbcF1ResultsPage();

Given('I open the BBC Sport Formula 1 page', async () => {
  await pageModel.openF1Page();
});

When('I navigate to the Las Vegas Grand Prix results', async () => {
  await pageModel.navigateToVegasResults();
});

Then('the results table should contain the following top 3 finishers:', async (dataTable) => {
  await pageModel.verifyTop3(dataTable);
});
