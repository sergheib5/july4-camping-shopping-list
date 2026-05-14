// Shared constants across the application — camping / July 4 trip packing

export const STORES = [
  'Cooler & drinks',
  'Grill & foil',
  'Snacks',
  'Breakfast',
  'Safety & bugs',
  'Lighting',
  'Trash & recycling',
  'Other',
];

export const DEFAULT_STORE = STORES[0];

export const getStoreColor = (store) => {
  const storeColors = {
    'Cooler & drinks': '#1e88e5',
    'Grill & foil': '#c62828',
    Snacks: '#f9a825',
    Breakfast: '#fbc02d',
    'Safety & bugs': '#2e7d32',
    Lighting: '#6a1b9a',
    'Trash & recycling': '#546e7a',
    Other: '#78909c',
  };
  return storeColors[store] || storeColors.Other;
};

// Auto-save debounce time in milliseconds
export const AUTO_SAVE_DEBOUNCE_MS = 500;

// Click outside handler delay in milliseconds
export const CLICK_OUTSIDE_DELAY_MS = 100;

// Get abbreviated store name for mobile display
export const getStoreAbbreviation = (store) => {
  const abbreviations = {
    'Cooler & drinks': 'Cooler',
    'Grill & foil': 'Grill',
    Snacks: 'Snack',
    Breakfast: 'Bfast',
    'Safety & bugs': 'Safe',
    Lighting: 'Light',
    'Trash & recycling': 'Trash',
    Other: 'Other',
  };
  return abbreviations[store] || store;
};
