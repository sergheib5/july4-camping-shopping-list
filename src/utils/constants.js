// Timing constants shared by shopping row editors
export const AUTO_SAVE_DEBOUNCE_MS = 500;
export const CLICK_OUTSIDE_DELAY_MS = 100;

/** Retail runs (top chips). Replaces obsolete packing-lane names in older Firestore rows. */
export const STORES = ['Fresh Farm', 'Aldi', 'Costco', "Binny's", 'Other'];

export const DEFAULT_STORE = STORES[0];

const STORE_COLORS = {
  'Fresh Farm': '#2e7d32',
  Aldi: '#1565c0',
  Costco: '#c62828',
  "Binny's": '#212121',
  Other: '#9e9e9e',
};

/** Obsolete packing-lane labels from earlier seeds — map to retail `Other`. */
const LEGACY_PACKING_LANES = new Set([
  'Cooler & drinks',
  'Grill & foil',
  'Snacks',
  'Breakfast',
  'Safety & bugs',
  'Lighting',
  'Trash & recycling',
]);

export const normalizeRetailStore = (store) => {
  if (store == null || store === '') return 'Other';
  if (STORES.includes(store)) return store;
  if (LEGACY_PACKING_LANES.has(store)) return 'Other';
  return 'Other';
};

export const getStoreColor = (store) => {
  const key = normalizeRetailStore(store);
  return STORE_COLORS[key] || STORE_COLORS.Other;
};

export const getStoreAbbreviation = (store) => {
  const s = normalizeRetailStore(store);
  const abbreviations = {
    'Fresh Farm': 'FF',
    Aldi: 'Aldi',
    Costco: 'Costco',
    "Binny's": "Binny's",
    Other: 'Other',
  };
  return abbreviations[s] || s;
};
