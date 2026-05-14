import { MEAL_TAG_UNASSIGNED_VALUE } from './mealTag';

/** Sentinel stored in Firestore `salad` when no menu row is selected. */
export const UNASSIGNED_MEAL_VALUE = MEAL_TAG_UNASSIGNED_VALUE;

const MEAL_PALETTE = [
  '#1e88e5',
  '#c62828',
  '#f9a825',
  '#2e7d32',
  '#6a1b9a',
  '#00897b',
  '#6d4c41',
  '#0277bd',
  '#c47f08',
  '#546e7a',
];

const hashString = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

export const getMealColor = (mealKey) => {
  if (mealKey == null || mealKey === '' || mealKey === UNASSIGNED_MEAL_VALUE) {
    return '#78909c';
  }
  return MEAL_PALETTE[hashString(String(mealKey)) % MEAL_PALETTE.length];
};

/**
 * Build pickable meal rows from persisted `menu` documents (same source as Menu page).
 * Daily rows become two options (lunch / dinner). Salad, snack, drink use doc id + name.
 */
export const buildMealOptions = (menuItems) => {
  if (!Array.isArray(menuItems)) return [];
  const options = [];

  for (const m of menuItems) {
    if (!m?.id) continue;
    const t = m.type || 'daily';
    if (t === 'daily') {
      const dateLabel = m.date?.trim() || 'Day';
      if (m.lunch !== undefined && m.lunch !== null) {
        options.push({
          value: `${m.id}|lunch`,
          label: `${dateLabel} — Lunch: ${(m.lunch || '—').trim() || '—'}`,
          sort: `${dateLabel}\0A`,
        });
      }
      if (m.dinner !== undefined && m.dinner !== null) {
        options.push({
          value: `${m.id}|dinner`,
          label: `${dateLabel} — Dinner: ${(m.dinner || '—').trim() || '—'}`,
          sort: `${dateLabel}\0B`,
        });
      }
    } else if ((t === 'salad' || t === 'snack' || t === 'drink') && m.name?.trim()) {
      options.push({
        value: m.id,
        label: m.name.trim(),
        sort: `C\0${t}\0${m.name.trim()}`,
      });
    }
  }

  options.sort((a, b) => a.sort.localeCompare(b.sort));
  return options.map(({ value, label }) => ({ value, label }));
};

/** Camp meals only (`type: 'salad'` in Firestore) — same section as Menu "Camp meals". */
export const buildCampMealOptions = (menuItems) => {
  if (!Array.isArray(menuItems)) return [];
  const options = [];
  for (const m of menuItems) {
    if (!m?.id) continue;
    if (m.type === 'salad' && m.name?.trim()) {
      options.push({
        value: m.id,
        label: m.name.trim(),
        sort: `C\0salad\0${m.name.trim()}`,
      });
    }
  }
  options.sort((a, b) => a.sort.localeCompare(b.sort));
  return options.map(({ value, label }) => ({ value, label }));
};

const menuById = (menuItems) => {
  const map = new Map();
  (menuItems || []).forEach((m) => {
    if (m?.id) map.set(m.id, m);
  });
  return map;
};

/**
 * Normalize `item.salad` to a canonical meal key (menu id or `id|lunch` / `id|dinner`).
 * Supports legacy rows where `salad` was the camp-meal display name (type salad).
 */
export const resolveNormalizedMealKey = (item, menuItems) => {
  const raw = item?.salad;
  if (raw == null || raw === '' || raw === UNASSIGNED_MEAL_VALUE) {
    return UNASSIGNED_MEAL_VALUE;
  }

  const byId = menuById(menuItems);

  if (typeof raw === 'string' && raw.includes('|')) {
    const [docId, slot] = raw.split('|');
    const parent = byId.get(docId);
    if (parent && parent.type === 'daily' && (slot === 'lunch' || slot === 'dinner')) {
      return raw;
    }
    return UNASSIGNED_MEAL_VALUE;
  }

  if (byId.has(raw)) {
    const doc = byId.get(raw);
    if (doc.type === 'daily') return UNASSIGNED_MEAL_VALUE;
    return raw;
  }

  const legacy = (menuItems || []).find((m) => m.type === 'salad' && m.name === raw);
  if (legacy?.id) return legacy.id;

  return UNASSIGNED_MEAL_VALUE;
};

export const labelForMealKey = (mealKey, menuItems) => {
  if (mealKey == null || mealKey === '' || mealKey === UNASSIGNED_MEAL_VALUE) {
    return 'Unassigned';
  }

  if (typeof mealKey === 'string' && mealKey.includes('|')) {
    const [docId, slot] = mealKey.split('|');
    const m = menuById(menuItems).get(docId);
    if (m?.type === 'daily') {
      const dateLabel = m.date?.trim() || 'Day';
      const text = slot === 'lunch' ? m.lunch : m.dinner;
      return `${dateLabel} — ${slot === 'lunch' ? 'Lunch' : 'Dinner'}: ${(text || '—').trim() || '—'}`;
    }
    return 'Removed meal';
  }

  const m = menuById(menuItems).get(mealKey);
  if (m?.name) return m.name;
  return 'Removed meal';
};

/**
 * Options for shopping meal assignment: camp meals only, plus at most one extra row
 * when `selectedAssignmentKey` is a non–camp-meal tag (so editors keep a valid HTML select value).
 */
export const buildCampMealAssignmentOptions = (menuItems, selectedAssignmentKey) => {
  const base = buildCampMealOptions(menuItems);
  const k = selectedAssignmentKey;
  if (k == null || k === '' || k === UNASSIGNED_MEAL_VALUE) return base;
  if (base.some((o) => o.value === k)) return base;
  return [...base, { value: k, label: labelForMealKey(k, menuItems) }];
};

/** Full menu-backed meal keys (daily slots, camp, snack, drink) plus one orphan row when needed. */
export const buildMealAssignmentOptions = (menuItems, selectedAssignmentKey) => {
  const base = buildMealOptions(menuItems);
  const k = selectedAssignmentKey;
  if (k == null || k === '' || k === UNASSIGNED_MEAL_VALUE) return base;
  if (base.some((o) => o.value === k)) return base;
  return [...base, { value: k, label: labelForMealKey(k, menuItems) }];
};
