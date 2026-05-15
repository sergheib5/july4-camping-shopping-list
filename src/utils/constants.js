// Timing constants shared by shopping row editors
export const AUTO_SAVE_DEBOUNCE_MS = 500;
export const CLICK_OUTSIDE_DELAY_MS = 100;

/** Retail runs (top chips). Replaces obsolete packing-lane names in older Firestore rows. */
export const STORES = ['Fresh Farms', 'Aldi', 'Costco', "Binny's", 'Other'];

export const DEFAULT_STORE = STORES[0];

/** Older list data / seeds used the singular label—map to the store name shown in UI. */
const LEGACY_STORE_ALIASES = {
  'Fresh Farm': 'Fresh Farms',
};

const STORE_COLORS = {
  'Fresh Farms': '#2e7d32',
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

/**
 * Map persisted `item.store` to a `<select>` value from `STORES` when possible
 * (e.g. legacy "Fresh Farm" → "Fresh Farms"), packing lanes → Other, else keep unknown strings.
 */
export const coerceStoreFromItem = (store) => {
  const raw = (store ?? '').trim();
  if (!raw) return DEFAULT_STORE;
  if (LEGACY_STORE_ALIASES[raw]) return LEGACY_STORE_ALIASES[raw];
  if (STORES.includes(raw)) return raw;
  if (LEGACY_PACKING_LANES.has(raw)) return 'Other';
  return raw;
};

export const normalizeRetailStore = (store) => {
  if (store == null || store === '') return 'Other';
  const raw = typeof store === 'string' ? store.trim() : String(store);
  if (LEGACY_STORE_ALIASES[raw]) return LEGACY_STORE_ALIASES[raw];
  if (STORES.includes(raw)) return raw;
  if (LEGACY_PACKING_LANES.has(raw)) return 'Other';
  return 'Other';
};

export const getStoreColor = (store) => {
  const key = normalizeRetailStore(store);
  return STORE_COLORS[key] || STORE_COLORS.Other;
};

const HEX_RGB = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;

function hexToRgb(hex) {
  const m = (hex || '').trim().match(HEX_RGB);
  if (!m) return { r: 158, g: 158, b: 158 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

function rgbToHex(r, g, b) {
  const c = (n) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** @returns {{ h: number; s: number; l: number }} — h in degrees 0–360 */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }

  return { h: h * 360, s, l };
}

function hslToRgb(h, s, l) {
  const xH = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((xH / 60) % 2) - 1));
  const m = l - c / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (xH < 60) {
    rp = c;
    gp = x;
  } else if (xH < 120) {
    rp = x;
    gp = c;
  } else if (xH < 180) {
    gp = c;
    bp = x;
  } else if (xH < 240) {
    gp = x;
    bp = c;
  } else if (xH < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    gp = x;
  }
  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

/**
 * Diagonal fill: same hue as {@link getStoreColor}, adjusted in HSL so mixes stay vivid
 * (RGB→white reads muddy on greens/blues). Confetti / chip borders still use solid {@link getStoreColor}.
 */
export const getStoreGradient = (store) => {
  const baseHex = getStoreColor(store);
  const base = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(base.r, base.g, base.b);
  const lightL = Math.min(0.92, l + (1 - l) * 0.36);
  const lightS = s * (s < 0.04 ? 1 : 0.78);
  const darkL = Math.max(s < 0.04 ? l - 0.18 : 0.1, l - 0.2);
  const darkS = Math.min(1, s * (s < 0.04 ? 1 : 1.06));
  const L = hslToRgb(h, lightS, lightL);
  const D = hslToRgb(h, darkS, darkL);
  const LH = rgbToHex(L.r, L.g, L.b);
  const DH = rgbToHex(D.r, D.g, D.b);
  return `linear-gradient(138deg, ${LH} 0%, ${baseHex} 52%, ${DH} 100%)`;
};

export const getStoreAbbreviation = (store) => {
  const s = normalizeRetailStore(store);
  const abbreviations = {
    'Fresh Farms': 'FF',
    Aldi: 'Aldi',
    Costco: 'Costco',
    "Binny's": "Binny's",
    Other: 'Other',
  };
  return abbreviations[s] || s;
};
