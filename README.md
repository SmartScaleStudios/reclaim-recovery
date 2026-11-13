# RECLAIM — Recovery & Relapse Prevention PWA

A front-end prototype built with HTML, CSS, and vanilla JavaScript.

## Run locally
Service workers and PWA installation require HTTPS or localhost. From this folder run:

```bash
python -m http.server 8000
```

Then open http://localhost:8000. On a supported browser, use the install option or browser menu to install.

## Included
- Recovery dashboard, streak and estimated savings
- Customizable recovery plan
- Craving and trigger logging
- Urge-support screen with a guided breathing timer
- Reflection journal and daily check-ins
- Basic insights and trigger summaries
- JSON export/import and local data reset
- PWA manifest and offline app-shell service worker

## Important limitations
- Data is stored in browser `localStorage` on this device and is not encrypted, backed up, or synced. Do not use a shared device for sensitive entries.
- This is a prototype, not a clinical product or medical device. It does not diagnose, treat, or replace professional care.
- Withdrawal from alcohol, benzodiazepines, and some other substances can be dangerous. Seek medical guidance before stopping if physical dependence may be present. In an emergency, contact local emergency services.
- Before a public launch, add secure authentication, encrypted server-side storage, privacy policy, consent flows, accessibility testing, threat modeling, and clinical/safety review.
- The breathing exercise is a gentle optional prompt; stop if dizzy or uncomfortable.
