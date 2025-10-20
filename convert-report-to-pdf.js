// convert-report-to-pdf.js
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const reportPath = path.resolve('reports', 'cucumber_report.html');
  const pdfPath = path.resolve('reports', 'cucumber_report.pdf');

  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // Load the local HTML report
  await page.goto(`file://${reportPath}`, { waitUntil: 'load' });

  // Export to PDF
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true
  });

  await browser.close();
  console.log(`✅ PDF report saved at: ${pdfPath}`);
})();
