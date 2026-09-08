import { chromium } from '@playwright/test';

async function captureModals() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 1. Standalone Hero Table
  console.log('Capturing Hero table standalone...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  
  // High-res Winning Screenshot deliverable
  await page.screenshot({
    path: 'public/capture/hero_winning_screenshot_1080p.png'
  });

  // Table panel only
  const tableEl = await page.$('.table-panel');
  if (tableEl) {
    await tableEl.screenshot({ path: 'public/capture/02_hero_path_table.png' });
  }

  // 2. Receipts detail and verification
  console.log('Capturing Receipt verification...');
  await page.goto('http://localhost:3000/receipts', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Click on the first receipt in the list
  const receiptCard = await page.$('.receipt-card, .table-row');
  if (receiptCard) {
    await receiptCard.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'public/capture/08_receipt_detail_modal.png' });

    // Click Recompute & verify
    const verifyBtn = page.getByRole('button', { name: /Recompute & verify/i });
    if (await verifyBtn.count() > 0) {
      await verifyBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'public/capture/09_receipt_verified_match.png' });
    }
  }

  await browser.close();
  console.log('Modal captures complete!');
}

captureModals().catch(console.error);
