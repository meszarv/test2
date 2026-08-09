import { formatCurrency } from "../utils.js";

export default function PortfolioTotals({ metrics, requiredCashReserve, currency }) {
  const totals = [
    ["Net Worth", metrics.totalNetWorth],
    ["Total Assets", metrics.totalAssets],
    ["Liabilities", metrics.totalLiabilities],
    ["Investable Assets", metrics.investableAssets],
    ["Financial Portfolio", metrics.financialPortfolio],
    ["Required Cash Reserve", requiredCashReserve],
  ];

  return (
    <section aria-labelledby="portfolio-totals-title">
      <h3 id="portfolio-totals-title" className="mb-3 text-sm font-medium text-zinc-300">Portfolio totals</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {totals.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="text-xs text-zinc-500">{label}</div>
            <div className="mt-1 text-lg font-medium">{formatCurrency(value, currency)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
