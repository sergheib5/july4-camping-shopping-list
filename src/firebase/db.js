import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db } from './config';

// Shopping List Collection
const SHOPPING_LIST_COLLECTION = 'shoppingList';
const MENU_COLLECTION = 'menu';

// Shopping List Functions
export const subscribeToShoppingList = (callback, onError) => {
  const q = query(collection(db, SHOPPING_LIST_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(items);
    },
    (error) => {
      console.error('Error subscribing to shopping list:', error);
      if (onError) {
        onError(error);
      }
    }
  );
};

export const addShoppingItem = async (item) => {
  return await addDoc(collection(db, SHOPPING_LIST_COLLECTION), {
    ...item,
    createdAt: new Date(),
    checked: false
  });
};

export const updateShoppingItem = async (id, updates) => {
  const itemRef = doc(db, SHOPPING_LIST_COLLECTION, id);
  return await updateDoc(itemRef, updates);
};

export const deleteShoppingItem = async (id) => {
  return await deleteDoc(doc(db, SHOPPING_LIST_COLLECTION, id));
};

export const toggleShoppingItem = async (id, checked) => {
  return await updateShoppingItem(id, { checked });
};

// Menu Functions
export const subscribeToMenu = (callback, onError) => {
  const q = query(collection(db, MENU_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(items);
    },
    (error) => {
      console.error('Error subscribing to menu:', error);
      if (onError) {
        onError(error);
      }
    }
  );
};

export const addMenuItem = async (item) => {
  try {
    // Ensure type is always included
    const menuItem = {
      ...item,
      type: item.type || 'daily',
      createdAt: new Date()
    };
    console.log('Adding menu item to Firestore:', menuItem);
    const docRef = await addDoc(collection(db, MENU_COLLECTION), menuItem);
    console.log('Menu item added with ID:', docRef.id);
    return docRef;
  } catch (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }
};

export const updateMenuItem = async (id, updates) => {
  try {
    console.log('Updating menu item in Firestore:', { id, updates });
    const itemRef = doc(db, MENU_COLLECTION, id);
    await updateDoc(itemRef, updates);
    console.log('Menu item updated successfully');
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
};

export const deleteMenuItem = async (id) => {
  try {
    console.log('Deleting menu item from Firestore:', id);
    await deleteDoc(doc(db, MENU_COLLECTION, id));
    console.log('Menu item deleted successfully');
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
};

// Export Functions - Get all data for CSV export
export const getAllShoppingListItems = async () => {
  try {
    const q = query(collection(db, SHOPPING_LIST_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching shopping list items:', error);
    throw error;
  }
};

export const getAllMenuItems = async () => {
  try {
    const q = query(collection(db, MENU_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
};