import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

async function capture() {
  await fs.mkdir('public/capture', { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 1. Overview full page with default Buy 200 USDT of SOL scored
  console.log('1. Overview full page');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'public/capture/01_overview_full.png' });

  // 2. Hero path comparison table
  console.log('2. Hero path table');
  const table = page.locator('section.table-panel');
  if (await table.count() > 0) {
    await table.screenshot({ path: 'public/capture/02_hero_path_table.png' });
  }

  // 3. Hero close-up focused on Convert winning row vs Spot baseline
  console.log('3. Hero close-up');
  const pathwiseBrand = page.locator('.brand');
  const winnerCard = page.locator('.winner-panel');
  await page.screenshot({
    path: 'public/capture/02b_hero_winning_shot.png',
    clip: { x: 200, y: 350, width: 1520, height: 620 }
  });

  // 4. Winner panel
  console.log('4. Winner panel');
  if (await winnerCard.count() > 0) {
    await winnerCard.screenshot({ path: 'public/capture/03_winner_panel.png' });
  }

  // 5. Input panel
  console.log('5. Input panel');
  const inputPanel = page.locator('section.input-panel');
  if (await inputPanel.count() > 0) {
    await inputPanel.screenshot({ path: 'public/capture/05_input_panel.png' });
  }

  // 6. Wallet switch: change to USDT on USD-M
  console.log('6. Wallet switch');
  const select = page.locator('select#pocket');
  if (await select.count() > 0) {
    await select.selectOption('USDM');
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'public/capture/04b_usdm_pocket_overview.png' });
    // Switch back to SPOT
    await select.selectOption('SPOT');
    await page.waitForTimeout(800);
  }

  // 7. Click "Review fixture run" to open execution modal
  console.log('7. Execution modal');
  const reviewBtn = page.getByRole('button', { name: /Review fixture run|Run fixture/i });
  if (await reviewBtn.count() > 0) {
    await reviewBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'public/capture/06_execution_modal.png' });
    
    // Click Approve & generate receipt
    const approveBtn = page.getByRole('button', { name: /Approve & generate receipt|Approve|Execute/i });
    if (await approveBtn.count() > 0) {
      await approveBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  // 8. Receipts page
  console.log('8. Receipts page');
  await page.goto('http://localhost:3000/receipts', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'public/capture/07_receipts_page.png' });

  // Open first receipt modal
  const receiptItem = page.locator('.table-row').first();
  if (await receiptItem.count() > 0) {
    await receiptItem.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'public/capture/08_receipt_detail_modal.png' });

    // Click recompute & verify
    const verifyBtn = page.getByRole('button', { name: /Recompute & verify/i });
    if (await verifyBtn.count() > 0) {
      await verifyBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: 'public/capture/09_receipt_verified_match.png' });
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // 9. Proof Explorer page
  console.log('9. Proof explorer');
  await page.goto('http://localhost:3000/proof', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'public/capture/10_proof_explorer.png' });

  // 10. Campaign page
  console.log('10. Campaign page');
  await page.goto('http://localhost:3000/campaign', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'public/capture/11_campaign_page.png' });

  // 11. Wallets page
  console.log('11. Wallets page');
  await page.goto('http://localhost:3000/wallets', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'public/capture/12_wallets_page.png' });

  await browser.close();
  console.log('All refined captures saved!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
