import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/* eslint-disable no-undef -- Node script; ESLint env not configured for scripts */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

let envVars = {};
try {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach((line) => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      envVars[key] = value;
    }
  });
} catch {
  console.warn('Warning: Could not read .env file, using process.env');
}

const getEnv = (key) => envVars[key] || process.env[key];

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
};

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your-api-key') {
  console.error('❌ Error: Firebase configuration not found in .env file');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const menuSeeds = [
  { type: 'daily', date: 'July 2', lunch: 'Sandwiches on the road', dinner: 'Hot dogs + sides' },
  { type: 'daily', date: 'July 3', lunch: 'Tacos', dinner: 'Foil-pack chicken + veg' },
  { type: 'daily', date: 'July 4', lunch: 'Burgers + corn', dinner: 'Dutch-oven chili + cobbler' },
  { type: 'daily', date: 'July 5', lunch: 'Leftovers / clean fridge', dinner: 'Pack-out — light' },

  { type: 'salad', name: 'Big green salad + vinaigrette', preparedBy: 'TBD' },
  { type: 'salad', name: 'Watermelon + feta', preparedBy: 'TBD' },
  { type: 'salad', name: 'Pasta salad (pesto)', preparedBy: 'TBD' },

  { type: 'snack', name: 'Chips + salsa' },
  { type: 'snack', name: 'Pickles + olives board' },

  { type: 'drink', name: 'Lemonade mix + iced tea' },
  { type: 'drink', name: 'Coffee bar (cream + sugar)' },
];

function buildShoppingSeeds(menu) {
  const find = (type, pred) => menu.find((m) => m.type === type && pred(m));
  const j4 = find('daily', (m) => m.date === 'July 4');
  const j3 = find('daily', (m) => m.date === 'July 3');
  const j2 = find('daily', (m) => m.date === 'July 2');
  const pasta = find('salad', (m) => m.name === 'Pasta salad (pesto)');
  const green = find('salad', (m) => m.name === 'Big green salad + vinaigrette');
  const melon = find('salad', (m) => m.name === 'Watermelon + feta');
  const chips = find('snack', (m) => m.name === 'Chips + salsa');
  const pickles = find('snack', (m) => m.name === 'Pickles + olives board');
  const lemonade = find('drink', (m) => m.name === 'Lemonade mix + iced tea');
  const coffeeBar = find('drink', (m) => m.name === 'Coffee bar (cream + sugar)');

  const L = (daily, slot) => `${daily.id}|${slot}`;

  return [
    { name: 'Ice / block ice', store: 'Costco', salad: 'General', quantity: '2 bags', notes: '' },
    { name: 'Water jugs', store: 'Aldi', salad: 'General', quantity: '3 gal', notes: '' },
    { name: 'Sparkling water', store: 'Costco', salad: lemonade.id, quantity: '12 pk', notes: '' },
    { name: 'Propane (extra)', store: 'Costco', salad: L(j4, 'dinner'), quantity: '2', notes: '' },
    { name: 'Heavy-duty foil', store: 'Aldi', salad: L(j3, 'dinner'), quantity: '2 rolls', notes: '' },
    { name: 'Burger patties', store: 'Fresh Farms', salad: L(j4, 'lunch'), quantity: '2 lb', notes: '' },
    { name: 'Trail mix', store: "Binny's", salad: chips.id, quantity: '1 large', notes: '' },
    { name: "S'mores kit", store: 'Costco', salad: L(j2, 'dinner'), quantity: '1', notes: 'graham, marshmallow, chocolate' },
    { name: 'Eggs', store: 'Fresh Farms', salad: L(j3, 'lunch'), quantity: '18', notes: '' },
    { name: 'Coffee + filters', store: 'Aldi', salad: coffeeBar.id, quantity: '', notes: '' },
    { name: 'Bug spray', store: 'Other', salad: 'General', quantity: '2 cans', notes: '' },
    { name: 'Sunscreen SPF 50', store: 'Other', salad: 'General', quantity: '1', notes: '' },
    { name: 'First aid kit', store: 'Other', salad: 'General', quantity: '1', notes: 'restock bandages' },
    { name: 'Corn on the cob', store: 'Fresh Farms', salad: L(j4, 'lunch'), quantity: '12', notes: '' },
    { name: 'Pesto + pasta', store: 'Aldi', salad: pasta.id, quantity: '2 boxes', notes: '' },
    { name: 'Feta + mint', store: "Binny's", salad: melon.id, quantity: '1', notes: '' },
    { name: 'Mixed greens', store: 'Fresh Farms', salad: green.id, quantity: '3 bags', notes: '' },
    { name: 'Olives', store: "Binny's", salad: pickles.id, quantity: '2 jars', notes: '' },
  ];
}

async function populateData() {
  try {
    console.log('Starting data population...\n');

    console.log('Adding menu items...');
    const menu = [];
    for (const item of menuSeeds) {
      const ref = await addDoc(collection(db, 'menu'), {
        ...item,
        createdAt: new Date(),
      });
      menu.push({ id: ref.id, ...item });
      const displayName =
        item.name || `${item.date} (${item.lunch || 'N/A'}/${item.dinner || 'N/A'})`;
      console.log(`  ✓ Added menu: ${displayName} (${item.type})`);
    }

    console.log(`\n✓ Added ${menu.length} menu rows\n`);

    const shoppingListItems = buildShoppingSeeds(menu);

    console.log('Adding shopping list items...');
    for (const item of shoppingListItems) {
      await addDoc(collection(db, 'shoppingList'), {
        ...item,
        checked: item.checked || false,
        createdAt: new Date(),
      });
      console.log(`  ✓ Added: ${item.name} (meal: ${item.salad})`);
    }

    console.log(`\n✓ Added ${shoppingListItems.length} shopping list items\n`);
    console.log('✅ Data population completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating data:', error);
    process.exit(1);
  }
}

populateData();
