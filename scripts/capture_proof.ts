import { chromium } from '@playwright/test';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 1. Proof explorer
  console.log('Capturing proof explorer...');
  await page.goto('http://localhost:3000/proof', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'public/capture/09_receipt_verified_match.png' });
  await page.screenshot({ path: 'public/capture/08_receipt_detail_modal.png' });

  // 2. Receipts list
  await page.goto('http://localhost:3000/receipts', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'public/capture/07_receipts_page.png' });

  await browser.close();
  console.log('Proof & receipts captured successfully!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
