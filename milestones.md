# Desktop Data-Entry UX — Implementation Plan

This plan improves the application’s desktop data-entry experience, error prevention, modal behavior, and save-state clarity. It builds shared controls first and then converts existing screens so behavior remains consistent throughout the application.

Implementation is complete except for the credentialed production build and regenerated `docs` output. The required build was attempted, but `VITE_GOOGLE_API_KEY` and `VITE_GOOGLE_CLIENT_ID` are not available in this workspace; no substitute credentials were introduced.

## Scope and decisions

- Desktop use is the priority; no responsive-layout work is included.
- Accessibility-specific enhancements are not part of this implementation.
- Existing investment calculations and portfolio-view semantics remain unchanged.
- The current portfolio file format should remain unchanged unless implementation introduces a genuinely persisted field. If it does, bump the file version and add a tested conversion from older files.
- Previously referenced currencies are derived from the base currency and asset pricing currencies, so the currency selector itself does not require a file-format change.
- Liability tracking remains intentionally simplified.

## Milestone 1 — Shared numeric input system

- [x] Replace direct `type="number"` usage with a shared numeric input that does not display browser spinner arrows.
- [x] Keep an editable draft value separate from the committed numeric value so temporarily clearing a field does not immediately store zero.
- [x] Display a formatted read-only value when the field is not being edited and a clean raw value while editing.
- [x] Commit edits on Enter or blur and cancel the current edit on Escape.
- [x] Support appropriate decimal precision and formatting for money, percentages, quantities, FX rates, years, and plain numeric values.
- [x] Add configurable minimum, maximum, precision, and empty-value behavior.
- [x] Reject malformed, non-finite, and out-of-range values with an inline message instead of coercing them to zero.
- [x] Prevent mouse-wheel changes from accidentally modifying focused numeric inputs.
- [x] Create reusable `MoneyInput`, `PercentageInput`, `QuantityInput`, and `FxRateInput` variants where their behavior differs.

## Milestone 2 — Currency selector

- [x] Create a shared currency selector for the base currency and asset pricing currency.
- [x] List commonly used currencies first: EUR, USD, GBP, CHF, CZK, PLN, HUF, JPY, CAD, and AUD.
- [x] Include currencies already referenced by the open portfolio without duplicating common entries.
- [x] Add an `Other…` option that reveals a custom currency-code input.
- [x] Normalize custom codes to uppercase and validate them as three-letter currency codes supported by `Intl.NumberFormat`.
- [x] Preserve an existing custom currency when editing a portfolio or asset.
- [x] Show a clear validation message for an invalid or unsupported code.
- [x] When asset pricing currency equals the base currency, lock the FX rate to 1 and explain why.
- [x] When currencies differ, require a positive FX rate and warn when the default value of 1 has not been reviewed.
- [x] Use the shared selector in General settings, asset creation, asset editing, and any future currency entry point.

## Milestone 3 — Shared modal framework

- [x] Create a reusable modal shell with a fixed header, scrollable content area, and fixed footer.
- [x] Keep the title and primary actions visible regardless of content scroll position.
- [x] Close ordinary dialogs with Escape.
- [x] If a modal draft contains changes, confirm before Escape, Close, or backdrop dismissal discards them.
- [x] Standardize modal actions: Delete on the left; Cancel and Save/Add on the right.
- [x] Replace emoji-only modal actions with visible labels and consistent icons.
- [x] Lock background scrolling while a modal is open.
- [x] Prevent multiple modal layers except for an intentional confirmation dialog.
- [x] Convert asset, liability, annual-income, snapshot, JSON, and confirmation dialogs to the shared shell.
- [x] Keep the full-screen Settings workspace separate from the standard modal shell while preserving its current section navigation.

## Milestone 4 — Validation and safe data entry

- [x] Add shared field-error and form-error presentation.
- [x] Make asset and liability names required and show an error beside an empty name.
- [x] Validate ownership share as greater than 0 and no more than 100.
- [x] Validate monetary values, quantities, cost basis, income, and costs against their permitted negative/positive rules.
- [x] Require FX rates to be greater than zero.
- [x] Validate percentage allocations within 0–100 and retain the existing total-allocation checks.
- [x] Validate minimum/maximum strategy pairs and reject a minimum greater than its maximum.
- [x] Validate acquisition and valuation dates and explain conflicting dates.
- [x] Show an explicit error when a snapshot is moved to a month that already contains a check-in.
- [x] Disable Save/Add only when the form cannot be submitted, while keeping the reason visible.
- [x] Remove silent `Number(value) || 0` coercion from user-entry paths.

## Milestone 5 — Asset form simplification

- [x] Divide the asset form into clear sections: Basics, Valuation, Portfolio Classification, and Advanced Details.
- [x] Keep Basics and Valuation open by default; make detailed concentration dimensions and notes collapsible.
- [x] Start a new asset with an empty name and an asset-type-based placeholder instead of saving a generic type name accidentally.
- [x] Show fields conditionally when they apply to the selected asset type.
- [x] Only show the checking-account cash-reserve option for cash assets.
- [x] Explain how `Eligible for additional investment` affects surplus recommendations.
- [x] Make valuation mode labels and behavior clear when switching between direct value and quantity × unit price.
- [x] Preserve values from the inactive valuation mode without including them in calculations.
- [x] Replace internal rule labels such as `na` and `locked` with user-facing descriptions.
- [x] Summarize collapsed concentration dimensions with their selected category or allocation status.

## Milestone 6 — Safe inline table editing

- [x] Convert asset and liability inline numeric cells to the shared formatted numeric controls.
- [x] Keep the stored value unchanged until an edit is committed.
- [x] Provide a visible edited-state indicator while a cell contains an uncommitted change.
- [x] Allow Escape to restore the previous cell value.
- [x] Show a short-lived Undo action after committing an inline change.
- [x] Keep the existing color-coded snapshot and gain/loss deltas.
- [x] Do not allow inline edits in historical snapshots.
- [x] Ensure switching rows or snapshots resolves an active edit predictably.

## Milestone 7 — Discoverable editing and check-ins

- [x] Preserve double-click-to-edit for asset and liability rows as a shortcut.
- [x] Add a visible Edit action for each editable asset and liability row.
- [x] Preserve double-click-to-edit for snapshot tabs as a shortcut.
- [x] Add a visible snapshot action for editing its month, contributions, and withdrawals.
- [x] Replace the dashed implicit current-month tab with a clearly labeled `+ New check-in` action.
- [x] Explain that only one check-in can exist per month before a duplicate is attempted.
- [x] Distinguish the selected historical snapshot from the editable latest snapshot more clearly.
- [x] Add concise helper text where an interaction is otherwise hidden or unusual.

## Milestone 8 — Consistent creation and deletion flows

- [x] Replace native browser prompts used for new asset types, liability types, and dimension values with application dialogs.
- [x] Validate new names and prevent empty or confusing duplicate names.
- [x] Replace native browser alerts with inline dependency explanations or application dialogs.
- [x] Use confirmation for every destructive removal, including income records and unused settings definitions.
- [x] Name the item being deleted and summarize important consequences in the confirmation dialog.
- [x] Keep protected definitions disabled and show exactly which portfolio records still reference them.
- [x] Offer Undo after deletions where restoration can be implemented safely.
- [x] Preserve the existing rule that Delete appears on the left of modal actions and uses a red trash icon.

## Milestone 9 — Save, close, and operation feedback

- [x] Replace the ambiguous dirty dot with visible `Unsaved changes` and `Saved` status text.
- [x] Show the most recent successful save time.
- [x] Disable the Save action and show `Saving…` while a save is in progress.
- [x] Prevent duplicate save, open, and Drive operations while one is already running.
- [x] Show operation errors next to the action that failed, while retaining the existing global error summary where useful.
- [x] Warn before closing or reloading the browser when the portfolio has unsaved changes.
- [x] Rename the main Close action to make clear that it closes the portfolio file.
- [x] Make close behavior explicit when changes are pending: Save and close, Close without saving, or Cancel.
- [x] Fix closing the sample portfolio so it returns to the opening screen instead of doing nothing.
- [x] Keep Google Drive discovery failure handling unchanged: show the error and disable Drive operations.

## Milestone 10 — Verification and delivery

- [x] Add unit tests for numeric parsing, formatting, range validation, draft/commit behavior, and Escape cancellation.
- [x] Add tests for common, referenced, and custom currency selection.
- [x] Add modal tests for fixed structure, Escape behavior, dirty-draft confirmation, and action placement.
- [x] Add form tests for required fields, percentage constraints, FX behavior, and duplicate snapshot-month feedback.
- [x] Add tests for inline edit commit, cancellation, and undo.
- [x] Add tests for explicit save/close choices and sample-portfolio closing.
- [x] Verify existing portfolio calculations, file conversion, strategy, Google Drive, and editor tests remain green.
- [x] Exercise every converted modal and input flow in a real desktop browser.
- [x] Confirm no existing portfolio fields are lost when forms are opened, edited, cancelled, or saved.
- [x] Bump the application version.
- [x] If the portfolio file structure changes, bump its version and add a conversion function with a corresponding unit test.
- [x] Run the complete automated test suite.
- [ ] Run plain `npm run build` using the existing Google credential environment variables.
- [ ] Commit the regenerated `docs` production site with the implementation changes.
