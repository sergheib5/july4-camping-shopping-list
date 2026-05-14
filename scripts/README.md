# populate-data.js

Seeds Firestore collections **`shoppingList`** and **`menu`** (same names as the reference app) with example **July 4 weekend campout** items.

## Usage

1. Copy `.env.example` → `.env` and fill all `VITE_FIREBASE_*` keys for your Firebase project.
2. From the repo root:

```bash
npm run populate-data
```

This writes real documents — use a **dedicated dev project** or empty collections first.

## What gets added

- Shopping rows grouped by lanes like **Cooler & drinks**, **Grill & foil**, **Snacks**, etc.
- Menu rows: daily cook plan for July 2–5, camp meals (`type: 'salad'` in Firestore for schema parity), snacks, and drinks.
