import { expect, test } from '@playwright/test';

const calculatorPath = 'demos/mortgage-paydown/';

async function openCalculator(page, viewport = { width: 1366, height: 768 }) {
  await page.setViewportSize(viewport);
  await page.goto(calculatorPath);
}

test('shows verified defaults and a keyboard-readable desktop inspector', async ({ page }) => {
  await openCalculator(page, { width: 1440, height: 900 });

  await expect(page.locator('#interest-saved')).toHaveText('$286,709');
  await expect(page.locator('#payment-with-extras')).toHaveText('$3,528');
  await expect(page.locator('#time-saved')).toHaveText('15 yr 3 mo');
  await expect(page.locator('#year-original-balance')).toHaveText('$390,759');
  await expect(page.locator('#year-balance-gap')).toHaveText('$24,424');
  await expect(page.getByRole('combobox', { name: 'Start year' })).toHaveValue('1');
  await expect(page.getByRole('combobox', { name: 'Start month within year' })).toHaveValue('2');
  await expect(page.locator('#start-month-note')).toContainText('Loan month 2');

  const detail = page.locator('#year-detail');
  await expect(detail).toBeVisible();
  const detailBox = await detail.boundingBox();
  expect(detailBox.width).toBeGreaterThan(650);
  expect(detailBox.height).toBeGreaterThan(60);

  const resultsBox = await page.locator('.results').boundingBox();
  const chartBox = await page.locator('#chart-shell').boundingBox();
  const headingBox = await page.locator('.chart-heading').boundingBox();
  const inspectorBox = await page.locator('.year-inspector').boundingBox();
  expect(chartBox.width / resultsBox.width).toBeGreaterThan(0.94);
  expect(chartBox.height).toBeGreaterThanOrEqual(480);
  expect(Math.abs(headingBox.y - inspectorBox.y)).toBeLessThan(6);

  const chartViewport = await page.locator('#paydown-chart').evaluate(svg => ({
    clientHeight: svg.clientHeight,
    viewBoxHeight: svg.viewBox.baseVal.height,
    clientWidth: svg.clientWidth,
    viewBoxWidth: svg.viewBox.baseVal.width
  }));
  expect(Math.abs(chartViewport.clientHeight - chartViewport.viewBoxHeight)).toBeLessThan(2);
  expect(Math.abs(chartViewport.clientWidth - chartViewport.viewBoxWidth)).toBeLessThan(2);

  const plotGeometry = await page.locator('#paydown-chart').evaluate(svg => {
    const yValues = [...svg.querySelectorAll('.grid-line')]
      .map(line => Number(line.getAttribute('y1')));
    const paymentYs = yValues.slice(0, 3);
    const balanceYs = yValues.slice(3, 6);
    return {
      paymentHeight: Math.max(...paymentYs) - Math.min(...paymentYs),
      balanceHeight: Math.max(...balanceYs) - Math.min(...balanceYs)
    };
  });
  expect(plotGeometry.paymentHeight).toBeGreaterThanOrEqual(150);
  expect(plotGeometry.balanceHeight).toBeGreaterThanOrEqual(150);

  const legendBox = await page.locator('.chart-legend').boundingBox();
  expect(legendBox.y + legendBox.height).toBeLessThanOrEqual(resultsBox.y + resultsBox.height + 1);

  await expect(page.locator('footer')).toContainText('The data entered on this page is not saved anywhere.');

  const inspector = page.getByRole('slider', { name: 'Inspect year' });
  await inspector.focus();
  await inspector.press('ArrowRight');
  await expect(page.locator('#inspect-year-output')).toHaveText('Year 3');
  await expect(page.locator('#year-detail-status')).toContainText('original schedule');
});

test('offers four semantically stable color themes with Nordic Civic as the default', async ({ page }) => {
  await openCalculator(page, { width: 1440, height: 900 });

  const selector = page.getByRole('combobox', { name: 'Color theme' });
  await expect(selector).toHaveValue('nordic-civic');
  await expect(selector.locator('option')).toHaveCount(4);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'nordic-civic');

  const themes = [
    ['nordic-civic', '#f2f4f7', '#466a97', '#434c5e', '#3f879b', '#b86443', '#6e7787'],
    ['solarized-editorial', '#fdf6e3', '#1f6fa8', '#36555c', '#16867f', '#a86100', '#718087'],
    ['cobalt-ledger', '#f4f1ea', '#315c9b', '#3e4857', '#397f99', '#b75c3e', '#777f8b'],
    ['muted-plum', '#f7f3ed', '#67517f', '#414957', '#3f8295', '#b7792f', '#827c87']
  ];

  for (const [theme, paper, accent, principal, extra, interest, original] of themes) {
    await selector.selectOption(theme);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const tokens = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return ['--paper', '--accent', '--principal', '--extra', '--interest', '--original']
        .map(token => styles.getPropertyValue(token).trim());
    });
    expect(tokens).toEqual([paper, accent, principal, extra, interest, original]);
    await expect.poll(() => page.locator('meta[name="theme-color"]').getAttribute('content')).toBe(paper);
    await expect(page.locator('#interest-saved')).toHaveText('$286,709');
  }
});

test('treats chart hover as temporary and commits the inspector only on click', async ({ page }) => {
  await openCalculator(page, { width: 1440, height: 900 });

  const inspector = page.getByRole('slider', { name: 'Inspect year' });
  const tooltip = page.locator('#chart-tooltip');
  const yearEight = page.locator('.year-hit[data-year="8"]');
  const initialBalance = await page.locator('#year-balance').textContent();

  await yearEight.hover();
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toContainText('Year 8');
  await expect(inspector).toHaveValue('2');
  await expect(page.locator('#inspect-year-output')).toHaveText('Year 2');
  await expect(page.locator('#year-balance')).toHaveText(initialBalance);

  await page.locator('.chart-heading').hover();
  await expect(tooltip).toBeHidden();
  await expect(inspector).toHaveValue('2');

  await yearEight.click();
  await expect(inspector).toHaveValue('8');
  await expect(page.locator('#inspect-year-output')).toHaveText('Year 8');
  await expect(page.locator('#year-balance')).not.toHaveText(initialBalance);

  await page.locator('.chart-heading').hover();
  await expect(tooltip).toBeHidden();
  await expect(inspector).toHaveValue('8');
  await expect(page.locator('#inspect-year-output')).toHaveText('Year 8');
});

test('previews a dragged year and commits only when released inside the plot', async ({ page }) => {
  await openCalculator(page, { width: 1440, height: 900 });

  const inspector = page.getByRole('slider', { name: 'Inspect year' });
  const previewBand = page.locator('.drag-preview-band');
  const tooltip = page.locator('#chart-tooltip');
  const startHit = page.locator('.year-hit[data-year="4"]');
  const destinationHit = page.locator('.year-hit[data-year="11"]');

  await startHit.hover();
  const startBox = await startHit.boundingBox();
  const destinationBox = await destinationHit.boundingBox();
  await page.mouse.move(startBox.x + startBox.width / 2, startBox.y + startBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    destinationBox.x + destinationBox.width / 2,
    destinationBox.y + destinationBox.height / 2,
    { steps: 8 }
  );

  await expect(inspector).toHaveValue('2');
  await expect(previewBand).toHaveClass(/is-visible/);
  await expect(tooltip).toContainText('Release to inspect Year 11');
  await expect(tooltip).toContainText('with extras');
  await expect(tooltip).toContainText('balance reduction');
  await expect(tooltip).toContainText('plan interest');
  await expect(tooltip).toContainText('extra principal');
  const dragTooltipLines = await tooltip.locator(':scope > *').allTextContents();
  expect(dragTooltipLines[0]).toBe('(Drag outside the chart to cancel.)');

  await page.mouse.up();
  await expect(inspector).toHaveValue('11');
  await expect(page.locator('#inspect-year-output')).toHaveText('Year 11');
  await expect(previewBand).not.toHaveClass(/is-visible/);

  const cancelStart = page.locator('.year-hit[data-year="6"]');
  await cancelStart.hover();
  const cancelBox = await cancelStart.boundingBox();
  const chartBox = await page.locator('#paydown-chart').boundingBox();
  await page.mouse.move(cancelBox.x + cancelBox.width / 2, cancelBox.y + cancelBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(chartBox.x - 16, cancelBox.y + cancelBox.height / 2, { steps: 8 });

  await expect(previewBand).not.toHaveClass(/is-visible/);
  await expect(tooltip).toBeHidden();
  await page.mouse.up();
  await expect(inspector).toHaveValue('11');
  await expect(page.locator('#inspect-year-output')).toHaveText('Year 11');
});

test('does not advertise an extra payment when the selected window cannot apply one', async ({ page }) => {
  await openCalculator(page);

  await page.getByRole('spinbutton', { name: 'Extra monthly payment in dollars' }).fill('30000');
  await page.getByRole('combobox', { name: 'Start year' }).selectOption('30');
  await page.getByRole('combobox', { name: 'Start month within year' }).selectOption('12');

  await expect(page.locator('#payment-summary-label')).toHaveText('Scheduled base payment');
  await expect(page.locator('#payment-with-extras')).toHaveText('$2,528');
  await expect(page.locator('#payment-comparison')).toHaveText('The selected window applies no extra principal');
  await expect(page.locator('#interest-saved')).toHaveText('$0');
  await expect(page.locator('#time-saved')).toHaveText('0 mo');
});

test('renders a coherent no-mortgage state for a 100 percent down payment', async ({ page }) => {
  await openCalculator(page);

  await page.getByRole('spinbutton', { name: 'Down payment in dollars' }).fill('500000');

  await expect(page.locator('#down-payment-note')).toHaveText('100% down · $0 financed');
  await expect(page.locator('#payment-with-extras')).toHaveText('$0');
  await expect(page.locator('#time-saved')).toHaveText('No loan');
  await expect(page.locator('#year-detail-note')).toContainText('no mortgage schedule');
  await expect(page.getByRole('slider', { name: 'Inspect year' })).toBeDisabled();
  await expect(page.locator('#paydown-chart')).toContainText('No mortgage balance');
});

test('keeps calculations on the last valid amount and exposes inline validation', async ({ page }) => {
  await openCalculator(page);

  const extra = page.getByRole('spinbutton', { name: 'Extra monthly payment in dollars' });
  await page.getByRole('combobox', { name: 'Start year' }).selectOption('3');
  const savedBefore = await page.locator('#interest-saved').textContent();
  await extra.fill('35000');

  await expect(extra).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#extra-payment-error')).toContainText('last valid amount');
  await expect(page.locator('#interest-saved')).toHaveText(savedBefore);

  await page.getByRole('combobox', { name: 'Start month within year' }).selectOption('3');
  await expect(page.locator('#payment-comparison')).toContainText('up to $1,000 extra');
  await expect(page.locator('#payment-comparison')).not.toContainText('$35,000');

  await extra.blur();
  await expect(extra).toHaveValue('30000');
  await expect(extra).toHaveAttribute('aria-invalid', 'false');
});

test('reset restores all default inputs and outputs', async ({ page }) => {
  await openCalculator(page);

  await page.getByRole('spinbutton', { name: 'Home price in dollars' }).fill('750000');
  await page.getByRole('spinbutton', { name: 'Extra monthly payment in dollars' }).fill('2500');
  await page.getByRole('combobox', { name: 'Start year' }).selectOption('5');
  await page.getByRole('button', { name: 'Reset defaults' }).click();

  await expect(page.getByRole('spinbutton', { name: 'Home price in dollars' })).toHaveValue('500000');
  await expect(page.getByRole('spinbutton', { name: 'Down payment in dollars' })).toHaveValue('100000');
  await expect(page.getByRole('spinbutton', { name: 'Extra monthly payment in dollars' })).toHaveValue('1000');
  await expect(page.getByRole('combobox', { name: 'Start year' })).toHaveValue('1');
  await expect(page.getByRole('combobox', { name: 'Start month within year' })).toHaveValue('2');
  await expect(page.locator('#interest-saved')).toHaveText('$286,709');
});

test('keeps both chart panels readable at the tablet-to-desktop breakpoint', async ({ page }) => {
  await openCalculator(page, { width: 821, height: 900 });

  const geometry = await page.evaluate(() => {
    const chart = document.querySelector('#chart-shell').getBoundingClientRect();
    const yValues = [...document.querySelectorAll('#paydown-chart .grid-line')]
      .map(line => Number(line.getAttribute('y1')));
    return {
      chartHeight: chart.height,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      paymentHeight: Math.max(...yValues.slice(0, 3)) - Math.min(...yValues.slice(0, 3)),
      balanceHeight: Math.max(...yValues.slice(3, 6)) - Math.min(...yValues.slice(3, 6))
    };
  });

  expect(geometry.chartHeight).toBeGreaterThanOrEqual(480);
  expect(geometry.paymentHeight).toBeGreaterThanOrEqual(150);
  expect(geometry.balanceHeight).toBeGreaterThanOrEqual(150);
  expect(geometry.scrollWidth).toBe(geometry.clientWidth);
});

test('retains comparison context and fits maximum values on narrow phones', async ({ page }) => {
  await openCalculator(page, { width: 320, height: 800 });

  await expect(page.locator('.mobile-summary-context')).toBeVisible();
  await expect(page.locator('#interest-comparison-mobile')).toContainText('$510,178 original');

  await page.getByRole('spinbutton', { name: 'Home price in dollars' }).fill('2000000');
  await page.getByRole('spinbutton', { name: 'Down payment in dollars' }).fill('0');
  await page.getByRole('spinbutton', { name: 'Annual interest rate percentage' }).fill('10');
  await page.getByRole('spinbutton', { name: 'Extra monthly payment in dollars' }).fill('30000');
  await page.getByRole('combobox', { name: 'Start year' }).selectOption('1');
  await page.getByRole('combobox', { name: 'Start month within year' }).selectOption('1');

  await expect(page.locator('#interest-saved')).toHaveText('$3,845,777');
  await expect(page.locator('#payment-with-extras')).toHaveText('$47,551');
  await expect(page.locator('#time-saved')).toHaveText('25 yr 7 mo');

  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    chartWidth: document.querySelector('#chart-shell').getBoundingClientRect().width,
    resultsWidth: document.querySelector('.results').getBoundingClientRect().width,
    metricsFit: [...document.querySelectorAll('.result-summary strong')]
      .every(element => element.scrollWidth <= element.clientWidth + 1)
  }));
  expect(layout.scrollWidth).toBe(layout.clientWidth);
  expect(layout.metricsFit).toBe(true);
  expect(layout.chartWidth / layout.resultsWidth).toBeGreaterThan(0.88);

  const extra = page.getByRole('spinbutton', { name: 'Extra monthly payment in dollars' });
  await extra.focus();
  const focus = await extra.evaluate(element => {
    const style = getComputedStyle(element);
    return { color: style.outlineColor, style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(focus).toEqual({ color: 'rgb(70, 106, 151)', style: 'solid', width: '3px' });
});
