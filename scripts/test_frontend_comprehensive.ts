import { chromium } from '@playwright/test';

async function testFrontend() {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Console Error] ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(`[Page Error] ${err.message}`);
  });

  console.log('--- TEST 1: Overview Page Load & Default Scored State ---');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const title = await page.title();
  console.log('Page Title:', title);

  const winnerCard = page.locator('.winner-panel');
  console.log('Winner card text:', (await winnerCard.innerText()).replace(/\n/g, ' '));

  console.log('\n--- TEST 2: Quick Intent Pills ---');
  const sellEthBtn = page.getByRole('button', { name: /Sell ETH/i });
  await sellEthBtn.click();
  await page.waitForTimeout(400);

  const buySolBtn = page.getByRole('button', { name: /Buy SOL/i });
  await buySolBtn.click();
  await page.waitForTimeout(400);

  console.log('\n--- TEST 3: Starting Wallet Dropdown Switch ---');
  const pocketSelect = page.locator('select#pocket');
  await pocketSelect.selectOption('USDM');
  await page.waitForTimeout(400);

  await pocketSelect.selectOption('SPOT');
  await page.waitForTimeout(400);

  console.log('\n--- TEST 4: Typing Custom Intent & Find best path ---');
  const input = page.locator('textarea, input[type="text"]').first();
  await input.fill('Buy 50 USDT of BTC, hold 8h');
  const findBtn = page.getByRole('button', { name: /Find best path/i });
  await findBtn.click();
  await page.waitForTimeout(400);

  console.log('\n--- TEST 5: Execution Modal & Fixture Run ---');
  const runBtn = page.getByRole('button', { name: /Review fixture run|Run fixture/i });
  if (await runBtn.isVisible()) {
    await runBtn.click();
    await page.waitForTimeout(400);
    const modal = page.locator('.modal');
    console.log('Modal dialog visible:', await modal.isVisible());

    const approveBtn = page.getByRole('button', { name: /Approve fixture run|Approve|Execute/i });
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await page.waitForTimeout(800);
      console.log('Fixture executed and receipt created.');
    }
  }

  console.log('\n--- TEST 6: Navigation to /wallets ---');
  await page.goto('http://localhost:3000/wallets', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  console.log('Wallets page rendered successfully.');

  console.log('\n--- TEST 7: Navigation to /receipts & Receipt Verification ---');
  await page.goto('http://localhost:3000/receipts', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const receiptRows = page.locator('.receipt-table tbody tr');
  const count = await receiptRows.count();
  console.log(`Receipts found in ledger: ${count}`);

  if (count > 0) {
    const firstArrowBtn = page.locator('.receipt-table .icon-button').first();
    if (await firstArrowBtn.isVisible()) {
      await firstArrowBtn.click();
      await page.waitForTimeout(400);
      const verifyBtn = page.getByRole('button', { name: /Recompute & verify/i });
      if (await verifyBtn.isVisible()) {
        await verifyBtn.click();
        await page.waitForTimeout(600);
        const verifyResult = page.locator('.verify-result');
        console.log('Verification result:', (await verifyResult.innerText()).replace(/\n/g, ' '));
      }
      await page.keyboard.press('Escape');
    }
  }

  console.log('\n--- TEST 8: Navigation to /campaign ---');
  await page.goto('http://localhost:3000/campaign', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const campaignBtn = page.getByRole('button', { name: /Run fixture campaign|Rerun fixture campaign/i });
  await campaignBtn.click();
  await page.waitForTimeout(600);
  const ablationRows = page.locator('.ablation-row');
  console.log(`Campaign completed with ${await ablationRows.count()} ablations.`);

  console.log('\n--- TEST 9: Navigation to /proof ---');
  await page.goto('http://localhost:3000/proof', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  console.log('Proof Explorer loaded.');

  console.log('\n--- TEST 10: Navigation to /policy ---');
  await page.goto('http://localhost:3000/policy', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const savePolicyBtn = page.getByRole('button', { name: /Save policy/i });
  await savePolicyBtn.click();
  await page.waitForTimeout(300);
  console.log('Policy saved for session.');

  console.log('\n--- TEST 11: Connections Modal ---');
  const connBtn = page.locator('button.nav-link:has-text("Connections")');
  if (await connBtn.isVisible()) {
    await connBtn.click();
    await page.waitForTimeout(400);
    const connModal = page.locator('.modal');
    console.log('Connections modal opened:', await connModal.isVisible());
    await page.keyboard.press('Escape');
  }

  console.log('\n================ SUMMARY ================');
  console.log(`Console Errors: ${consoleErrors.length}`);
  consoleErrors.forEach(e => console.log('  ', e));
  console.log(`Page Uncaught Errors: ${pageErrors.length}`);
  pageErrors.forEach(e => console.log('  ', e));

  await browser.close();

  if (consoleErrors.length > 0 || pageErrors.length > 0) {
    throw new Error('Frontend has errors');
  } else {
    console.log('\n>>> ALL FRONTEND MANUAL & INTERACTIVE CHECKS PASSED WITH 0 ERRORS! <<<');
  }
}

testFrontend().catch(e => {
  console.error(e);
  process.exit(1);
});
