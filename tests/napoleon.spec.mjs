import { test, expect } from '@playwright/test';

test('gallery opens the Napoleon exhibition with working nested assets and credits', async ({ page }) => {
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.setViewportSize({width:1440,height:900});
  await page.goto('');
  const feature=page.locator('#napoleon-feature');
  await feature.scrollIntoViewIfNeeded();
  await expect(feature).toContainText('Interactive history · Codex-assisted');
  await expect(feature.locator('img')).toHaveJSProperty('naturalWidth',1200);
  await expect(feature).toHaveCSS('opacity','1');
  await page.screenshot({path:'test-results/napoleon-gallery-desktop.png'});
  await feature.getByRole('link',{name:'Open the exhibition'}).click();
  await expect(page).toHaveURL(/\/demos\/napoleon\/$/);
  await expect(page.locator('h1')).toContainText('Napoleon');
  await expect(page.locator('.hero img')).toHaveJSProperty('naturalWidth',1200);
  await expect(page.locator('.hero-eyebrow')).toHaveCSS('opacity','1');
  await page.screenshot({path:'test-results/napoleon-nested-desktop.png'});
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(page.locator('.project-credit')).toContainText('A Codex-assisted project by zergmutalisp.');
  await expect(page.locator('.project-credit a').last()).toHaveAttribute('href','https://github.com/zergmutalisp');
  await expect(page.locator('.footer-links a').first()).toHaveAttribute('href','https://github.com/zergmutalisp/designscapes/tree/main/sources/napoleon');
  await page.screenshot({path:'test-results/napoleon-footer-desktop.png'});
  await page.getByRole('button',{name:'Contents',exact:true}).click();
  await expect(page.locator('.collection-jump')).toHaveAttribute('href','https://zergmutalisp.github.io/designscapes/');
  expect(errors).toEqual([]);
});

test('gallery feature and exhibition credits fit phones', async ({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('');
  await page.locator('#napoleon-feature').scrollIntoViewIfNeeded();
  await expect(page.locator('#napoleon-feature')).toHaveCSS('opacity','1');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/napoleon-gallery-mobile.png'});
  await page.locator('#napoleon-feature .text-link').click();
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect(page.locator('.project-credit')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:'test-results/napoleon-footer-mobile.png'});
});
