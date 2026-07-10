import { expect, test } from '@playwright/test';

test('shows the current Cobalt Ledger mortgage calculator on the gallery card', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('');

  const heading = page.getByRole('heading', { name: 'Mortgage Paydown' });
  await heading.scrollIntoViewIfNeeded();
  const preview = page.locator('.mortgage-preview');

  await expect(preview).toBeVisible();
  await expect(preview.locator('.preview-topline')).toContainText('Cobalt Ledger');
  expect(await preview.locator('.preview-results strong').allTextContents()).toEqual([
    '$286,709',
    '$3,528',
    '15 yr 3 mo'
  ]);
  await expect(preview.locator('.preview-controls')).toContainText('$500k · $100k down · 6.5%');
  await expect(preview.locator('.preview-controls')).toContainText('$1,000/mo · starts Y1 M2');
  await expect(preview.locator('.preview-bars > g')).toHaveCount(15);

  const desktop = await preview.evaluate(element => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    interestSaved: getComputedStyle(element.querySelector('.preview-results > div:first-child strong')).color,
    planLine: getComputedStyle(element.querySelector('.preview-plan-line')).stroke,
    originalDash: getComputedStyle(element.querySelector('.preview-original-line')).strokeDasharray,
    extraFill: getComputedStyle(element.querySelector('.preview-bars .extra')).fill
  }));
  expect(desktop.scrollHeight).toBeLessThanOrEqual(desktop.clientHeight + 1);
  expect(desktop.scrollWidth).toBeLessThanOrEqual(desktop.clientWidth + 1);
  expect(desktop.interestSaved).toBe('rgb(62, 107, 0)');
  expect(desktop.planLine).toBe('rgb(49, 92, 155)');
  expect(desktop.originalDash).not.toBe('none');
  expect(desktop.extraFill).toContain('preview-extra-hatch');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole('heading', { name: 'Mortgage Paydown' }).scrollIntoViewIfNeeded();

  const mobile = await page.locator('.mortgage-preview').evaluate(element => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    pageClientWidth: document.documentElement.clientWidth,
    pageScrollWidth: document.documentElement.scrollWidth
  }));
  expect(mobile.scrollHeight).toBeLessThanOrEqual(mobile.clientHeight + 1);
  expect(mobile.scrollWidth).toBeLessThanOrEqual(mobile.clientWidth + 1);
  expect(mobile.pageScrollWidth).toBe(mobile.pageClientWidth);
});
