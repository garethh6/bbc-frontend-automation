# BBC Front-End Automation Project

This project automates front-end BDD scenarios for the SecuritEase QE assessment using **Playwright**, **Cucumber**, and **TypeScript**.

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   npx playwright install
   ```

2. **Run tests:**
   ```bash
   npm test
   ```

3. **View HTML Report:**
   After tests run, open `reports/cucumber_report.html` in your browser.

4. **View XML Report (for CI):**
   The XML report will be available at `reports/cucumber_report.xml`.

5. **Run CI manually:**
   ```bash
   npm run ci
   ```

6. **Headed Mode (for Captcha handling):**
   ```bash
   npm run test:headed
   ```

7. **Push to GitHub** and invite `TechAsessment@securitease.com` for review.

Reports and screenshots will be in the `/reports` folder.
