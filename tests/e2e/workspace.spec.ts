import { test, expect } from '@playwright/test';

test('intent → score → fixture receipt → recomputed proof',async({page,request})=>{
  await request.post('/api/control',{data:{stopped:false}});
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Every path. Every cent.'})).toBeVisible();
  await expect(page.locator('.winner-name')).toContainText('Binance Convert');
  await page.getByRole('button',{name:'Review fixture run'}).click();
  await page.getByRole('button',{name:'Approve fixture run'}).click();
  await expect(page.getByRole('dialog')).toContainText('The execution receipt');
  await page.getByRole('button',{name:'Recompute & verify'}).click();
  await expect(page.locator('.verify-result')).toContainText('MATCH');
  await page.getByRole('button',{name:'Close dialog'}).click();
  await page.getByLabel('Starting wallet').selectOption('USDM');
  await page.getByRole('button',{name:'Find best path'}).click();
  await expect(page.locator('.winner-name')).toContainText('Transfer → Spot');
  await page.getByRole('button',{name:'All 13 paths'}).click();
  await expect(page.locator('.path-table tbody tr')).toHaveCount(13);
  await page.getByLabel('Trading intent').fill('do something');
  await page.getByRole('button',{name:'Find best path'}).click();
  await expect(page.locator('.error-box')).toContainText('Tell us the action');
});

test('all routes render; campaign records all attempts',async({page})=>{
  for(const route of ['/wallets','/receipts','/proof','/policy','/campaign']){
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
  }
  await page.getByRole('button',{name:'Run fixture campaign'}).click();
  await expect(page.locator('.ablation-row')).toHaveCount(6);
  await expect(page.locator('.campaign-table tbody tr')).toHaveCount(120);
});

test('emergency stop persists and server rejects new runs',async({page,request})=>{
  await request.post('/api/control',{data:{stopped:false}});
  await page.goto('/');
  await page.getByRole('button',{name:'Emergency stop',exact:true}).click();
  await expect(page.getByRole('button',{name:'Find best path'})).toBeDisabled();
  const result=await request.post('/api/receipts',{data:{text:'Buy 200 USDT of SOL'}});
  expect(result.status()).toBe(409);
  await page.reload();
  await expect(page.getByRole('button',{name:'Find best path'})).toBeDisabled();
  await page.getByRole('button',{name:'Resume workspace',exact:true}).click();
});

test('desktop and mobile layouts have no viewport overflow',async({page})=>{
  await page.goto('/');
  await page.screenshot({path:'artifacts/desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:'artifacts/mobile.png',fullPage:true});
});


