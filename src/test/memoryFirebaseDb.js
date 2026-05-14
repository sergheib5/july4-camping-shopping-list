/**
 * In-memory Firestore substitute for Vitest integration tests.
 * Mirrors the subset of `firebase/db` used by ShoppingList, Menu, Header export, and hooks.
 */

let shopping = [];
let menu = [];
const shopSubs = new Set();
const menuSubs = new Set();

const emitShop = () => {
  const list = shopping.map((r) => ({ ...r }));
  shopSubs.forEach((cb) => cb(list));
};

const emitMenu = () => {
  const list = menu.map((r) => ({ ...r }));
  menuSubs.forEach((cb) => cb(list));
};

const nextId = (prefix) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export function __resetFirebaseMemory() {
  shopping = [];
  menu = [];
  shopSubs.clear();
  menuSubs.clear();
}

/** Replace collections and notify current subscribers (call before mount if you need initial data). */
export function __seedFirebaseMemory({ shopping: s, menu: m } = {}) {
  shopping = (s || []).map((row) => ({ ...row }));
  menu = (m || []).map((row) => ({ ...row }));
  emitShop();
  emitMenu();
}

export function __getShoppingMemory() {
  return shopping.map((r) => ({ ...r }));
}

export function __getMenuMemory() {
  return menu.map((r) => ({ ...r }));
}

export const subscribeToShoppingList = (callback, _onError) => {
  shopSubs.add(callback);
  queueMicrotask(() => callback(shopping.map((r) => ({ ...r }))));
  return () => {
    shopSubs.delete(callback);
  };
};

export const subscribeToMenu = (callback, _onError) => {
  menuSubs.add(callback);
  queueMicrotask(() => callback(menu.map((r) => ({ ...r }))));
  return () => {
    menuSubs.delete(callback);
  };
};

export const addShoppingItem = async (item) => {
  const id = nextId('shop');
  shopping = [
    {
      id,
      ...item,
      checked: item.checked ?? false,
      createdAt: item.createdAt || new Date(),
    },
    ...shopping,
  ];
  emitShop();
  return { id };
};

export const updateShoppingItem = async (id, updates) => {
  shopping = shopping.map((r) => (r.id === id ? { ...r, ...updates } : r));
  emitShop();
};

export const toggleShoppingItem = async (id, checked) => {
  await updateShoppingItem(id, { checked });
};

export const deleteShoppingItem = async (id) => {
  shopping = shopping.filter((r) => r.id !== id);
  emitShop();
};

export const addMenuItem = async (item) => {
  const id = nextId('menu');
  const row = {
    id,
    ...item,
    type: item.type || 'daily',
    createdAt: item.createdAt || new Date(),
  };
  menu = [row, ...menu];
  emitMenu();
  return { id };
};

export const updateMenuItem = async (id, updates) => {
  menu = menu.map((r) => (r.id === id ? { ...r, ...updates } : r));
  emitMenu();
};

export const deleteMenuItem = async (id) => {
  menu = menu.filter((r) => r.id !== id);
  emitMenu();
};

export const getAllShoppingListItems = async () => shopping.map((r) => ({ ...r }));

export const getAllMenuItems = async () => menu.map((r) => ({ ...r }));
