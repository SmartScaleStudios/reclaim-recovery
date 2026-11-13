# RECLAIM — no accounts, private local admin page

## Install
Upload the files in this package to the root of your existing GitHub repository and replace matching files. The application now opens directly without registration or login.

## Admin console
The separate, unlinked admin page is:
`reclaim-control-room-7f3a9c.html`

After GitHub Pages publishes, visit:
`https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/reclaim-control-room-7f3a9c.html`

Do not add a link to this page in the app navigation if you want it to remain out of normal view.

## Data
All recovery data is stored under the browser's local key `reclaim_local_recovery_data`. The console reads that data and displays aggregate counts and patterns only. It does not display journal text, personal notes, craving context or coping responses.

## Important limitation
An unlinked or unusual URL is obscurity, not real access control. Anyone who knows the address and can use the same browser can open the console. A GitHub Pages site is static and cannot securely hide a page or enforce administrator permissions. This is suitable for personal testing, not secure public administration.

If this browser already has data saved by the prior account-based prototype, this package does not automatically migrate it. Keep the old site files/backups until you verify whether you need to export the old data first.
