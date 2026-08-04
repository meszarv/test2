# Structured Settings Workspace — Implementation Plan

This plan replaces the current long configuration modal with a focused settings workspace. It reorganizes existing functionality without changing investment calculations or introducing a new portfolio file format.

Implementation is complete except for the credentialed production build and its regenerated `docs` output. The required environment variables were not available in this workspace; no substitute credentials were introduced.

## Milestone 1 — Settings information architecture

- [x] Replace the scrolling configuration modal with a full-screen settings workspace.
- [x] Add persistent section navigation for General, Portfolio Views, Strategy, Asset Types, Dimensions, Liability Types, and Data & Integrations.
- [x] Display one primary settings section at a time.
- [x] Keep the settings title, unsaved-changes state, and Done control visible while navigating.
- [x] Return the user to the portfolio without losing changes when Done is selected.
- [x] Preserve the existing behavior where settings update the in-memory portfolio and mark it as unsaved.
- [x] Use a compact section selector on narrow screens instead of the desktop sidebar.

## Milestone 2 — Shared settings components

- [x] Create a reusable settings shell containing the header, navigation, content area, and sticky action area.
- [x] Create reusable section-heading, summary-card, collapsible-panel, and validation-message components.
- [x] Continue using the shared `TextInput` component for every labeled text and numeric input.
- [x] Use consistent plus and red trash icons for all add and delete actions.
- [x] Keep destructive controls separated from Done and other primary actions.
- [x] Preserve keyboard focus when changing sections or selecting an item in a master-detail editor.
- [x] Add accessible names, selected states, and keyboard navigation to the settings navigation.

## Milestone 3 — General and Portfolio Views

- [x] Move base currency into a concise General section.
- [x] Add a Portfolio Views section explaining Total Net Worth, Investable Assets, and Financial Portfolio.
- [x] Show the nested scope relationship and current asset count/value for each view.
- [x] Show how many assets still require portfolio-scope review.
- [x] Provide a direct action to return to the portfolio and review flagged assets.
- [x] Keep scope semantics fixed; asset and asset-type scope assignment remains in their respective editors.

## Milestone 4 — Strategy editor restructuring

- [x] Place the checking-account cash-reserve target at the top of the Strategy section.
- [x] Present each allocation dimension as a collapsible card instead of one continuous form.
- [x] Show each collapsed card’s mode, importance, configured category count, and validation state.
- [x] Expand one dimension at a time for target, limit, tolerance, and importance editing.
- [x] Clearly state that strategy targets and recommendations use the Financial Portfolio.
- [x] Keep informational, target, limits, and disabled modes unchanged.
- [x] Show target-total validation beside the affected dimension and in the Strategy section summary.
- [x] Highlight categories configured in the strategy but absent from the current Financial Portfolio without deleting their settings.

## Milestone 5 — Asset Types master-detail editor

- [x] Replace the stacked asset-type forms with a searchable list on the left and the selected type editor on the right.
- [x] Show each asset type’s name, portfolio-scope rule summary, and number of assets using it.
- [x] Keep Add Asset Type in the list header and Delete on the far right of the selected type editor.
- [x] Prevent deletion of asset types currently used by assets.
- [x] Put the asset-type name and portfolio-scope rule in a compact General subsection.
- [x] Collapse dimension rules by default and summarize the number of locked, default, user-selected, and not-applicable rules.
- [x] Allow individual dimension rules to expand for mode and value editing.
- [x] Preserve all existing default, locked, user-selectable, and not-applicable behavior.
- [x] Keep the selected asset type visible while searching or editing its details.

## Milestone 6 — Dimensions and Liability Types

- [x] Replace the stacked dimension editor with a searchable master-detail layout.
- [x] Show the selected dimension’s name and values in a sortable table.
- [x] Keep Add Value in the values header and the red trash action at the far right of each value row.
- [x] Prevent removal of dimension values that are still referenced by assets, strategies, or asset-type rules.
- [x] Show reference counts or a concise explanation when deletion is unavailable.
- [x] Use the same compact master-detail pattern for Liability Types.
- [x] Preserve existing protection against deleting liability types currently in use.

## Milestone 7 — Data, integrations, and advanced controls

- [x] Move Google Drive status and availability into Data & Integrations.
- [x] Continue displaying initialization errors and disabling Drive operations after discovery failure.
- [x] Place the raw JSON editor in a clearly marked Advanced subsection.
- [x] Explain that invalid JSON or manual structural changes can make the portfolio unreadable.
- [x] Keep import, export, file encryption, and save behavior unchanged.
- [x] Do not introduce a portfolio file-version migration unless implementation requires a persisted structural change.

## Milestone 8 — Responsive behavior and usability

- [x] Use a two-column master-detail layout on desktop and a list-to-detail flow on mobile.
- [x] Keep important controls visible without requiring the user to scroll to the bottom of a long section.
- [x] Preserve the active settings section while opening and closing nested editors.
- [x] Add empty states for missing asset types, dimensions, values, and liability types.
- [x] Add search-result empty states with a clear way to reset the search.
- [x] Ensure all controls have visible focus indicators and work without a mouse.
- [x] Confirm long names, many categories, and small screens do not cause horizontal page overflow.

## Milestone 9 — Verification and delivery

- [x] Add component tests for settings navigation, responsive section selection, and validation indicators.
- [x] Add component tests for asset-type and dimension master-detail selection, search, add, and protected deletion.
- [x] Verify existing strategy, asset-type, dimension, liability-type, JSON, and Google Drive tests remain green.
- [x] Exercise every settings section, editing flow, validation state, and mobile layout in a real browser.
- [x] Confirm closing and reopening settings does not lose in-memory changes.
- [x] Confirm the portfolio dirty indicator still reflects settings changes.
- [x] Bump the application version.
- [x] Run the complete automated test suite.
- [ ] Run plain `npm run build` using the existing Google credential environment variables.
- [ ] Commit the regenerated `docs` production site with the implementation changes.
