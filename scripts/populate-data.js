import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

let envVars = {};
try {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      envVars[key] = value;
    }
  });
} catch (error) {
  console.warn('Warning: Could not read .env file, using process.env');
}

// Use env file values or fall back to process.env
const getEnv = (key) => envVars[key] || process.env[key];

// Firebase configuration
const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
};

// Validate configuration
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your-api-key') {
  console.error('❌ Error: Firebase configuration not found in .env file');
  console.error('Please make sure your .env file contains all VITE_FIREBASE_* variables');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Example packing list — July 4 weekend campout (tune before running)
const shoppingListItems = [
  { name: 'Ice / block ice', store: 'Cooler & drinks', quantity: '2 bags', notes: '' },
  { name: 'Water jugs', store: 'Cooler & drinks', quantity: '3 gal', notes: '' },
  { name: 'Sparkling water', store: 'Cooler & drinks', quantity: '12 pk', notes: '' },
  { name: 'Propane (extra)', store: 'Grill & foil', quantity: '2', notes: '' },
  { name: 'Heavy-duty foil', store: 'Grill & foil', quantity: '2 rolls', notes: '' },
  { name: 'Burger patties', store: 'Grill & foil', quantity: '2 lb', notes: '' },
  { name: 'Trail mix', store: 'Snacks', quantity: '1 large', notes: '' },
  { name: 'S\'mores kit', store: 'Snacks', quantity: '1', notes: 'graham, marshmallow, chocolate' },
  { name: 'Eggs', store: 'Breakfast', quantity: '18', notes: '' },
  { name: 'Coffee + filters', store: 'Breakfast', quantity: '', notes: '' },
  { name: 'Bug spray', store: 'Safety & bugs', quantity: '2 cans', notes: '' },
  { name: 'Sunscreen SPF 50', store: 'Safety & bugs', quantity: '1', notes: '' },
  { name: 'First aid kit', store: 'Safety & bugs', quantity: '1', notes: 'restock bandages' },
  { name: 'Headlamps + batteries', store: 'Lighting', quantity: '4', notes: 'LED only' },
  { name: 'Lantern (battery)', store: 'Lighting', quantity: '1', notes: '' },
  { name: 'Trash bags (heavy)', store: 'Trash & recycling', quantity: '1 box', notes: '' },
  { name: 'Recycling bags', store: 'Trash & recycling', quantity: '1 roll', notes: '' },
];

// Menu seed — `type: 'salad'` is the cookout / camp meal lane (Firestore parity with reference app)
const menuItems = [
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

async function populateData() {
  try {
    console.log('Starting data population...\n');

    console.log('Adding shopping list items...');
    for (const item of shoppingListItems) {
      await addDoc(collection(db, 'shoppingList'), {
        ...item,
        checked: item.checked || false,
        createdAt: new Date()
      });
      console.log(`  ✓ Added: ${item.name} (${item.store})`);
    }

    console.log(`\n✓ Added ${shoppingListItems.length} shopping list items\n`);

    console.log('Adding menu items...');
    for (const item of menuItems) {
      await addDoc(collection(db, 'menu'), {
        ...item,
        createdAt: new Date()
      });
      const displayName = item.name || `${item.date} (${item.lunch || 'N/A'}/${item.dinner || 'N/A'})`;
      console.log(`  ✓ Added: ${displayName} (${item.type})`);
    }

    console.log(`\n✓ Added ${menuItems.length} menu items\n`);
    console.log('✅ Data population completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating data:', error);
    process.exit(1);
  }
}

populateData();
