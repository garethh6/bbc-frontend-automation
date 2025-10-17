import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { BbcSportHomePage } from '../pages/BbcSportHomePage';

const homePage = new BbcSportHomePage();

Given('I open the BBC Sport homepage', async () => {
  await homePage.openHomePage();
});

When('I search for {string}', async (query: string) => {
  await homePage.searchFor(query);
});

Then('I should see at least 4 search results', async () => {
  await homePage.verifySearchResults();
});
