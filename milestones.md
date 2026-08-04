# Portfolio Strategy Implementation Milestones

This plan turns [SPEC.md](./SPEC.md) into incremental, testable application changes. A milestone is complete only when its behavior is persisted in the encrypted portfolio file and covered by an appropriate automated or production-build check.

## Milestone 1 — Portfolio model and compatibility

- [x] Introduce portfolio file version 6.
- [x] Add configurable dimensions, asset-type dimension rules, strategy settings, and annual income records.
- [x] Extend assets with ownership, valuation, cost-basis, checking-account, investment-eligibility, status, and dimension-exposure fields.
- [x] Preserve stable asset and liability IDs between snapshots and file reloads.
- [x] Convert version 5 portfolios without losing snapshots, asset values, liabilities, or allocation targets.
- [x] Cover the conversion and new calculations with unit tests.

## Milestone 2 — Fast monthly check-ins

- [x] Keep at most one snapshot per calendar month.
- [x] Copy the latest snapshot when starting a later month's check-in.
- [x] Open the existing snapshot when the current month already exists.
- [x] Allow direct-value assets and quantity × unit-price assets.
- [x] Display current value, cost basis, gain/loss, and change since the previous snapshot.
- [x] Keep historical snapshots visible and protect them from accidental current-entry actions.

## Milestone 3 — Asset classification

- [x] Provide the required dimensions: asset type, liquidity, geography, investment strategy, currency exposure, risk/volatility, custodian, sector, and ownership.
- [x] Allow dimension values to be configured.
- [x] Allow simple 100% classifications and optional percentage exposure splits.
- [x] Support locked, default, user-selected, and not-applicable rules on asset types.
- [x] Surface missing classifications as Unclassified.

## Milestone 4 — Strategy and concentration

- [x] Configure each dimension as disabled, informational, target allocation, or limits.
- [x] Configure target percentages, tolerances, minimums, maximums, and recommendation importance.
- [x] Display current amount, weight, target/limit, difference, and status for the selected dimension.
- [x] Show current allocation and historical asset-type composition using base-currency attributable values.

## Milestone 5 — Cash reserve and investment guidance

- [x] Configure one aggregate cash-reserve target across checking accounts.
- [x] Calculate checking-account cash and the investable surplus above the reserve.
- [x] Restrict recommendations to eligible investments.
- [x] Allocate the complete surplus using the configured strategy targets and limits.
- [x] Explain the recommended amounts and show current versus projected weights.
- [x] Keep the recommendation advisory; it must not mutate the recorded portfolio.

## Milestone 6 — Income, persistence, and delivery

- [x] Record yearly dividends, interest, rent, distributions, other income, fees, repairs, and other costs per asset.
- [x] Derive gross and net annual income without adding it to portfolio value.
- [x] Persist all new settings and records in local and Google Drive files.
- [x] Keep simplified liability tracking unchanged: name, type, value, and priority.
- [x] Bump the application version.
- [ ] Run automated tests and build the production site into `docs` using the existing Google credentials. Tests pass; the production build is waiting for the required environment credentials.
