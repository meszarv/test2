- After modifying any code, run `npm run build` to generate the production site in the `docs` directory.
- Commit the contents of the `docs` directory along with your changes.
- Bump the version in `package.json` after each change.
- When the portfolio file structure changes, bump the file version and add a conversion function with a corresponding unit test to upgrade older files.
- Keep the real Google API key and client ID as defined in environment variables in the build output under `docs`.
- Never explicitly set `VITE_GOOGLE_API_KEY` or `VITE_GOOGLE_CLIENT_ID` if they are already defined in the environment.
- Wrap `gapi.client.init` in a try/catch; on discovery failure, display an error and disable Google Drive operations.

Functionality Guidelines:
Tables are sortable – Column headers toggle ascending/descending order with ▲/▼ indicators.
Double‑click rows to edit – Asset and liability rows open an edit dialog on a double click.
Numeric values show formatted currency and deltas – Editable number inputs overlay a read‑only formatted value and display color‑coded changes.
Modal dialogs – Centered overlay; Delete button on the left, Close and Save/Add grouped on the right.
Add/Remove controls –
Use a plus icon for all “Add” actions. Section headers place their Add button in the top‑right; when editing the latest snapshot, a floating blue “+” may appear bottom‑right for quick asset entry.
“Delete” uses a red trash icon. Inline list items place it on the far right; modals show it as the leftmost button.

Snapshot management – Tabs list snapshots chronologically; double‑click a tab to edit its date, opening a modal with Delete on the left and Close/Save on the right.

Consistent text inputs – All labeled inputs use the shared TextInput component.
