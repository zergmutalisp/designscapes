export function amortize({
  principal,
  monthlyRate,
  normalPayment,
  extraAmount = 0,
  startMonth = 1,
  endMonth = 360,
  termMonths = 360
}) {
  let balance = principal;
  let totalInterest = 0;
  let totalExtra = 0;
  let payoffMonth = termMonths;
  let firstExtraMonth = null;
  let lastExtraMonth = null;
  let appliedExtraMonths = 0;
  let maxExtraPayment = 0;
  let maxPaymentWithExtra = 0;
  const yearCount = Math.ceil(termMonths / 12);
  const years = Array.from({ length: yearCount }, (_, index) => ({
    year: index + 1,
    interest: 0,
    regularPrincipal: 0,
    extraPrincipal: 0,
    principal: 0,
    balance: principal
  }));

  for (let month = 1; month <= termMonths; month += 1) {
    if (balance <= 0.005) {
      payoffMonth = month - 1;
      break;
    }

    const year = years[Math.floor((month - 1) / 12)];
    const interest = balance * monthlyRate;
    const regularPrincipal = Math.min(balance, Math.max(0, normalPayment - interest));
    const balanceAfterRegular = balance - regularPrincipal;
    const requestedExtra = month >= startMonth && month <= endMonth ? extraAmount : 0;
    const extraPrincipal = Math.min(balanceAfterRegular, requestedExtra);
    const principalPaid = regularPrincipal + extraPrincipal;

    balance = Math.max(0, balance - principalPaid);
    totalInterest += interest;
    totalExtra += extraPrincipal;
    if (extraPrincipal > 0.005) {
      if (firstExtraMonth === null) firstExtraMonth = month;
      lastExtraMonth = month;
      appliedExtraMonths += 1;
      maxExtraPayment = Math.max(maxExtraPayment, extraPrincipal);
      maxPaymentWithExtra = Math.max(maxPaymentWithExtra, interest + regularPrincipal + extraPrincipal);
    }
    year.interest += interest;
    year.regularPrincipal += regularPrincipal;
    year.extraPrincipal += extraPrincipal;
    year.principal += principalPaid;
    year.balance = balance;

    if (balance <= 0.005) payoffMonth = month;
  }

  let lastBalance = principal;
  years.forEach(year => {
    if (year.interest || year.principal) {
      lastBalance = year.balance;
    } else {
      year.balance = lastBalance;
    }
    if (lastBalance <= 0.005) year.balance = 0;
  });

  return {
    years,
    totalInterest,
    totalExtra,
    payoffMonth,
    firstExtraMonth,
    lastExtraMonth,
    appliedExtraMonths,
    maxExtraPayment,
    maxPaymentWithExtra
  };
}

export function calculateMortgage({
  price,
  downPercent,
  downPayment: requestedDownPayment,
  annualRate,
  extraAmount,
  startMonth,
  endMonth,
  termMonths = 360
}) {
  const downPayment = Number.isFinite(requestedDownPayment)
    ? Math.min(price, Math.max(0, requestedDownPayment))
    : price * downPercent / 100;
  const resolvedDownPercent = price ? downPayment / price * 100 : 0;
  const principal = price - downPayment;
  const hasLoan = principal > 0.005;
  const monthlyRate = annualRate / 12;
  const growth = Math.pow(1 + monthlyRate, termMonths);
  const normalPayment = monthlyRate === 0
    ? principal / termMonths
    : principal * monthlyRate * growth / (growth - 1);
  const original = amortize({
    principal,
    monthlyRate,
    normalPayment,
    termMonths
  });
  const plan = amortize({
    principal,
    monthlyRate,
    normalPayment,
    extraAmount,
    startMonth,
    endMonth,
    termMonths
  });

  return {
    price,
    downPercent: resolvedDownPercent,
    annualRate,
    extraAmount,
    startMonth,
    endMonth,
    hasLoan,
    downPayment,
    principal,
    normalPayment,
    original,
    plan,
    interestSaved: Math.max(0, original.totalInterest - plan.totalInterest),
    monthsSaved: Math.max(0, original.payoffMonth - plan.payoffMonth)
  };
}
