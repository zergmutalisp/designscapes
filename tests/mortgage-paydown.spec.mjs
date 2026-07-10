import { expect, test } from '@playwright/test';

const calculatorPath = 'demos/mortgage-paydown/';

async function openCalculator(page, viewport = { width: 1366, height: 768 }) {
  await page.setViewportSize(viewport);
  await page.goto(calculatorPath);
}

test('shows verified defaults and a keyboard-readable desktop inspector', async ({ page }) => {
  await openCalculator(page, { width: 1440, height: 900 });

  await expect(page.locator('#interest-saved')).toHaveText('$267,928');
  await expect(page.locator('#payment-with-extras')).toHaveText('$3,528');
  await expect(page.locator('#time-saved')).toHaveText('14 yr 6 mo');
  await expect(page.locator('#year-original-balance')).toHaveText('$390,759');
  await expect(page.locator('#year-balance-gap')).toHaveText('$11,303');

  const detail = page.locator('#year-detail');
  await expect(detail).toBeVisible();
  const detailBox = await detail.boundingBox();
  expect(detailBox.width).toBeGreaterThan(200);
  expect(detailBox.height).toBeGreaterThan(60);

  const inspector = page.getByRole('slider', { name: 'Inspect year' });
  await inspector.focus();
  await inspector.press('ArrowRight');
  await expect(page.locator('#inspect-year-output')).toHaveText('Year 3');
  await expect(page.locator('#year-detail-status')).toContainText('original schedule');
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
  await expect(page.getByRole('combobox', { name: 'Start year' })).toHaveValue('2');
  await expect(page.getByRole('combobox', { name: 'Start month within year' })).toHaveValue('2');
  await expect(page.locator('#interest-saved')).toHaveText('$267,928');
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
    metricsFit: [...document.querySelectorAll('.result-summary strong')]
      .every(element => element.scrollWidth <= element.clientWidth + 1)
  }));
  expect(layout.scrollWidth).toBe(layout.clientWidth);
  expect(layout.metricsFit).toBe(true);

  const extra = page.getByRole('spinbutton', { name: 'Extra monthly payment in dollars' });
  await extra.focus();
  const focus = await extra.evaluate(element => {
    const style = getComputedStyle(element);
    return { color: style.outlineColor, style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(focus).toEqual({ color: 'rgb(7, 95, 70)', style: 'solid', width: '3px' });
});
