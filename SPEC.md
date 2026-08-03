# Portfolio Strategy & Tracking — Proposed Specification v0.1

## 1. Purpose

The application should help the user:

1. Record their portfolio quickly at irregular intervals.
2. Preserve the history of portfolio value, debt, and concentration.
3. Define a personal investment strategy using allocation targets and limits.
4. Decide where to direct the next available lump sum.
5. Identify excessive concentration across multiple dimensions.
6. Avoid requiring a detailed transaction ledger.

The application is a strategy and decision-support tool. It should not attempt to select winning securities or predict market returns.

The main design principle is to separate:

- Stable asset information, such as name, type, and ownership.
- Periodic observations, such as quantity, price, and debt balance.
- Strategy settings, such as targets and concentration limits.
- Annual summaries, such as income and costs.

This separation keeps irregular data entry quick without losing useful history.

## 2. Main workflow

### Initial setup

The user:

1. Defines the portfolio's base currency.
2. Configures asset types and dimension values.
3. Adds existing assets and liabilities.
4. Defines allocation targets, acceptable ranges, concentration limits, and the cash-reserve target held in bank checking accounts.
5. Marks which assets can receive additional investments.

### Regular check-in

Whenever convenient, the user selects **New check-in**.

The application:

1. Creates the month's snapshot by copying the latest available values.
2. Lets the user update only what changed.
3. Recalculates net worth, allocation, and concentration.
4. Preserves all earlier snapshots unchanged.

There is no required monthly schedule, so the user may skip any number of months. Only one check-in may exist in each calendar month. If the user starts another check-in in the same month, the application opens and updates that month's existing snapshot instead of creating a second one. Yearly charts use the latest available monthly snapshot in each year.

### Investing free cash

New cash realistically appears as an increased balance in one of the user's bank checking accounts. The user records that balance during the normal monthly check-in; a separate lump-sum entry is not required.

The strategy contains one configurable **cash-reserve target** across all bank checking accounts. This target is the maximum amount intentionally retained as cash. The application calculates:

`Cash available to invest = max(0, total checking-account cash - cash-reserve target)`

When checking-account cash exceeds the cash-reserve target, the application recommends how to redistribute the entire surplus to eligible investments according to the user's strategy. The projected plan leaves the cash reserve in the checking accounts and moves only the excess to investments, so the redistribution does not change total net worth.

## 3. Asset information

### Stable asset fields

| Field | Meaning |
|---|---|
| Asset name | User-facing name, such as "VWCE at IBKR" |
| Asset type | ETF, cash, real estate, bond, individual stock, etc. |
| Description | Optional notes |
| Ownership | Personal, joint, or company-owned |
| Ownership share | Optional percentage when only part of the asset belongs in this portfolio |
| First acquisition date | First purchase date; sufficient for regularly purchased ETFs |
| Status | Active, sold, or closed |
| Pricing currency | Currency in which the asset is valued |
| Valuation method | Units × price, or directly entered total value |
| Checking account | Whether a cash asset is included in the strategy's bank-cash limit |
| Eligible for new investment | Whether the recommendation engine may suggest adding money |
| Dimension assignments | Geography, sector, liquidity, and other classifications |

An asset that is sold should normally be marked closed, not deleted. It then disappears from the current portfolio while remaining in historical snapshots.

### Values recorded at each check-in

| Field | Meaning |
|---|---|
| Quantity | Current units owned |
| Current unit price | Price as of this check-in |
| Exchange rate | Pricing currency to portfolio base currency, when needed |
| Current value | Calculated or manually entered |
| Total cost basis | Cost of the units currently held |
| Valuation date | Defaults to the check-in date |
| Notes | Optional explanation of an estimate or unusual change |

For non-unit assets such as real estate, cash, or private companies, the user can select **Total value** mode instead of entering quantity and price.

## 4. Regular ETF investing without transactions

A transaction ledger should not be required.

At each check-in, the user only updates:

- Total quantity currently owned.
- Current unit price.
- Total cost basis shown by the broker.
- Optionally, new money contributed since the previous check-in.

The application derives:

- Current market value.
- Average purchase cost per unit.
- Unrealized gain or loss.
- Change since the previous snapshot.

"Acquisition date" means the first acquisition date. Individual purchase dates and tax lots are outside the initial scope.

Cost basis must not be treated as portfolio growth. To distinguish investment performance from added savings, each check-in should optionally record:

- External contributions since the previous check-in.
- External withdrawals since the previous check-in.

Without these values, the application can show net-worth growth but cannot accurately separate investment gain from newly added money.

## 5. Income and costs

Income should be recorded as an annual aggregate per asset rather than as individual payments.

Suggested fields:

- Dividends.
- Interest.
- Rent.
- Distributions.
- Other income.
- Fees.
- Repairs and maintenance.
- Other costs.

The application calculates:

`Net income = gross income - costs`

Keeping gross income and costs separate is preferable because it makes expensive assets visible. A simplified **net income only** entry may be offered when detailed figures are unavailable.

Income records are informational and must not be added automatically to portfolio value, because that could double-count income already present in a cash account.

## 6. Debt and liabilities

Liability tracking should stay close to the application's current simplified model. A liability has:

- Name.
- Liability type.
- Current outstanding value.
- Priority repayment flag.

Liability values are included in monthly snapshots and subtracted when calculating net worth. Debt is not duplicated on an asset, linked to an asset, or expanded with loan-management features in this scope.

## 7. Concentration dimensions

The application should support these dimensions:

- Asset type.
- Liquidity.
- Geography.
- Investment strategy.
- Currency exposure.
- Risk/volatility band.
- Custodian.
- Sector.
- Ownership.

Ownership is included because the personal/joint/company classification is also useful as a concentration view.

Suggested starting values might include:

- **Liquidity:** Immediate, days, weeks, months, illiquid.
- **Strategy:** Cash reserve, capital preservation, income, balanced growth, long-term growth, speculative.
- **Risk/volatility:** Low, medium, high, very high.
- **Geography:** User-defined countries or regions.
- **Custodian:** User-defined bank, broker, platform, or direct ownership.
- **Sector:** User-defined, with "Diversified" and "Not applicable" available.

Every dimension remains configurable.

### Simple and advanced classification

For quick entry, an asset may have one value representing 100% of a dimension.

For diversified assets, the user may optionally define percentage splits. For example, an ETF could be:

- Geography: 60% US, 25% Europe, 15% other.
- Sector: 30% technology, 20% financials, 50% other.

Splits must total 100%. Assets without a classification appear under **Unclassified** so that missing information is never silently excluded.

Pricing currency and currency exposure should be separate. An ETF traded in EUR may still have primarily USD economic exposure.

## 8. Asset type definitions and locked values

Each asset type can define a rule for every dimension:

- **Locked:** Fixed for every asset of this type.
- **Default:** Pre-filled but editable.
- **User selects:** No predefined value.
- **Not applicable:** Excluded for this type.

Example:

| Dimension | Real estate rule |
|---|---|
| Sector | Locked: Real estate |
| Liquidity | Locked: Illiquid |
| Custodian | Default: Direct ownership |
| Risk/volatility | Default: Medium |
| Geography | User selects |
| Currency | User selects |
| Strategy | User selects |

Risk and investment strategy should generally be defaults rather than locked values because two properties can serve different purposes and carry different risks.

Changing an asset type should show which dimension values will be changed or reset.

## 9. Strategy and allocation targets

Every dimension can operate in one of four modes:

- Informational only.
- Target allocation.
- Minimum/maximum limits.
- Disabled.

Examples:

- Asset type: target percentages.
- Geography: target percentages with tolerance.
- Custodian: maximum 40% at one institution.
- Speculative strategy: maximum 10%.
- Immediate liquidity: minimum 6%.
- Cash reserve in bank checking accounts: target base-currency amount.
- Ownership: informational only.

For each configured dimension, the application displays:

| Category | Current amount | Current % | Target or limit | Difference | Status |
|---|---:|---:|---:|---:|---|
| Equities | €60,000 | 60% | 65% | -5 pp | Under target |
| Cash | €15,000 | 15% | 10% | +5 pp | Over target |

Targets within a dimension should total 100%. A configurable tolerance band prevents insignificant deviations from being treated as problems.

## 10. Surplus cash redistribution guidance

### Source amount

The default amount is calculated automatically from the current monthly snapshot:

`Total balances of checking accounts - cash-reserve target`

If the result is zero or negative, checking-account cash does not exceed the cash reserve and there is nothing to redistribute. The strategy may still define which investments are eligible and whether a recommendation may be split among them.

### Decision sequence

The recommendation engine should:

1. Calculate checking-account cash above the cash-reserve target.
2. Use the full surplus as the amount to redistribute.
3. Exclude assets that cannot receive additional investment.
4. Respect hard concentration limits.
5. Simulate investing in eligible existing assets.
6. Score how much each option improves the selected allocation targets.
7. Recommend one asset, a split across assets, or a profile for a new investment.

When no existing asset fits the strategy, the result might say:

> The largest gaps are European equity, long-term growth, and a second custodian. No existing eligible asset satisfies all three. Consider a new investment with that profile.

### Recommendation output

The result should show:

- Total checking-account cash, the cash-reserve target, and the resulting surplus.
- Recommended amount per asset or investment profile.
- Current and projected portfolio weights.
- Which target gaps the recommendation improves.
- Which targets remain unresolved.
- Any limits preventing a seemingly obvious allocation.
- Alternative recommendations where trade-offs are close.

The recommendation must be explainable. It should be based entirely on the user's targets and constraints, not market forecasts.

## 11. Dashboard and history

The main dashboard should include:

- Current net worth.
- Gross assets, total liabilities, and net worth.
- Change since the previous check-in.
- Contribution-adjusted growth when cash-flow information exists.
- Current allocation by any selected dimension.
- Largest concentration warnings.
- Checking-account cash compared with the cash-reserve target.
- A redistribution recommendation whenever checking-account cash exceeds the reserve target.
- Data freshness, including the last valuation date.

History views should include:

- Net worth over time.
- Gross assets and debt over time.
- Asset-type composition over time.
- Concentration history for any dimension.
- Contributions versus portfolio growth.
- Annual gross and net income.

Historical snapshots remain read-only unless the user explicitly opens one for editing.

## 12. Important calculation rules

- All portfolio calculations use the configured base currency.
- Asset value is quantity × unit price × exchange rate, unless total-value mode is selected.
- Ownership share is applied before an asset enters portfolio totals.
- Current weight is the asset's base-currency value divided by total included asset value.
- Dimension splits allocate an asset's value proportionally across their categories.
- Liabilities reduce net worth but do not automatically reduce asset allocation weights.
- Checking-account cash is the total value of active cash assets marked as checking accounts.
- Investable surplus is checking-account cash above the cash-reserve target.
- Missing dimension values remain visible as **Unclassified**.
- Income is reported separately and never automatically added to asset value.
- Recommendations use projected post-investment values.

## 13. Initial scope boundaries

The first version should not require:

- Individual buy and sell transactions.
- Tax-lot accounting.
- Tax-return calculations.
- Automatic dividend imports.
- Automatic security-price or exchange-rate feeds.
- Return forecasts.
- Recommendations for specific securities that the user has not configured.

Those can be considered later without complicating the initial fast-entry workflow.

## 14. Acceptance criteria

The feature is complete when the user can:

1. Create or update one check-in per calendar month by copying the latest portfolio.
2. Update an ETF using only quantity, price, and total cost basis.
3. Enter direct valuations for assets without units.
4. Keep using simplified liabilities with name, type, value, and priority.
5. Configure defaults and locked dimensions by asset type.
6. View current concentration across every supported dimension.
7. Define targets, tolerances, and maximum limits.
8. Configure a cash-reserve target across all checking accounts.
9. Receive an explainable redistribution plan when checking-account cash exceeds that reserve.
10. Review portfolio, debt, income, and concentration history.
11. Open older portfolio files without losing their existing snapshots.

The last requirement will require a new portfolio-file version and a tested conversion from the current format when implementation begins.

## 15. Working assumptions

Unless changed during review:

- Gross assets are the default allocation basis.
- Purchase history remains aggregate-only.
- Costs are stored separately from income.
- The cash reserve is one aggregate base-currency target across all checking accounts.
- Recommendations redistribute only checking-account cash above the cash reserve and do not propose sales.
- Liability tracking remains intentionally simple.
- Full rebalancing that recommends sales may be added later as a separate feature.
