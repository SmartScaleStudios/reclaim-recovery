# RECLAIM service-worker updates

This release updates the service worker automatically. It uses a versioned cache,
activates the new worker without manual unregistration, and removes only older
RECLAIM caches. Recovery data remains in localStorage and is not cleared.

For future releases:
1. Change CACHE_NAME in sw.js to a new version (for example v9).
2. Keep CACHE_PREFIX as reclaim-no-accounts-.
3. Upload the updated files to the same GitHub Pages publishing folder.
4. Open or refresh RECLAIM. Chrome checks for the updated worker and installs it.
5. The new worker activates and cleans up the previous RECLAIM cache.

Do not use Chrome's Clear site data for routine updates. A normal refresh may be
needed after a deployment to load the newly activated app in an already-open tab.
