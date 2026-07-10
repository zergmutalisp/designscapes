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

  return { years, totalInterest, totalExtra, payoffMonth };
}

export function calculateMortgage({
  price,
  downPercent,
  annualRate,
  extraAmount,
  startMonth,
  endMonth,
  termMonths = 360
}) {
  const downPayment = price * downPercent / 100;
  const principal = price - downPayment;
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
    downPercent,
    annualRate,
    extraAmount,
    startMonth,
    endMonth,
    downPayment,
    principal,
    normalPayment,
    original,
    plan,
    interestSaved: Math.max(0, original.totalInterest - plan.totalInterest),
    monthsSaved: Math.max(0, original.payoffMonth - plan.payoffMonth)
  };
}
