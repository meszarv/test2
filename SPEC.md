# Portfolio Strategy Tracker — Specification v0.10

## 1. Purpose

The application has two goals:

1. Provide rule-based guidance for investing cash above a configured reserve.
2. Provide a current and historical overview of assets, liabilities, portfolio composition, and total net worth.

The application records portfolio state snapshots. It is not a transaction ledger, tax tracker, income tracker, or investment-performance calculator. Recommendations are based entirely on the user's current holdings, targets, and limits; the application does not forecast returns or select unconfigured securities.

## 2. Main workflow

### Initial setup

The user:

1. Selects a base currency.
2. Configures asset and liability types where the defaults are insufficient.
3. Adds current assets and liabilities.
4. Classifies each asset as Total only, Investable, or Financial Portfolio.
5. Identifies checking accounts included in the reserve calculation and optionally sets how much reserve to keep in each.
6. Selects one Financial cash asset as the investment cash destination.
7. Identifies Financial assets eligible to receive new investment.
8. Configures the global cash reserve and allocation targets or limits.

### State check-in

Whenever useful, the user creates a new check-in. The application:

1. Copies the latest asset and liability state into the current month.
2. Lets the user update quantities, prices, values, exchange rates, classifications, and balances.
3. Recalculates net worth, portfolio composition, concentration, and guidance.
4. Preserves older snapshots as read-only history.

Only one check-in may exist per calendar month. Check-ins do not record external contributions, withdrawals, purchases, sales, income, costs, or other transactions.

### Investing free cash

Explicit per-account reserves are assigned first. Any remainder of the global cash-reserve target is divided equally among checking accounts without an explicit amount.

Guidance first replenishes checking accounts below their assigned reserve. It uses excess from other checking accounts and then the designated investment cash account. Only after every assigned reserve is funded may remaining checking cash be transferred to investment cash and allocated among eligible investments without worsening configured maximum limits.

The recommendation is advisory. After acting on it, the user records the resulting balances and holdings in the next state update.

## 3. Portfolio file model

Portfolio file version 10 contains:

- Base currency.
- Asset type definitions.
- Liability type definitions.
- Concentration dimensions.
- Strategy settings.
- Chronological snapshots.

Each snapshot contains:

- Check-in date.
- Asset observations.
- Liability observations.

The file does not contain duplicated top-level liabilities, income records, external cash-flow totals, tax-basis data, debt-priority flags, or inactive asset records.

### Version 9 conversion

Opening a version 9 file must convert it to version 10 by initializing each checking account with an automatic reserve assignment and adding the investment-cash destination role. When a snapshot contains exactly one Financial cash asset that is not a checking account, conversion selects it as that snapshot's destination. Ambiguous files remain unassigned so the user can choose safely.

### Version 8 conversion

Opening a version 8 file must convert it to version 9 by removing the per-asset `valuationDate` field. The snapshot check-in date remains the date of the complete portfolio observation, so all historical timing and values are preserved.

### Version 7 conversion

During upgrade, a version 7 file is first converted to version 8 by:

- Removing top-level `incomeRecords` and duplicated top-level `liabilities`.
- Removing snapshot `contributions` and `withdrawals`.
- Removing asset `acquiredOn`, `costBasis`, `notes`, and `status` fields.
- Removing liability `priority` fields.
- Omitting assets marked `sold` or `closed` from the snapshots in which they are inactive.
- Preserving all active asset observations, liability balances, snapshot dates, classifications, rules, and history.
- Reconciling legacy record IDs before obsolete fields are removed.

Conversion must be covered by unit tests. Older versions continue through their existing conversions before the v7-to-v8, v8-to-v9, and v9-to-v10 conversions are applied.

Encrypted standalone snapshot files from the earliest releases, which contain `asOf`, `assets`, `allocation`, and optional `assetTypes` without a portfolio wrapper or version, must also open. They are treated as a one-snapshot version 1 portfolio and then passed through the normal conversion chain. Legacy `label` fields on type definitions become current `name` fields.

## 4. Asset observations

An asset contains only information used for valuation, overview, classification, or guidance:

| Field | Meaning |
|---|---|
| ID | Stable identity across snapshots |
| Name | User-facing asset name |
| Type | Cash, stock, bond, real estate, commodity, private equity, or a configured type |
| Description | Optional identifying context |
| Portfolio scope | Total only, Investable, or Financial Portfolio |
| Ownership | Personal, joint, or company-owned classification |
| Ownership share | Percentage of the gross asset value included in this portfolio |
| Pricing currency | Currency in which the asset is valued |
| Valuation method | Direct total value or quantity × unit price |
| Quantity | Units currently held when using unit valuation |
| Unit price | Current price per unit |
| Direct value | Current gross value when using direct valuation |
| FX rate | Pricing currency converted to base currency |
| Checking account | Whether cash participates in the reserve calculation |
| Reserve to keep | Optional explicit reserve for a checking account; blank receives an equal share of the remaining global reserve |
| Investment cash destination | Whether a Financial cash asset receives surplus and funds reserve replenishment or investments |
| Eligible for investment | Whether guidance may allocate surplus cash to the asset |
| Dimension assignments | Current concentration classifications and optional splits |

The asset editor uses a compact two-column desktop layout with Basics, Valuation, and Portfolio classification beside always-visible Concentration details. The normal single-category form should fit without internal scrolling at a typical desktop viewport; narrow viewports and deliberately expanded split editors may scroll. Choosing a category assigns it at 100% without opening a percentage editor. A Split allocation action reveals category percentages when an asset spans multiple categories. Existing splits are summarized until explicitly edited, asset-type-locked dimensions are compact and read-only, and dimensions marked not applicable are omitted.

Asset value is:

`(quantity × unit price × FX rate) × ownership share`

or, in direct-value mode:

`(direct value × FX rate) × ownership share`

An asset no longer owned is removed from the latest snapshot. It remains visible in older snapshots, so a separate sold/closed status is unnecessary.

## 5. Liability observations

A liability contains:

- Stable ID.
- Name.
- Liability type.
- Optional description.
- Current outstanding balance.

Liabilities are included in snapshots and subtracted only from Total Net Worth. They are not assigned to portfolio scopes, linked to assets, prioritized for repayment, or used by investment guidance.

## 6. Portfolio scopes

Each asset has exactly one scope. Scopes are nested:

| Asset scope | Total view | Investable view | Financial view |
|---|:---:|:---:|:---:|
| Total only | ✓ |  |  |
| Investable | ✓ | ✓ |  |
| Financial Portfolio | ✓ | ✓ | ✓ |

### Total Net Worth

`Total Net Worth = all assets in the current snapshot - all current liabilities`

This view includes material assets such as property and private equity as well as accessible capital.

### Investable Assets

Investable Assets include Investable and Financial assets. The metric represents accessible capital and deliberately does not allocate personal liabilities across scopes.

### Financial Portfolio

The Financial Portfolio contains assets actively managed by the investment strategy. Only Financial assets can receive strategy-driven investment recommendations.

Portfolio scope is stored in each snapshot. Reclassifying a current asset does not rewrite historical scope totals.

## 7. Strategy and concentration rules

The Settings workspace remains the complete place to configure:

- Base currency.
- Portfolio view classifications.
- Cash-reserve target.
- Allocation targets, tolerances, importance, minimums, and maximums.
- Asset types and their default or locked scope/dimension rules.
- Concentration dimensions and category definitions.
- Liability types.
- File and Google Drive integration.
- Advanced JSON editing.

Supported dimension modes are Disabled, Informational, Target allocation, and Minimum/maximum.

Strategy targets and limits operate on the Financial Portfolio. Total and Investable views may display the same dimensions for analysis without affecting guidance.

Targets within a dimension must total 100%. Missing classifications remain visible as Unclassified.

The strategy editor lists only rules explicitly configured for the active mode. Target categories are added on demand and must have a positive whole-number target; an unlisted category implicitly has a 0% target. A segmented 100% allocation bar provides draggable and keyboard-adjustable boundaries between neighbouring target categories in 1% steps. Adding a category assigns it 5% from the largest existing target, removing one transfers its share to the largest remaining target, and exact percentage edits rebalance other categories automatically. All target-editing operations preserve a total of exactly 100% using whole percentage points. Invalid or decimal allocations loaded from older files require an explicit one-time normalization instead of being changed silently. Minimum/maximum categories are also added on demand, but either bound may explicitly be 0%. Removing a rule removes its fields for the active mode without discarding settings retained for another mode.

## 8. Recommendation rules

The recommendation engine must:

1. Sum active cash assets marked as checking accounts and included in an Investable or Financial scope.
2. Honor explicit per-account reserve amounts first and divide the remaining global reserve equally among checking accounts without an explicit amount.
3. Replenish underfunded checking accounts proportionally from other checking accounts above their reserve.
4. Replenish any remaining reserve deficit from the single designated Financial investment cash account.
5. Report a remaining reserve shortfall without recommending asset sales when available cash is insufficient.
6. Transfer checking cash above the fully funded reserve to the investment cash destination, proportionally across source-account excesses.
7. Consider only existing Financial assets marked eligible for additional investment.
8. Respect configured hard maximums.
9. Score projected holdings against active target and limit policies.
10. Allocate transferred investment cash to reduce weighted deviations.
11. Explain each reserve assignment, cash transfer, investment, and unallocated amount.

Recommendation output includes:

- Checking-account cash.
- Global and effective cash-reserve targets.
- Reserve assignment, current balance, and projected balance for each checking account.
- Checking-to-checking and investment-cash-to-checking replenishment transfers.
- Checking-to-investment-cash surplus transfers by source account.
- Remaining reserve shortfall.
- Amount available to invest.
- Recommended amount per eligible asset.
- Current and projected Financial Portfolio value.
- Current and projected rule effects.
- Unallocated cash and the limiting reason, when applicable.

An internal transfer from checking cash to a Financial asset does not change Total Assets, Investable Assets, or Total Net Worth. The dashboard therefore does not present an unchanged “Investable Assets after transfer” comparison.

## 9. Main workflow navigation

The main workspace uses Settings-style navigation ordered around the state-snapshot workflow:

1. **Update portfolio** opens by default and contains snapshot selection, assets, and liabilities. Its holdings filter has independent switches for the exact Total only, Investable only, and Financial Portfolio asset scopes. All three are enabled by default, and any combination may be shown. Liabilities appear when Total only is enabled.
2. **Analysis** shows current Net Worth, Total Assets, Liabilities, Investable Assets, Financial Portfolio, and the effective Required Cash Reserve, followed by the Total, Investable, and Financial view selector, current allocation, configured target comparison, history, and concentration. The reserve total uses the same effective value as Guidance, including explicit per-account reserves above the global target. Portfolio concentration shows a compact pie chart with a complete non-zero legend for every concentration dimension at once. Selecting any chart synchronizes the focused Current allocation chart, dimension selector, and detailed concentration table, which remains available for exact amounts, percentages, targets or limits, differences, and status. Allocation pie charts include a color legend with each visible category and its percentage; the legend follows the current or temporarily displayed target allocation. Category colors are deterministic and remain consistent across scope filters, current and target allocations, and asset-type history charts.
3. **Guidance** focuses on per-account reserve status, ordered cash-transfer instructions, Available to Invest, and the next-investment recommendation. Opening Guidance selects the latest snapshot so recommendations are never presented from historical values.

Desktop uses a persistent left navigation matching Settings; mobile uses a compact section selector. Update portfolio includes a clear action to continue to Analysis after the values are current, and Analysis includes an action to continue to latest Guidance.

The Update portfolio scope switches affect only its asset table and liabilities section. Analysis separately uses one cumulative Total, Investable, or Financial view for allocation, concentration, and current-view history. Neither control affects next-investment guidance.

The asset table focuses on Name, Type, Current Value, Portfolio Role, and Edit. In the latest snapshot, Current Value is directly editable in the table while retaining its formatted-currency display; for unit-valued assets, changing it recalculates unit price without changing quantity. Historical snapshots remain read-only. The current-value cell may show change from the matching asset in the previous snapshot. If no matching prior observation exists, the comparison displays an em dash rather than treating the prior value as zero.

The liability table focuses on Name, Type, Balance, and Edit.

## 10. History

History remains a first-class feature. The application keeps:

- Monthly and yearly aggregation.
- Current-view value history.
- Asset-type composition history.
- Combined Total Assets, Investable Assets, and Financial Portfolio history.
- Change since the preceding snapshot.
- Chronological snapshot tabs in Update portfolio.
- Read-only historical asset and liability tables.
- Editing and deleting snapshot dates, with one check-in per month.

History is derived exclusively from state snapshots. It does not attempt to distinguish deposits, withdrawals, market performance, realized gains, income, or costs.

## 11. Settings and integrations

The existing full-screen Settings navigation remains available. Removing unused portfolio-tracking features must not reduce configuration for scopes, strategy rules, types, dimensions, storage, Drive, or advanced JSON access.

Google Drive initialization must remain wrapped in error handling. Discovery failure displays an error and disables Drive operations.

## 12. Scope boundaries

The application does not include:

- Transaction recording.
- Contribution or withdrawal tracking.
- Investment-performance attribution.
- Cost basis, gains/losses, or tax lots.
- Acquisition history.
- Income, dividends, rent, fees, or cost tracking.
- Debt-payoff prioritization.
- Automatic market-price or exchange-rate feeds.
- Return forecasts.
- Recommendations for securities the user has not configured.
- Recommendations to sell assets.
- Liability allocation across portfolio scopes.

## 13. Acceptance criteria

The implementation is complete when the user can:

1. Open version 1–9 portfolio files and receive a valid version 10 portfolio without obsolete data.
2. Create or update one state snapshot per calendar month.
3. Preserve and review all historical snapshot values.
4. Enter direct asset values or calculate values from current quantity and price.
5. See correct base-currency values after FX and ownership share.
6. See assets, liabilities, and Total Net Worth clearly.
7. Switch analysis between Total, Investable, and Financial scopes.
8. Configure the existing Settings sections and strategy dimensions.
9. Configure checking accounts, optional per-account reserves, one Financial investment cash destination, and eligible investments.
10. Receive ordered reserve-replenishment and surplus-transfer guidance before an explainable investment allocation based on targets and limits.
11. See no transaction, income, tax-basis, inactive-status, or debt-priority controls.
12. Save only fields used by overview, history, configuration, or guidance.
13. Preserve Google Drive error handling and file encryption behavior.
14. Pass the full automated test suite and credentialed production build.
