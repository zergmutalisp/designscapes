import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMortgage } from './mortgage-core.js';

const baseScenario = {
  price: 500000,
  downPercent: 20,
  annualRate: 0.065,
  extraAmount: 1000,
  startMonth: 14,
  endMonth: 360
};

function closeTo(actual, expected, tolerance = 0.02) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} was not within ${tolerance} of ${expected}`);
}

test('calculates the default accelerated payoff scenario', () => {
  const result = calculateMortgage(baseScenario);

  closeTo(result.normalPayment, 2528.27);
  closeTo(result.original.totalInterest, 510177.95);
  closeTo(result.plan.totalInterest, 242250.01);
  closeTo(result.interestSaved, 267927.94);
  assert.equal(result.plan.payoffMonth, 186);
  assert.equal(result.monthsSaved, 174);
  assert.equal(result.hasLoan, true);
  assert.equal(result.plan.firstExtraMonth, 14);
  assert.equal(result.plan.lastExtraMonth, 185);
  assert.equal(result.plan.appliedExtraMonths, 172);
  closeTo(result.plan.maxExtraPayment, 1000);
  closeTo(result.plan.maxPaymentWithExtra, 3528.27);
});

test('matches the original schedule when no extra payment is made', () => {
  const result = calculateMortgage({ ...baseScenario, extraAmount: 0 });

  closeTo(result.interestSaved, 0);
  assert.equal(result.monthsSaved, 0);
  assert.equal(result.plan.payoffMonth, 360);
});

test('supports a one-time extra payment by matching start and end months', () => {
  const result = calculateMortgage({
    ...baseScenario,
    extraAmount: 5000,
    startMonth: 24,
    endMonth: 24
  });

  closeTo(result.plan.totalExtra, 5000);
  assert.ok(result.interestSaved > 0);
  assert.ok(result.monthsSaved > 0);
});

test('stops extra payments when the mortgage is paid off', () => {
  const result = calculateMortgage({
    ...baseScenario,
    extraAmount: 5000,
    startMonth: 1,
    endMonth: 360
  });

  assert.ok(result.plan.payoffMonth < 360);
  assert.ok(result.plan.totalExtra < 5000 * 360);
  assert.equal(result.plan.years[29].balance, 0);
});

test('supports the public $30,000 monthly extra-payment ceiling', () => {
  const result = calculateMortgage({
    ...baseScenario,
    extraAmount: 30000,
    startMonth: 1,
    endMonth: 360
  });

  assert.ok(result.plan.payoffMonth < 24);
  assert.ok(result.plan.totalExtra < 30000 * 24);
  assert.ok(result.interestSaved > 0);
  assert.equal(result.plan.years[29].balance, 0);
});

test('preserves an exact dollar down payment', () => {
  const result = calculateMortgage({
    ...baseScenario,
    price: 537500,
    downPayment: 123456
  });

  closeTo(result.downPayment, 123456, 0.001);
  closeTo(result.principal, 414044, 0.001);
  closeTo(result.downPercent, 123456 / 537500 * 100, 0.0001);
});

test('reports when a selected extra-payment window cannot apply principal', () => {
  const result = calculateMortgage({
    ...baseScenario,
    extraAmount: 30000,
    startMonth: 360,
    endMonth: 360
  });

  closeTo(result.plan.totalExtra, 0);
  closeTo(result.interestSaved, 0);
  assert.equal(result.plan.firstExtraMonth, null);
  assert.equal(result.plan.lastExtraMonth, null);
  assert.equal(result.plan.appliedExtraMonths, 0);
  closeTo(result.plan.maxPaymentWithExtra, 0);
});

test('exposes an explicit no-mortgage state for a 100 percent down payment', () => {
  const result = calculateMortgage({
    ...baseScenario,
    downPayment: baseScenario.price
  });

  assert.equal(result.hasLoan, false);
  closeTo(result.principal, 0);
  closeTo(result.normalPayment, 0);
  closeTo(result.interestSaved, 0);
  assert.equal(result.original.payoffMonth, 0);
  assert.equal(result.plan.payoffMonth, 0);
  closeTo(result.plan.totalExtra, 0);
});
