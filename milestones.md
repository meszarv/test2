# Nested Portfolio Views — Implementation Plan

This plan implements the portfolio-scope additions in [SPEC.md](./SPEC.md). All items are pending. The existing version 6 model is the migration source; the completed version 6 work is not repeated here.

## Milestone 1 — Version 7 data model and migration

- [x] Add one `portfolioScope` field to every asset with the allowed values `total`, `investable`, or `financial`.
- [x] Add an optional `scopeRule` to asset-type definitions using the existing user-selectable, default, and locked rule behavior.
- [x] Add a temporary `scopeNeedsReview` marker for assets whose scope cannot be inferred safely.
- [x] Bump the encrypted portfolio file format from version 6 to version 7.
- [x] Convert version 6 checking accounts to Investable scope.
- [x] Convert eligible public investments to Financial scope.
- [x] Convert private equity and real estate to Total-only scope by default.
- [x] Preserve asset IDs, snapshots, values, dimensions, strategy, income, and simplified liabilities during conversion.
- [x] Add migration tests for every inference path, ambiguous assets, and repeated upgrades.

## Milestone 2 — Scope calculations and invariants

- [x] Add a single helper that determines whether an asset belongs to the Total, Investable, or Financial view.
- [x] Calculate Total Assets from every active asset.
- [x] Calculate Total Net Worth as Total Assets minus all liabilities.
- [x] Calculate Investable Assets from Investable and Financial assets.
- [x] Calculate the Financial Portfolio from Financial assets only.
- [x] Keep liabilities out of the Investable and Financial views.
- [x] Guarantee `Financial Portfolio <= Investable Assets <= Total Assets` without clamping calculated values.
- [x] Make allocation and concentration calculations accept an explicit portfolio view.
- [x] Add unit tests for scope inclusion, ownership shares, closed assets, liabilities, and the nested asset relationship.

## Milestone 3 — Asset and asset-type configuration

- [x] Add the shared portfolio-scope selector to the asset add/edit modal.
- [x] Explain each scope beside the selector using concise examples.
- [x] Apply asset-type scope defaults when adding an asset or changing its type.
- [x] Disable scope editing when the selected asset type locks the value.
- [x] Add scope-rule controls to the asset-type configuration screen.
- [x] Show a visible review warning on migrated assets marked `scopeNeedsReview`.
- [x] Clear the review marker after the user explicitly confirms or changes the scope.
- [x] Preserve the selected scope in every monthly snapshot so later reclassification does not rewrite history.

## Milestone 4 — Three portfolio views

- [x] Add a primary view selector for Total Net Worth, Investable Assets, and Financial Portfolio.
- [x] Display the correct headline metric and explanation for each view.
- [x] Filter the asset table by the selected view while keeping one underlying asset record.
- [x] Filter allocation charts and concentration tables by the selected view.
- [x] Keep the simplified liability table visible only where it is relevant to Total Net Worth.
- [x] Preserve the selected view while navigating monthly snapshots.
- [x] Add history series for Total Assets, Investable Assets, and Financial Portfolio.
- [x] Add a combined history comparison for the three nested asset totals.
- [x] Keep contribution-adjusted Total Net Worth history behavior intact.

## Milestone 5 — Strategy and cash-reserve integration

- [x] Evaluate strategy targets, limits, and recommendation scores against Financial assets only.
- [x] Require recommendation destinations to have Financial scope and be eligible for additional investment.
- [x] Calculate the reserve from active Investable or Financial checking accounts.
- [x] Model surplus movement out of checking accounts and into Financial investments.
- [x] Verify that a projected transfer leaves Total Assets, Total Net Worth, and Investable Assets unchanged.
- [x] Verify that the projected Financial Portfolio increases by the allocated surplus.
- [x] Explain when no Financial asset can accept the surplus without breaking a configured maximum.
- [x] Update the sample portfolio to demonstrate Total-only, Investable, and Financial assets.

## Milestone 6 — Verification and delivery

- [x] Add component coverage for scope selectors, locked defaults, view filtering, and migration-review warnings.
- [x] Run the complete automated test suite.
- [x] Exercise all three views, asset editing, configuration, history, and cash guidance in a real browser.
- [x] Confirm Google Drive discovery failure still displays an error and disables Drive operations.
- [x] Bump the application version after the code change.
- [ ] Run plain `npm run build` with the existing Google credential environment variables. Blocked: both required variables are absent from this environment.
- [ ] Commit the regenerated `docs` production site with the implementation changes. Blocked until the credentialed production build can run.
