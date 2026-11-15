# RECLAIM app updates

## For the person using RECLAIM
- Open RECLAIM while connected to the internet.
- Tap **Check for updates** in the top header.
- RECLAIM asks the browser to check GitHub Pages for a new service worker.
- If a new release is available, the new worker installs, activates, and the app reloads.
- If no update is available, the app reports that it is up to date and refreshes the current page.

On iPhone, open the Home Screen app and tap **Check for updates**. If Safari/iOS has suspended the app, reopening it first gives the browser a chance to resume service-worker checks.

## For the person publishing a release
1. Upload the new app files to the same GitHub Pages publishing folder.
2. Every release must increment `CACHE_NAME` in `sw.js` (for example v13 to v13).
3. Commit and wait for GitHub Pages to publish.
4. Users can tap **Check for updates** in the app. They do not need to delete and reinstall the Home Screen app.

## Important
A static GitHub Pages PWA cannot install an update while iOS has fully suspended or closed the app. The manual button triggers the check when the app is open. It does not clear localStorage, and it does not remove the Home Screen installation. Recovery data remains in the existing localStorage key.
