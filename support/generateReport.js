// support/generateReport.js
const fs = require('fs');
const path = require('path');
const reporter = require('cucumber-html-reporter');

const jsonFile = path.join('reports', 'cucumber_report.json');
const output = path.join('reports', 'cucumber_report.html');

if (!fs.existsSync(jsonFile)) {
  console.error(`❌ Cucumber JSON not found at: ${jsonFile}`);
  process.exit(1);
}

const options = {
  theme: 'bootstrap',
  jsonFile,
  output,
  reportSuiteAsScenarios: true,
  launchReport: false,
  metadata: {
    "Platform": process.platform,
    "Node": process.version
  }
};

reporter.generate(options);
console.log(`✅ HTML report generated at: ${output}`);
