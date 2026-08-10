# Focused Portfolio Guidance — Implementation Plan

This plan refocuses the application on rule-based investment of surplus cash plus current and historical net-worth oversight. Full history and the Settings workspace remain in scope.

## Milestone 1 — Specification and compatibility

- [x] Update `SPEC.md` around state snapshots, current holdings, net worth, and surplus-cash guidance.
- [x] Preserve all current history chart modes and snapshot navigation.
- [x] Preserve the full Settings workspace.
- [x] Bump the portfolio file format from version 7 to version 8.
- [x] Add and test a v7-to-v8 conversion that removes obsolete data without losing active holdings or history.
- [x] Bump the portfolio file format to version 9 and convert v8 files by removing redundant per-asset valuation dates while preserving snapshot dates and history.
- [x] Bump the portfolio file format to version 10 and convert v9 files with per-account reserve assignments and an unambiguous Financial cash destination when one can be inferred safely.
- [x] Restore opening encrypted standalone snapshot files created by the earliest releases.

## Milestone 2 — Remove unrelated persisted data

- [x] Remove snapshot contributions and withdrawals.
- [x] Remove annual income and cost records.
- [x] Remove asset acquisition date, cost basis, notes, and sold/closed status.
- [x] Remove the per-asset valuation date; the snapshot check-in date is the single date for each recorded state.
- [x] Remove liability priority.
- [x] Remove duplicated top-level liabilities.
- [x] Ensure inactive v7 assets are omitted during conversion while earlier active observations remain historical.

## Milestone 3 — Remove unused product features and code

- [x] Remove contribution and withdrawal controls and contribution-adjusted calculations.
- [x] Remove the annual income and costs section, helpers, tests, and components.
- [x] Remove cost-basis and gain/loss controls, calculations, and columns.
- [x] Remove acquisition date, valuation date, valuation notes, and asset-status controls.
- [x] Remove priority-debt controls and the unused legacy rebalance engine, component, and tests.
- [x] Remove obsolete state, props, callbacks, imports, and sample-data fields.

## Milestone 4 — Focus the dashboard and tables

- [x] Add workflow navigation ordered as Update portfolio, Analysis, and Guidance, with Update portfolio opening by default.
- [x] Add independent exact-scope toggles to Update portfolio so any combination of Total-only, Investable-only, and Financial assets can be updated while keeping Guidance independent and based on the latest snapshot.
- [x] Put Net Worth, Total Assets, Liabilities, Investable Assets, Financial Portfolio, and Required Cash Reserve totals in Analysis, while keeping Available to Invest in Guidance.
- [x] Add category and percentage legends to allocation pie charts, including the held target view, with stable category colors across chart states and asset-type history.
- [x] Show every concentration dimension as a synchronized pie-chart overview while retaining the sortable detailed table.
- [x] Keep Total, Investable, and Financial analysis filters without duplicating headline values.
- [x] Keep Guidance as the final focused workflow step after portfolio analysis.
- [x] Remove the unchanged Investable Assets after-transfer comparison.
- [x] Simplify the asset table to Name, Type, Current Value, Portfolio Role, and Edit while retaining prior-snapshot deltas.
- [x] Preserve quick inline Current Value editing for the latest snapshot while keeping history read-only.
- [x] Simplify asset concentration editing with direct 100% category selectors and progressive disclosure for percentage splits.
- [x] Keep concentration details visible in a compact two-column asset dialog that fits the normal form on a desktop viewport.
- [x] Simplify the liability table to Name, Type, Balance, and Edit.
- [x] Keep history charts, periods, chart modes, snapshot tabs, and historical read-only behavior.
- [x] Let checking accounts specify a Reserve to keep while equally dividing the remaining global reserve among accounts left automatic.
- [x] Designate one Financial cash asset as the investment cash destination and enforce a single destination in the current snapshot.
- [x] Guide reserve replenishment before proportional checking-to-investment-cash transfers and the existing next-investment allocation.

## Milestone 5 — Preserve configuration and integrations

- [x] Keep all Settings navigation sections and their existing configuration capabilities.
- [x] Keep portfolio scopes and recommendation flags because they drive the guidance model.
- [x] Keep asset/liability type management, dimensions, strategy rules, storage, Drive, and JSON editing.
- [x] Show only explicitly added strategy categories, hiding zero targets while preserving explicit zero minimum/maximum bounds.
- [x] Add a segmented target-allocation bar whose whole-percentage drag, keyboard, add, remove, and exact-value interactions preserve a 100% total.
- [x] Preserve Google Drive initialization failure handling.

## Milestone 6 — Verification and delivery

- [x] Update affected unit tests and add v8, v9, and v10 conversion coverage.
- [x] Verify removed fields and features have no remaining runtime references.
- [x] Run the complete automated test suite.
- [x] Bump the package version.
- [x] Run `npm run build` using the hardcoded Google browser credentials.
- [x] Review and commit the regenerated `docs` production site with all implementation changes.

## Milestone 7 — Backup and recovery

- [x] Export the complete in-memory portfolio, including unsaved changes, through a backing-file-independent browser download.
- [x] Support password-protected encrypted `.enc` and readable `.json` exports with clear privacy guidance.
- [x] Import either format by file contents from the opening screen or Settings, including legacy file upgrades.
- [x] Keep imported data in memory and mark it unsaved without overwriting the active local or Drive file until explicit Save.
- [x] Explain after save failures that the in-memory state can still be exported before closing or reloading.
- [x] Cover encrypted round trips, JSON upgrades, malformed imports, and transfer-dialog behavior with automated tests.

## Milestone 8 — Repeated-save reliability

- [x] Reproduce the save → edit → save regression with a hook-level test.
- [x] Keep load/import dirty suppression while ensuring a successful save cannot suppress the next real edit.
- [x] Rebuild the production site with the repeated-save fix.
