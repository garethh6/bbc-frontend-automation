const reporter = require('cucumber-html-reporter');

const options = {
  theme: 'bootstrap',
  jsonFile: 'reports/cucumber_report.json',
  output: 'reports/cucumber_report.html',
  reportSuiteAsScenarios: true,
  launchReport: false,
  metadata: {
    "App Version": "1.0.0",
    "Test Environment": "BBC Sport Site",
    "Browser": "Chromium",
    "Platform": "Local/CI",
    "Parallel": "No"
  }
};

reporter.generate(options);
