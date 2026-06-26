# MindfulMouse — Disney Dining Navigator

A mobile-first PWA that helps people with food allergies and dietary restrictions find safe food at Walt Disney World.

Disney removed the allergy filter from its in-app dining search, so people with celiac disease, nut allergies, dairy intolerance, and vegan diets have nowhere to find accurate "what can I actually eat here" information. This app fills that gap.

## Features

- **Filter by allergen** — gluten-free, dairy-free, nut allergy, vegan (multi-select)
- **Filter by park** — Magic Kingdom and EPCOT today
- **Restaurant detail** — ratings per allergen, verified dishes with prices, cross-contamination notes, pro tips
- **Chef Card generator** — printable card you hand to the server, with your allergens, severity, and what to ask the chef
- **Emergency screen** — First Aid locations by park, reaction response steps, packing checklist
- **Offline-first** — service worker caches the app shell and data so it works on Disney's patchy wifi
- **Staleness badges** — every entry shows when it was last verified so you know what to double-check with Cast Members

## Tech stack

- Svelte 4
- Vite 5
- vite-plugin-pwa (Workbox under the hood)
- No backend — static JSON data extracted from the [original guides](https://github.com/bellacose/magicalmindfulmouse)
- Deploy target: any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages)

## Run locally

```bash
npm install
npm run extract     # regenerate src/data/*.json from the MDX guides
npm run dev         # http://localhost:5173
```

## Build for production

```bash
npm run build       # → dist/ (PWA, service worker, offline cache)
npm run preview     # serve dist/ locally
```

## Data

The restaurant and snack data in `src/data/` is extracted from the long-form guides at [bellacose/magicalmindfulmouse](https://github.com/bellacose/magicalmindfulmouse/tree/main/website/src/content/blog). The extractor is `scripts/extract-data.js`.

⚠️ **Data freshness:** The current data was last verified in February 2026. Disney menus change frequently. Every entry in the UI shows how old it is — please always verify with a Cast Member before ordering, especially for medical allergies.

## Coverage (v1)

- **Magic Kingdom:** 13 restaurants (quick-service + table-service) + 10 verified snacks
- **EPCOT:** ~19 World Showcase restaurants, country-by-country

Roadmap:
- Hollywood Studios + Animal Kingdom
- Disneyland (California)
- Per-restaurant allergen matrix (today: rating-based proxy)
- User-submitted corrections
- Multi-day trip planner

## Why this exists

After Disney pulled the allergy filter from My Disney Experience in early 2026, families with food allergies were left emailing `specialdiets@disneyworld.com` and hoping, or scrolling Reddit threads. This app is the missing filter, designed mobile-first for use inside the park.

## License

MIT