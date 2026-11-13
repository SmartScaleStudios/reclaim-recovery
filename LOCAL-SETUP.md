# RECLAIM local accounts — version 4

## What this build does
- No Supabase or cloud database.
- Self-service account registration and login stored in this browser.
- Passwords are stored as salted PBKDF2 hashes using Web Crypto, not as plain text.
- The first account created in an empty browser becomes the local admin; subsequent accounts are users.
- Recovery data is stored separately for each local account.
- Admin page shows aggregate counts only.

## Install
Upload all files in this ZIP to the root of your existing GitHub repository, replacing the old files. Keep GitHub Pages enabled. Open the HTTPS GitHub Pages address.

## Important limitations
Everything is stored in the current browser profile on the current device. Accounts and data do not sync across devices or users. Clearing site data can erase them. Anyone with access to the browser's developer tools or local storage can potentially alter local roles or data. This is a local prototype, not secure multi-user authentication and not suitable for a public service handling sensitive recovery information.

The first account created on a browser becomes admin. If you want to test user registration too, log out and create a second account. The admin role and statistics are local to that browser.

Do not use the same browser profile as a shared/public kiosk for private recovery information. Export backups regularly from Settings.
