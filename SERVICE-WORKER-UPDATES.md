# RECLAIM automatic updates (v10)

- Each release uses a new cache version in `sw.js`.
- The service worker installs the new app files, calls `skipWaiting()`, removes older RECLAIM caches, and claims open clients.
- The app checks for updates at launch and when the page becomes visible, focused, or restored from the back-forward cache.
- When an already-installed app receives a new controller, it reloads once to use the new files.
- Recovery data stays in `localStorage`; cache cleanup does not clear it.

## Important platform limitation

A static GitHub Pages PWA cannot force a browser to download and run new code while the app is fully closed. The browser checks on its own schedule and when the app is next opened/resumed. On supported browsers, v10 automatically checks and applies updates on resume without asking the user to download files, unregister a service worker, or press an update button.

For future releases, increment `CACHE_NAME` (for example, `reclaim-no-accounts-v11`) and upload the updated files to the same GitHub Pages publishing folder. Do not clear site data during routine updates.
