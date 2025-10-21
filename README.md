# BBC Front-End Automation Project

This project automates front-end **BDD scenarios** for the SecuritEase QE assessment using:
- Playwright (browser automation)
- Cucumber (BDD) (feature-driven testing)
- TypeScript
- GitHub Actions for automated reporting & publishing

---

## Prerequisites

Before running the project, make sure you have:

- [Node.js](https://nodejs.org/) (v18 or later)
- npm (comes with Node)
- Git installed
- A code editor (VS Code recommended)

---

## Installation

```bash
# Clone the repository
git clone https://github.com/garethh6/BBC_Frontend_Automation_Assignment.git

# Go into the project directory
cd BBC_Frontend_Automation_Assignment

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

---

## Running Tests

```bash
npm test
```

This will:
- Run the Cucumber/Playwright test suite  
- Generate an HTML report in the `reports/` folder

After the run, open:
```
reports/cucumber_report.html
```

Or use:
```bash
start reports/cucumber_report.html        # Windows
open reports/cucumber_report.html         # macOS
xdg-open reports/cucumber_report.html     # Linux
```

---

## Accessing the Report

- Local HTML report: `reports/cucumber_report.html`  
- Online HTML report (via GitHub Pages):  
  `https://garethh6.github.io/BBC_Frontend_Automation_Assignment/cucumber_report.html`

---

## Generating Reports Manually

Re-generate the HTML report without re-running tests:

```bash
npm run report
```

Generate a PDF version of the report (optional):

```bash
npm run pdf
```

The PDF file will be saved in:
```
reports/cucumber_report.pdf
```

---

## Continuous Integration (GitHub Actions)

This project is set up to:
1. Install dependencies  
2. Run Playwright + Cucumber tests  
3. Generate a test report  
4. Automatically publish it to GitHub Pages

### Manual Run
- Go to **Actions** tab in GitHub
- Select `Test & Publish Report`
- Click **Run workflow**

Your latest report will be automatically published at:

```
> [![View HTML Report](https://img.shields.io/badge/HTML%20Report-Online-blue?logo=github)](https://github.com/garethh6/bbc-frontend-automation/actions/runs/18693002008/artifacts/4331563061)
```

---

## About the Test Cases

The automated tests cover **core user journeys** to demonstrate end-to-end functional testing capabilities.

| Feature                      | Description                                                                 |
|------------------------------|------------------------------------------------------------------------------|
| Homepage Validation          | Verifies BBC homepage loads correctly and main UI elements are visible.     |
| Search Functionality         | Tests the search bar with different keywords and validates search results.  |
| Navigation Menu              | Checks that key menu links work and redirect to expected pages.             |
| Responsive Layout            | Verifies layout responsiveness for different viewport sizes.               |
| Basic Performance Check      | Ensures the page loads within acceptable time for test environments.        |

Each scenario is written in **Gherkin syntax** (Given / When / Then) and structured to be **independent, reusable**, and easy to maintain.

---

## Project Structure

```
BBC_Frontend_Automation_Assignment
 ┣ 📂 src
 ┣ 📂 tests
 ┣ 📂 reports
 ┣ 📄 README.md
 ┣ 📄 package.json
 ┣ 📄 tsconfig.json
 ┗ 📄 convert-report-to-pdf.js
```

- `tests/` → Feature files and step definitions  
- `reports/` → HTML & PDF reports  
- `convert-report-to-pdf.js` → Script to export report as PDF  
- `package.json` → Project scripts and dependencies

---

## Useful Scripts

| Command                | Description                                      |
|-------------------------|--------------------------------------------------|
| `npm test`              | Run tests and generate HTML report              |
| `npm run report`        | Generate HTML report without running tests      |
| `npm run pdf`           | Generate PDF report from HTML                   |
| `npx playwright test`   | Run Playwright tests directly                   |

##  Author

**Gareth Hattingh**