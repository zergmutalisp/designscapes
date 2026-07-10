import { calculateMortgage } from './mortgage-core.js';

(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const chart = byId('paydown-chart');
  const chartShell = byId('chart-shell');
  const tooltip = byId('chart-tooltip');
  const inspectYear = byId('inspect-year');

  const pairs = {
    price: {
      range: byId('home-price-range'),
      number: byId('home-price-number')
    },
    down: {
      range: byId('down-payment-range'),
      number: byId('down-payment-number')
    },
    rate: {
      range: byId('interest-rate-range'),
      number: byId('interest-rate-number')
    },
    extra: {
      range: byId('extra-payment-range'),
      number: byId('extra-payment-number')
    },
    start: {
      range: byId('start-month-range'),
      number: byId('start-month-number')
    },
    end: {
      range: byId('end-month-range'),
      number: byId('end-month-number')
    }
  };

  const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  const metricAnimations = new Map();
  let model = null;
  let displayedPlan = [];
  let displayedOriginal = [];
  let chartAnimation = 0;
  let chartLayout = null;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function decimals(value) {
    const text = String(value);
    return text.includes('.') ? text.split('.')[1].length : 0;
  }

  function normalizeInput(input, value) {
    const min = Number(input.min);
    const max = Number(input.max);
    const step = Number(input.step) || 1;
    const precision = decimals(step);
    const snapped = min + Math.round((clamp(value, min, max) - min) / step) * step;
    return Number(snapped.toFixed(precision));
  }

  function setPairValue(key, value) {
    const pair = pairs[key];
    const normalized = normalizeInput(pair.range, value);
    pair.range.value = String(normalized);
    pair.number.value = String(normalized);
  }

  function monthPosition(month) {
    const year = Math.ceil(month / 12);
    const monthInYear = ((month - 1) % 12) + 1;
    return `Year ${year}, month ${monthInYear}`;
  }

  function duration(months) {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    const parts = [];
    if (years) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    if (remainingMonths) parts.push(`${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`);
    return parts.length ? parts.join(' ') : '0 months';
  }

  function shortDuration(months) {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (!years) return `${remainingMonths} mo`;
    if (!remainingMonths) return `${years} yr`;
    return `${years} yr ${remainingMonths} mo`;
  }

  function compactCurrency(value) {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `$${Math.round(value / 1000)}k`;
    }
    return money.format(value);
  }

  function readState() {
    return {
      price: Number(pairs.price.range.value),
      downPercent: Number(pairs.down.range.value),
      annualRate: Number(pairs.rate.range.value) / 100,
      extraAmount: Number(pairs.extra.range.value),
      startMonth: Number(pairs.start.range.value),
      endMonth: Number(pairs.end.range.value)
    };
  }

  function calculate() {
    return calculateMortgage(readState());
  }

  function animateMetric(element, endValue, formatter) {
    if (metricAnimations.has(element)) cancelAnimationFrame(metricAnimations.get(element));
    const startValue = Number(element.dataset.metricValue ?? endValue);

    if (reduceMotion.matches || startValue === endValue) {
      element.dataset.metricValue = String(endValue);
      element.textContent = formatter(endValue);
      return;
    }

    const started = performance.now();
    const run = now => {
      const raw = Math.min(1, (now - started) / 340);
      const progress = 1 - Math.pow(1 - raw, 3);
      const current = startValue + (endValue - startValue) * progress;
      element.dataset.metricValue = String(current);
      element.textContent = formatter(current);
      if (raw < 1) {
        metricAnimations.set(element, requestAnimationFrame(run));
      } else {
        element.dataset.metricValue = String(endValue);
        element.textContent = formatter(endValue);
        metricAnimations.delete(element);
      }
    };

    metricAnimations.set(element, requestAnimationFrame(run));
  }

  function updateText() {
    byId('down-payment-note').textContent = `${money.format(model.downPayment)} down · ${money.format(model.principal)} financed`;
    byId('start-month-note').textContent = monthPosition(model.startMonth);
    byId('end-month-note').textContent = monthPosition(model.endMonth);

    animateMetric(byId('interest-saved'), model.interestSaved, value => money.format(value));
    animateMetric(byId('time-saved'), model.monthsSaved, value => shortDuration(Math.round(value)));
    animateMetric(byId('monthly-payment'), model.normalPayment, value => money.format(value));

    byId('interest-comparison').textContent = `${money.format(model.plan.totalInterest)} with extras · ${money.format(model.original.totalInterest)} original`;
    byId('payoff-comparison').textContent = model.monthsSaved
      ? `${duration(model.plan.payoffMonth)} with extras · 30 years original`
      : 'The extra-payment plan does not change the payoff date';

    const savingsPercent = model.original.totalInterest
      ? Math.round(model.interestSaved / model.original.totalInterest * 100)
      : 0;
    byId('chart-description').textContent = `The extra-payment plan saves ${money.format(model.interestSaved)}, or ${savingsPercent} percent of original interest, and pays the loan off ${duration(model.monthsSaved)} earlier.`;
    updateYearDetail();
  }

  function niceCeiling(value) {
    if (value <= 0) return 1;
    const scale = Math.pow(10, Math.floor(Math.log10(value)));
    const ratio = value / scale;
    const step = ratio <= 1 ? 1 : ratio <= 2 ? 2 : ratio <= 5 ? 5 : 10;
    return step * scale;
  }

  function pathFrom(points) {
    return points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ');
  }

  function renderChart(planYears = displayedPlan, originalYears = displayedOriginal) {
    if (!model || !planYears.length || !originalYears.length) return;

    const width = Math.max(220, Math.round(chartShell.clientWidth));
    const height = Math.max(340, Math.round(chartShell.clientHeight));
    const compact = width < 520;
    const margin = compact
      ? { top: 34, right: 44, bottom: 46, left: 42 }
      : { top: 34, right: 58, bottom: 48, left: 54 };
    const plotLeft = margin.left;
    const plotRight = width - margin.right;
    const plotTop = margin.top;
    const plotBottom = height - margin.bottom;
    const plotWidth = plotRight - plotLeft;
    const plotHeight = plotBottom - plotTop;
    const step = plotWidth / 30;
    const barWidth = Math.max(3, Math.min(18, step * 0.58));
    const annualMax = niceCeiling(Math.max(
      ...planYears.map(year => year.principal + year.interest),
      ...originalYears.map(year => year.principal + year.interest)
    ) * 1.05);
    const selectedIndex = Number(inspectYear.value) - 1;
    const xFor = index => plotLeft + step * (index + 0.5);
    const paymentY = value => plotBottom - value / annualMax * plotHeight;
    const balanceY = value => plotBottom - value / Math.max(1, model.principal) * plotHeight;
    const planPoints = planYears.map((year, index) => ({ x: xFor(index), y: balanceY(year.balance) }));
    const originalPoints = originalYears.map((year, index) => ({ x: xFor(index), y: balanceY(year.balance) }));
    const selectedPlan = planPoints[selectedIndex];
    const selectedOriginal = originalPoints[selectedIndex];
    const selectedYear = planYears[selectedIndex];
    const selectedStackTop = paymentY(selectedYear.principal + selectedYear.interest);
    const selectedBandX = xFor(selectedIndex) - step / 2;

    const grid = [0, 0.5, 1].map(ratio => {
      const y = plotBottom - ratio * plotHeight;
      return `
        <line class="grid-line" x1="${plotLeft}" y1="${y}" x2="${plotRight}" y2="${y}"></line>
        <text class="axis-text" x="${plotLeft - 8}" y="${y + 4}" text-anchor="end">${compactCurrency(annualMax * ratio)}</text>
        <text class="axis-text" x="${plotRight + 8}" y="${y + 4}" text-anchor="start">${compactCurrency(model.principal * ratio)}</text>
      `;
    }).join('');

    const areaPath = `${pathFrom(planPoints)} L${planPoints[planPoints.length - 1].x},${plotBottom} L${planPoints[0].x},${plotBottom} Z`;

    const bars = planYears.map((year, index) => {
      const x = xFor(index) - barWidth / 2;
      const regularHeight = year.regularPrincipal / annualMax * plotHeight;
      const extraHeight = year.extraPrincipal / annualMax * plotHeight;
      const interestHeight = year.interest / annualMax * plotHeight;
      const regularY = plotBottom - regularHeight;
      const extraY = regularY - extraHeight;
      const interestY = extraY - interestHeight;

      return `
        <g>
          <rect class="bar-principal" x="${x}" y="${regularY}" width="${barWidth}" height="${Math.max(0, regularHeight)}"></rect>
          <rect class="bar-extra" x="${x}" y="${extraY}" width="${barWidth}" height="${Math.max(0, extraHeight)}"></rect>
          <rect class="bar-interest" x="${x}" y="${interestY}" width="${barWidth}" height="${Math.max(0, interestHeight)}"></rect>
          <rect class="year-hit" data-year="${index + 1}" x="${xFor(index) - step / 2}" y="${plotTop}" width="${step}" height="${plotHeight}"></rect>
        </g>
      `;
    }).join('');

    const xLabels = [1, 5, 10, 15, 20, 25, 30].map(year => `
      <text class="axis-text" x="${xFor(year - 1)}" y="${plotBottom + 24}" text-anchor="middle">${year}</text>
    `).join('');

    chart.setAttribute('viewBox', `0 0 ${width} ${height}`);
    chart.innerHTML = `
      <text class="axis-label" x="${plotLeft}" y="14">${compact ? 'Annual paid' : 'Annual payment'}</text>
      <text class="axis-label" x="${plotRight}" y="14" text-anchor="end">Remaining balance</text>
      ${grid}
      <rect class="selected-band" x="${selectedBandX}" y="${plotTop}" width="${step}" height="${plotHeight}"></rect>
      <path class="plan-area" d="${areaPath}"></path>
      ${bars}
      <path class="original-line" d="${pathFrom(originalPoints)}"></path>
      <path class="plan-line" d="${pathFrom(planPoints)}"></path>
      <circle class="selected-point original" cx="${selectedOriginal.x}" cy="${selectedOriginal.y}" r="5"></circle>
      <circle class="selected-point plan" cx="${selectedPlan.x}" cy="${selectedPlan.y}" r="5"></circle>
      ${xLabels}
      <text class="axis-label" x="${plotLeft + plotWidth / 2}" y="${height - 6}" text-anchor="middle">Mortgage year</text>
    `;

    chartLayout = {
      width,
      height,
      positions: planYears.map((year, index) => ({
        x: xFor(index),
        stackTop: paymentY(year.principal + year.interest)
      })),
      selectedStackTop
    };

    chart.querySelectorAll('.year-hit').forEach(hit => {
      hit.addEventListener('pointerenter', () => {
        selectYear(Number(hit.dataset.year));
        showTooltip(Number(hit.dataset.year));
      });
      hit.addEventListener('click', () => {
        selectYear(Number(hit.dataset.year));
        showTooltip(Number(hit.dataset.year));
      });
    });
  }

  function interpolateYears(start, end, progress) {
    return end.map((year, index) => ({
      year: year.year,
      interest: start[index].interest + (year.interest - start[index].interest) * progress,
      regularPrincipal: start[index].regularPrincipal + (year.regularPrincipal - start[index].regularPrincipal) * progress,
      extraPrincipal: start[index].extraPrincipal + (year.extraPrincipal - start[index].extraPrincipal) * progress,
      principal: start[index].principal + (year.principal - start[index].principal) * progress,
      balance: start[index].balance + (year.balance - start[index].balance) * progress
    }));
  }

  function animateChart(nextPlan, nextOriginal) {
    cancelAnimationFrame(chartAnimation);
    const startPlan = displayedPlan.length
      ? displayedPlan.map(year => ({ ...year }))
      : nextPlan.map(year => ({ ...year }));
    const startOriginal = displayedOriginal.length
      ? displayedOriginal.map(year => ({ ...year }))
      : nextOriginal.map(year => ({ ...year }));

    if (reduceMotion.matches || !displayedPlan.length) {
      displayedPlan = nextPlan.map(year => ({ ...year }));
      displayedOriginal = nextOriginal.map(year => ({ ...year }));
      renderChart();
      return;
    }

    const started = performance.now();
    const frame = now => {
      const raw = Math.min(1, (now - started) / 360);
      const progress = 1 - Math.pow(1 - raw, 3);
      displayedPlan = interpolateYears(startPlan, nextPlan, progress);
      displayedOriginal = interpolateYears(startOriginal, nextOriginal, progress);
      renderChart();
      if (raw < 1) chartAnimation = requestAnimationFrame(frame);
    };
    chartAnimation = requestAnimationFrame(frame);
  }

  function updateYearDetail() {
    if (!model) return;
    const index = Number(inspectYear.value) - 1;
    const planYear = model.plan.years[index];
    const originalYear = model.original.years[index];
    const interestDifference = Math.max(0, originalYear.interest - planYear.interest);
    byId('inspect-year-output').textContent = `Year ${index + 1}`;
    byId('year-detail').textContent = `${money.format(planYear.interest)} interest · ${money.format(interestDifference)} less than original · ${money.format(planYear.extraPrincipal)} extra principal · ${money.format(planYear.balance)} balance`;
  }

  function selectYear(year) {
    const nextYear = clamp(year, 1, 30);
    if (Number(inspectYear.value) === nextYear) {
      updateYearDetail();
      return;
    }
    inspectYear.value = String(nextYear);
    updateYearDetail();
    renderChart();
  }

  function showTooltip(year) {
    if (!model || !chartLayout) return;
    const index = year - 1;
    const planYear = model.plan.years[index];
    const originalYear = model.original.years[index];
    const interestDifference = Math.max(0, originalYear.interest - planYear.interest);
    const position = chartLayout.positions[index];

    tooltip.innerHTML = `
      <strong>Year ${year}</strong>
      <span>${money.format(planYear.interest)} interest · ${money.format(interestDifference)} saved that year</span>
      <span>${money.format(planYear.extraPrincipal)} extra principal · ${money.format(planYear.balance)} balance</span>
    `;
    tooltip.hidden = false;

    requestAnimationFrame(() => {
      const bounds = tooltip.getBoundingClientRect();
      const left = clamp(position.x - bounds.width / 2, 8, chartLayout.width - bounds.width - 8);
      const top = clamp(position.stackTop - bounds.height - 12, 8, chartLayout.height - bounds.height - 8);
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    });
  }

  function updateModel() {
    model = calculate();
    updateText();
    animateChart(model.plan.years, model.original.years);
  }

  Object.entries(pairs).forEach(([key, pair]) => {
    const handle = source => {
      const value = Number(source.value);
      if (!Number.isFinite(value)) return;
      setPairValue(key, value);

      if (key === 'start' && Number(pairs.start.range.value) > Number(pairs.end.range.value)) {
        setPairValue('end', Number(pairs.start.range.value));
      }
      if (key === 'end' && Number(pairs.end.range.value) < Number(pairs.start.range.value)) {
        setPairValue('start', Number(pairs.end.range.value));
      }
      updateModel();
    };

    pair.range.addEventListener('input', () => handle(pair.range));
    pair.number.addEventListener('change', () => handle(pair.number));
    pair.number.addEventListener('blur', () => {
      if (pair.number.value === '') setPairValue(key, Number(pair.range.value));
    });
  });

  inspectYear.addEventListener('input', () => {
    tooltip.hidden = true;
    updateYearDetail();
    renderChart();
  });

  chartShell.addEventListener('pointerleave', () => {
    tooltip.hidden = true;
  });

  const resizeObserver = new ResizeObserver(() => renderChart());
  resizeObserver.observe(chartShell);

  model = calculate();
  displayedPlan = model.plan.years.map(year => ({ ...year }));
  displayedOriginal = model.original.years.map(year => ({ ...year }));
  updateText();
  renderChart();
})();
