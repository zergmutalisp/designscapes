import { expect, test } from '@playwright/test';

const atlasPath = 'demos/terror-effects/';

test('serves the aggregate GTD atlas at an intentionally unlinked route', async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(atlasPath);

  await expect(page.getByRole('heading', { name: 'Incident Atlas' })).toBeVisible();
  await expect(page.locator('#metric-events')).toHaveText('56,008');
  await expect(page.locator('#metric-mapped')).toHaveText('99.2%');
  await expect(page.locator('.map-credit')).toContainText('© OpenMapTiles');
  await expect(page.locator('.map-credit')).toContainText('© OpenStreetMap');
  await expect(page.locator('.maplibregl-ctrl-attrib')).toHaveCount(0);

  const cellsResponse = await request.get(`${atlasPath}data/cells.json`);
  expect(cellsResponse.ok()).toBe(true);
  const cells = await cellsResponse.json();
  expect(cells.schema).toEqual([
    'area',
    'year',
    'longitude',
    'latitude',
    'events',
    'knownFatalityEvents',
    'fatalities',
    'knownInjuryEvents',
    'injuries',
    'doubtfulEvents'
  ]);
  expect(cells.schema).not.toContain('eventid');
  expect(cells.schema).not.toContain('summary');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator('#metric-events')).toHaveText('56,008');
  const mobileLayout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    mapHeight: document.querySelector('.map-stage').getBoundingClientRect().height,
    credit: document.querySelector('.map-credit').getBoundingClientRect().toJSON(),
    legend: document.querySelector('.map-legend').getBoundingClientRect().toJSON(),
    overflowElements: [...document.querySelectorAll('body *')]
      .map(element => ({
        selector: element.id ? `#${element.id}` : element.className || element.tagName,
        rect: element.getBoundingClientRect().toJSON()
      }))
      .filter(({ rect }) => rect.right > document.documentElement.clientWidth + 0.5 || rect.left < -0.5)
      .slice(0, 12)
  }));
  expect(mobileLayout.scrollWidth, JSON.stringify(mobileLayout.overflowElements)).toBe(mobileLayout.clientWidth);
  expect(mobileLayout.mapHeight).toBeGreaterThan(400);
  expect(mobileLayout.credit.top).toBeGreaterThanOrEqual(mobileLayout.legend.bottom);

  await page.goto('');
  await expect(page.locator('a[href*="terror-effects"]')).toHaveCount(0);
});
