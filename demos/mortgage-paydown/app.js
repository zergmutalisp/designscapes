import { calculateMortgage } from './mortgage-core.js';

(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const chart = byId('paydown-chart');
  const chartShell = byId('chart-shell');
  const tooltip = byId('chart-tooltip');
  const inspectYear = byId('inspect-year');
  const calculationStatus = byId('calculation-status');
  const pickers = {
    startYear: byId('start-year'),
    startMonth: byId('start-month-in-year'),
    endYear: byId('end-year'),
    endMonth: byId('end-month-in-year')
  };

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
    }
  };

  const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });
  const percent = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2
  });

  const metricAnimations = new Map();
  let model = null;
  let displayedPlan = [];
  let displayedOriginal = [];
  let chartAnimation = 0;
  let chartLayout = null;
  let statusTimer = 0;
  let downInputMode = 'percent';

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

  function setPairValue(key, value, snap = true) {
    const pair = pairs[key];
    const normalized = snap
      ? normalizeInput(pair.range, value)
      : clamp(value, Number(pair.number.min), Number(pair.number.max));
    pair.range.value = String(normalized);
    pair.number.value = String(normalized);
  }

  function syncDownFromPercent(value) {
    const normalizedPercent = normalizeInput(pairs.down.range, value);
    const price = Number(pairs.price.number.value);
    const dollars = Math.round(price * normalizedPercent / 100);
    pairs.down.range.value = String(normalizedPercent);
    pairs.down.number.max = String(price);
    pairs.down.number.value = String(dollars);
  }

  function syncDownFromDollars(value) {
    const price = Number(pairs.price.number.value);
    const dollars = Math.round(clamp(value, 0, price));
    const downPercent = price ? dollars / price * 100 : 0;
    pairs.down.number.max = String(price);
    pairs.down.number.value = String(dollars);
    pairs.down.range.value = String(clamp(downPercent, 0, 100));
  }

  function syncDownForPrice() {
    const price = Number(pairs.price.number.value);
    pairs.down.number.max = String(price);
    if (downInputMode === 'dollars') {
      syncDownFromDollars(Number(pairs.down.number.value));
    } else {
      syncDownFromPercent(Number(pairs.down.range.value));
    }
  }

  function monthPosition(month) {
    const year = Math.ceil(month / 12);
    const monthInYear = ((month - 1) % 12) + 1;
    return `Year ${year}, month ${monthInYear}`;
  }

  function pickerMonth(prefix) {
    const year = Number(pickers[`${prefix}Year`].value);
    const month = Number(pickers[`${prefix}Month`].value);
    return (year - 1) * 12 + month;
  }

  function setPickerMonth(prefix, loanMonth) {
    const normalized = clamp(Math.round(loanMonth), 1, 360);
    pickers[`${prefix}Year`].value = String(Math.ceil(normalized / 12));
    pickers[`${prefix}Month`].value = String(((normalized - 1) % 12) + 1);
  }

  function populatePickers() {
    const yearOptions = Array.from({ length: 30 }, (_, index) => {
      const year = index + 1;
      return `<option value="${year}">Year ${year}</option>`;
    }).join('');
    const monthOptions = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      return `<option value="${month}">Month ${month}</option>`;
    }).join('');

    pickers.startYear.innerHTML = yearOptions;
    pickers.endYear.innerHTML = yearOptions;
    pickers.startMonth.innerHTML = monthOptions;
    pickers.endMonth.innerHTML = monthOptions;
    setPickerMonth('start', 13);
    setPickerMonth('end', 360);
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
      price: Number(pairs.price.number.value),
      downPercent: Number(pairs.down.range.value),
      downPayment: Number(pairs.down.number.value),
      annualRate: Number(pairs.rate.range.value) / 100,
      extraAmount: Number(pairs.extra.range.value),
      startMonth: pickerMonth('start'),
      endMonth: pickerMonth('end')
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
    byId('down-payment-note').textContent = `${percent.format(model.downPercent)}% down · ${money.format(model.principal)} financed`;
    byId('start-month-note').textContent = `Loan month ${model.startMonth} · ${monthPosition(model.startMonth)}`;
    byId('end-month-note').textContent = `Loan month ${model.endMonth} · ${monthPosition(model.endMonth)}`;

    animateMetric(byId('interest-saved'), model.interestSaved, value => money.format(value));
    animateMetric(byId('payment-with-extras'), model.normalPayment + model.extraAmount, value => money.format(value));
    animateMetric(byId('time-saved'), model.monthsSaved, value => shortDuration(Math.round(value)));
    animateMetric(byId('monthly-payment'), model.normalPayment, value => money.format(value));

    byId('interest-comparison').textContent = `${money.format(model.plan.totalInterest)} with extras · ${money.format(model.original.totalInterest)} original`;
    byId('payment-comparison').textContent = `${money.format(model.normalPayment)} base P&I · ${money.format(model.plan.totalExtra)} extra principal contributed`;
    byId('payoff-comparison').textContent = model.monthsSaved
      ? `${duration(model.plan.payoffMonth)} with extras · 30 years original`
      : 'The extra-payment plan does not change the payoff time';

    pairs.price.range.setAttribute('aria-valuetext', money.format(model.price));
    pairs.down.range.setAttribute('aria-valuetext', `${percent.format(model.downPercent)} percent, ${money.format(model.downPayment)} down`);
    pairs.rate.range.setAttribute('aria-valuetext', `${(model.annualRate * 100).toFixed(2)} percent annual interest`);
    pairs.extra.range.setAttribute('aria-valuetext', `${money.format(model.extraAmount)} extra each month`);

    const savingsPercent = model.original.totalInterest
      ? Math.round(model.interestSaved / model.original.totalInterest * 100)
      : 0;
    byId('chart-description').textContent = `The extra-payment plan saves ${money.format(model.interestSaved)}, or ${savingsPercent} percent of original interest, and pays the loan off ${duration(model.monthsSaved)} earlier.`;
    clearTimeout(statusTimer);
    statusTimer = window.setTimeout(() => {
      calculationStatus.textContent = `Updated estimate: ${money.format(model.interestSaved)} interest saved, ${money.format(model.normalPayment + model.extraAmount)} per month during the extra-payment window, and payoff ${duration(model.monthsSaved)} earlier.`;
    }, reduceMotion.matches ? 0 : 420);
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
    const height = Math.max(400, Math.round(chartShell.clientHeight));
    const compact = width < 520;
    const margin = compact
      ? { top: 34, right: 12, bottom: 42, left: 42 }
      : { top: 34, right: 22, bottom: 46, left: 54 };
    const plotLeft = margin.left;
    const plotRight = width - margin.right;
    const plotWidth = plotRight - plotLeft;
    const panelGap = compact ? 48 : 54;
    const panelSpace = height - margin.top - margin.bottom - panelGap;
    const paymentHeight = panelSpace * 0.48;
    const balanceHeight = panelSpace - paymentHeight;
    const paymentTop = margin.top;
    const paymentBottom = paymentTop + paymentHeight;
    const balanceTop = paymentBottom + panelGap;
    const balanceBottom = balanceTop + balanceHeight;
    const step = plotWidth / 30;
    const barWidth = Math.max(3, Math.min(18, step * 0.58));
    const annualMax = niceCeiling(Math.max(
      ...planYears.map(year => year.principal + year.interest),
      ...originalYears.map(year => year.principal + year.interest)
    ) * 1.05);
    const selectedIndex = Number(inspectYear.value) - 1;
    const xFor = index => plotLeft + step * (index + 0.5);
    const paymentY = value => paymentBottom - value / annualMax * paymentHeight;
    const balanceY = value => balanceBottom - value / Math.max(1, model.principal) * balanceHeight;
    const planPoints = planYears.map((year, index) => ({ x: xFor(index), y: balanceY(year.balance) }));
    const originalPoints = originalYears.map((year, index) => ({ x: xFor(index), y: balanceY(year.balance) }));
    const selectedPlan = planPoints[selectedIndex];
    const selectedOriginal = originalPoints[selectedIndex];
    const selectedYear = planYears[selectedIndex];
    const selectedBandX = xFor(selectedIndex) - step / 2;
    const selectedReading = compact
      ? `<text class="selected-reading" x="${plotRight}" y="${paymentBottom + 18}" text-anchor="end">Year ${selectedIndex + 1} · ${selectedYear.balance <= 0.5 ? 'Paid off' : `${compactCurrency(selectedYear.balance)} left`}</text>`
      : '';

    const paymentGrid = [0, 0.5, 1].map(ratio => {
      const y = paymentBottom - ratio * paymentHeight;
      return `
        <line class="grid-line" x1="${plotLeft}" y1="${y}" x2="${plotRight}" y2="${y}"></line>
        <text class="axis-text" x="${plotLeft - 8}" y="${y + 4}" text-anchor="end">${compactCurrency(annualMax * ratio)}</text>
      `;
    }).join('');

    const balanceGrid = [0, 0.5, 1].map(ratio => {
      const y = balanceBottom - ratio * balanceHeight;
      return `
        <line class="grid-line" x1="${plotLeft}" y1="${y}" x2="${plotRight}" y2="${y}"></line>
        <text class="axis-text" x="${plotLeft - 8}" y="${y + 4}" text-anchor="end">${compactCurrency(model.principal * ratio)}</text>
      `;
    }).join('');

    const areaPath = `${pathFrom(planPoints)} L${planPoints[planPoints.length - 1].x},${balanceBottom} L${planPoints[0].x},${balanceBottom} Z`;

    const bars = planYears.map((year, index) => {
      const x = xFor(index) - barWidth / 2;
      const regularHeight = year.regularPrincipal / annualMax * paymentHeight;
      const extraHeight = year.extraPrincipal / annualMax * paymentHeight;
      const interestHeight = year.interest / annualMax * paymentHeight;
      const regularY = paymentBottom - regularHeight;
      const extraY = regularY - extraHeight;
      const interestY = extraY - interestHeight;

      return `
        <g>
          <rect class="bar-principal" x="${x}" y="${regularY}" width="${barWidth}" height="${Math.max(0, regularHeight)}"></rect>
          <rect class="bar-extra" x="${x}" y="${extraY}" width="${barWidth}" height="${Math.max(0, extraHeight)}"></rect>
          <rect class="bar-interest" x="${x}" y="${interestY}" width="${barWidth}" height="${Math.max(0, interestHeight)}"></rect>
          <rect class="year-hit" data-year="${index + 1}" x="${xFor(index) - step / 2}" y="${paymentTop}" width="${step}" height="${balanceBottom - paymentTop}"></rect>
        </g>
      `;
    }).join('');

    const labelYears = compact ? [1, 10, 20, 30] : [1, 5, 10, 15, 20, 25, 30];
    const xLabels = labelYears.map(year => `
      <text class="axis-text" x="${xFor(year - 1)}" y="${balanceBottom + 24}" text-anchor="middle">${year}</text>
    `).join('');

    chart.setAttribute('viewBox', `0 0 ${width} ${height}`);
    chart.innerHTML = `
      <text class="axis-label" x="${plotLeft}" y="16">Annual principal and interest</text>
      <text class="axis-label" x="${plotLeft}" y="${balanceTop - 14}">Remaining mortgage balance</text>
      <rect class="selected-band" x="${selectedBandX}" y="${paymentTop}" width="${step}" height="${balanceBottom - paymentTop}"></rect>
      ${paymentGrid}
      ${bars}
      ${balanceGrid}
      <path class="plan-area" d="${areaPath}"></path>
      <path class="original-line" d="${pathFrom(originalPoints)}"></path>
      <path class="plan-line" d="${pathFrom(planPoints)}"></path>
      <circle class="selected-point original" cx="${selectedOriginal.x}" cy="${selectedOriginal.y}" r="5"></circle>
      <circle class="selected-point plan" cx="${selectedPlan.x}" cy="${selectedPlan.y}" r="5"></circle>
      ${selectedReading}
      ${xLabels}
      <text class="axis-label" x="${plotLeft + plotWidth / 2}" y="${height - 6}" text-anchor="middle">Mortgage year</text>
    `;

    chartLayout = {
      width,
      height,
      positions: planYears.map((year, index) => ({
        x: xFor(index),
        stackTop: paymentY(year.principal + year.interest)
      }))
    };

    if (!compact) {
      chart.querySelectorAll('.year-hit').forEach(hit => {
        hit.addEventListener('pointerenter', () => {
          selectYear(Number(hit.dataset.year));
          showTooltip(Number(hit.dataset.year));
        });
        hit.addEventListener('click', () => {
          selectYear(Number(hit.dataset.year));
          showTooltip(Number(hit.dataset.year));
          updateYearDetail(true);
        });
      });
    }
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

  function updateYearDetail(announce = false) {
    if (!model) return;
    const index = Number(inspectYear.value) - 1;
    const yearNumber = index + 1;
    const planYear = model.plan.years[index];
    const originalYear = model.original.years[index];
    const interestDifference = Math.max(0, originalYear.interest - planYear.interest);
    const payoffYear = Math.ceil(model.plan.payoffMonth / 12);
    const paidOff = planYear.balance <= 0.005;
    const afterPayoff = yearNumber > payoffYear;
    const balanceText = paidOff ? 'Paid off' : money.format(planYear.balance);

    byId('inspect-year-output').textContent = `Year ${yearNumber}`;
    inspectYear.setAttribute('aria-valuetext', paidOff
      ? `Mortgage year ${yearNumber}, paid off`
      : `Mortgage year ${yearNumber}, ${money.format(planYear.balance)} remaining`);
    byId('year-balance').textContent = balanceText;
    byId('year-interest').textContent = money.format(planYear.interest);
    byId('year-principal').textContent = money.format(planYear.principal);
    byId('year-interest-row').hidden = afterPayoff;
    byId('year-principal-row').hidden = afterPayoff;

    let note;
    if (afterPayoff) {
      note = `Loan paid off in Year ${payoffYear}.`;
    } else {
      const details = [];
      if (planYear.extraPrincipal > 0.005) details.push(`Includes ${money.format(planYear.extraPrincipal)} extra principal`);
      if (interestDifference > 0.005) details.push(`${money.format(interestDifference)} interest saved this year`);
      if (paidOff) details.push(`Loan paid off during Year ${payoffYear}`);
      note = details.length ? details.join(' · ') : 'No extra principal scheduled this year.';
    }
    byId('year-detail-note').textContent = note;

    if (announce) {
      byId('year-detail-status').textContent = afterPayoff
        ? `Year ${yearNumber}. Loan paid off in Year ${payoffYear}.`
        : `Year ${yearNumber}. ${balanceText} remaining. ${money.format(planYear.interest)} interest and ${money.format(planYear.principal)} principal paid this year.`;
    }
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

  Object.entries(pairs).filter(([key]) => key !== 'down').forEach(([key, pair]) => {
    const handle = source => {
      const value = Number(source.value);
      if (!Number.isFinite(value)) return;
      const shouldSnap = source === pair.range || key !== 'price';
      setPairValue(key, value, shouldSnap);
      if (key === 'price') syncDownForPrice();
      updateModel();
    };

    pair.range.addEventListener('input', () => handle(pair.range));
    pair.number.addEventListener('input', () => {
      const value = Number(pair.number.value);
      if (pair.number.value === '' || !Number.isFinite(value)) return;
      if (value < Number(pair.number.min) || value > Number(pair.number.max)) return;
      handle(pair.number);
    });
    pair.number.addEventListener('blur', () => {
      if (pair.number.value === '') {
        setPairValue(key, Number(pair.range.value));
      } else {
        handle(pair.number);
      }
    });
  });

  pairs.down.range.addEventListener('input', () => {
    downInputMode = 'percent';
    syncDownFromPercent(Number(pairs.down.range.value));
    updateModel();
  });

  pairs.down.number.addEventListener('input', () => {
    const value = Number(pairs.down.number.value);
    if (pairs.down.number.value === '' || !Number.isFinite(value)) return;
    if (value < 0 || value > Number(pairs.down.number.max)) return;
    downInputMode = 'dollars';
    syncDownFromDollars(value);
    updateModel();
  });

  pairs.down.number.addEventListener('blur', () => {
    if (pairs.down.number.value === '') {
      syncDownFromDollars(model ? model.downPayment : 0);
    } else {
      downInputMode = 'dollars';
      syncDownFromDollars(Number(pairs.down.number.value));
    }
    updateModel();
  });

  [pickers.startYear, pickers.startMonth].forEach(picker => {
    picker.addEventListener('change', () => {
      const start = pickerMonth('start');
      if (start > pickerMonth('end')) setPickerMonth('end', start);
      updateModel();
    });
  });

  [pickers.endYear, pickers.endMonth].forEach(picker => {
    picker.addEventListener('change', () => {
      const end = pickerMonth('end');
      if (end < pickerMonth('start')) setPickerMonth('start', end);
      updateModel();
    });
  });

  inspectYear.addEventListener('input', () => {
    tooltip.hidden = true;
    updateYearDetail();
    renderChart();
  });

  inspectYear.addEventListener('change', () => updateYearDetail(true));

  chartShell.addEventListener('pointerleave', () => {
    tooltip.hidden = true;
  });

  const resizeObserver = new ResizeObserver(() => renderChart());
  resizeObserver.observe(chartShell);

  populatePickers();
  syncDownForPrice();
  model = calculate();
  displayedPlan = model.plan.years.map(year => ({ ...year }));
  displayedOriginal = model.original.years.map(year => ({ ...year }));
  updateText();
  renderChart();
})();
