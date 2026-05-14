# July 4 weekend campout — shopping list & cook plan

Standalone **Vite + React + Firebase Firestore** PWA for an **Independence Day weekend campout** (default trip window **July 2–5, 2026**). Same data model as the reference [`sergheib5/shopping-list`](https://github.com/sergheib5/shopping-list): collections **`shoppingList`** and **`menu`**, menu “cookout” rows still use Firestore `type: 'salad'`, shopping rows use **`store`** for the retail run (Fresh Farm, Aldi, Costco, Binny's, Other) and **`salad`** for the menu meal key (menu id, `docId|lunch` / `docId|dinner` for daily rows, or legacy camp-meal name).

## Features

- Shopping list: **retail store** chips (Fresh Farm, Aldi, Costco, Binny's, Other), items **grouped by menu meal** under the selected store, search, inline add, CSV export  
- Meals page: daily cook plan, camp meals, snacks, drinks  
- Bottom navigation, PWA manifest + service worker  
- Trip header states (**before / on / after**) from `VITE_TRIP_START` and `VITE_TRIP_END`

## Local setup

```bash
npm install
cp .env.example .env
# Fill .env (Firebase + trip dates)
npm run dev
```

## Firebase (new project — requires your account)

1. [Firebase Console](https://console.firebase.google.com/) → **Add project**.  
2. Enable **Firestore** (Native mode).  
3. Project settings → **Your apps** → Web app → copy config into `.env` as `VITE_FIREBASE_*`.  
4. Replace **`your-firebase-project-id`** in [`.firebaserc`](.firebaserc) with your project ID (placeholder is intentional until you do this).  
5. Deploy rules and indexes from this repo (requires [Firebase CLI](https://firebase.google.com/docs/cli) logged in as you):

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Current rules match the reference demo (**open read/write**). That is convenient and **unsafe** for a public URL; tighten before sharing widely.

## Seed data

```bash
npm run populate-data
```

See [`scripts/README.md`](scripts/README.md).

## Tests & build

```bash
npm test
npm run build
```

## Vercel

1. Push this repo to GitHub (`git remote add origin …`, `git push -u origin main`).  
2. [Vercel](https://vercel.com/) → **Add New Project** → import the repo.  
3. Framework: **Vite**; output: **`dist`**.  
4. **Environment variables** (Production + Preview): all `VITE_FIREBASE_*`, `VITE_TRIP_START`, `VITE_TRIP_END`, and optionally `VITE_BASE_PATH` (use **`/`** for a custom domain at root).  
5. Redeploy after saving envs.

## GitHub Pages (optional)

The included [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds with `VITE_BASE_PATH: /<repo>/`. Configure repository **Variables** / **Secrets** as documented in that file, enable GitHub Pages from the workflow artifact, and ensure Firestore + env values match that Pages URL.

## GitHub Actions secrets / variables

| Name | Type | Purpose |
|------|------|--------|
| `VITE_FIREBASE_API_KEY` | secret | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | secret | `*.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | secret | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | secret | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | secret | Sender ID |
| `VITE_FIREBASE_APP_ID` | secret | App ID |
| `VITE_TRIP_START` | variable | ISO date, e.g. `2026-07-02` |
| `VITE_TRIP_END` | variable | Inclusive last day, e.g. `2026-07-05` |

You **cannot** complete `firebase login`, `gh repo create`, or Vercel linking from this agent; use your own terminal for those.

## License

MIT
