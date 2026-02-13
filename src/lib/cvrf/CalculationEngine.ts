// CVRF Calculation Engine
// Pure TypeScript — no framework dependencies.
// Implements NPV, BCR, IRR (Newton-Raphson), SROI, and interpolated payback.

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface YearlyFlows {
  year: number;
  benefits: number;
  costs: number;
}

export interface CalculationInput {
  flows: YearlyFlows[];
  discountRate: number; // e.g. 0.03 for 3 %
}

export interface CalculationResult {
  npv: number;
  bcr: number;
  irr: number | null;
  sroi: number;
  paybackYears: number | null;
  pvBenefits: number;
  pvCosts: number;
  netPerYear: number[];
  cumulativePerYear: number[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Present value of an array of future cash-flows.
 * values[0] is Year 0 (not discounted), values[1] is Year 1, etc.
 */
export function presentValue(values: number[], discountRate: number): number {
  return values.reduce((pv, v, t) => pv + v / Math.pow(1 + discountRate, t), 0);
}

/**
 * Net Present Value: present value of net cash-flows.
 */
export function calculateNPV(netFlows: number[], discountRate: number): number {
  return presentValue(netFlows, discountRate);
}

/**
 * Internal Rate of Return via Newton-Raphson.
 * Returns null if it does not converge within `maxIter` iterations.
 */
export function calculateIRR(netFlows: number[], maxIter = 100): number | null {
  // Quick check — if all flows are zero, IRR is undefined
  if (netFlows.every((f) => f === 0)) return null;

  let rate = 0.1; // initial guess 10 %
  const tolerance = 1e-7;

  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let dNpv = 0; // derivative

    for (let t = 0; t < netFlows.length; t++) {
      const factor = Math.pow(1 + rate, t);
      npv += netFlows[t] / factor;
      if (t > 0) {
        dNpv -= (t * netFlows[t]) / Math.pow(1 + rate, t + 1);
      }
    }

    if (Math.abs(npv) < tolerance) return rate;
    if (dNpv === 0) return null; // avoid division by zero

    const newRate = rate - npv / dNpv;

    // Guard against divergence
    if (!isFinite(newRate) || newRate <= -1) return null;

    rate = newRate;
  }

  return null; // did not converge
}

/**
 * Payback period with linear interpolation between years.
 * Returns null if cumulative net-flow never turns positive.
 */
export function calculatePayback(netFlows: number[]): number | null {
  let cumulative = 0;

  for (let t = 0; t < netFlows.length; t++) {
    const prev = cumulative;
    cumulative += netFlows[t];

    if (cumulative >= 0 && prev < 0 && t > 0) {
      // Interpolate within the year where it turns positive
      const fraction = -prev / (cumulative - prev);
      return t - 1 + fraction;
    }

    // Year 0 already positive — payback is immediate
    if (t === 0 && cumulative >= 0) return 0;
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Main calculation                                                   */
/* ------------------------------------------------------------------ */

export function calculate(input: CalculationInput): CalculationResult {
  const { flows, discountRate } = input;

  // Sort by year to be safe
  const sorted = [...flows].sort((a, b) => a.year - b.year);

  const benefits = sorted.map((f) => f.benefits);
  const costs = sorted.map((f) => f.costs);
  const netFlows = sorted.map((f) => f.benefits - f.costs);

  const pvBenefits = presentValue(benefits, discountRate);
  const pvCosts = presentValue(costs, discountRate);
  const npv = pvBenefits - pvCosts;

  const bcr = pvCosts !== 0 ? pvBenefits / pvCosts : 0;

  const irr = calculateIRR(netFlows);

  // SROI = (PV benefits - PV costs) / PV costs   (net SROI ratio)
  // A positive SROI means positive return.
  const sroi = pvCosts !== 0 ? (pvBenefits - pvCosts) / pvCosts : 0;

  const paybackYears = calculatePayback(netFlows);

  // Build per-year arrays (nominal, not discounted)
  const netPerYear = netFlows;
  const cumulativePerYear: number[] = [];
  let cum = 0;
  for (const nf of netFlows) {
    cum += nf;
    cumulativePerYear.push(cum);
  }

  return {
    npv,
    bcr,
    irr,
    sroi,
    paybackYears,
    pvBenefits,
    pvCosts,
    netPerYear,
    cumulativePerYear,
  };
}
