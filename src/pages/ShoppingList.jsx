import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import InlineAddRow from '../components/InlineAddRow';
import EditableShoppingRow from '../components/EditableShoppingRow';
import SearchField from '../components/SearchField';
import useSalads from '../hooks/useSalads';
import { 
  subscribeToShoppingList, 
  addShoppingItem,
  updateShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem 
} from '../firebase/db';
import { STORES, getStoreColor } from '../utils/constants';
import { triggerStoreConfetti, triggerCompleteConfetti } from '../utils/confetti';
import './ShoppingList.css';

const ShoppingList = () => {
  const salads = useSalads();
  const [items, setItems] = useState([]);
  const [selectedStore, setSelectedStore] = useState('All');
  const [selectedSalad, setSelectedSalad] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const previousCompletedStoresRef = useRef(new Set());
  const wasFullyCompleteRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const confettiCleanupRef = useRef(null);

  // Helper function to calculate store completion status
  const calculateStoreCompletion = (itemsList) => {
    const storeItems = {};
    const completedStores = new Set();

    // Group items by store
    itemsList.forEach(item => {
      const store = item.store || 'Other';
      if (!storeItems[store]) {
        storeItems[store] = { total: 0, checked: 0 };
      }
      storeItems[store].total++;
      if (item.checked) {
        storeItems[store].checked++;
      }
    });

    // Find stores that are 100% complete (have items and all are checked)
    Object.keys(storeItems).forEach(store => {
      const storeData = storeItems[store];
      if (storeData.total > 0 && storeData.checked === storeData.total) {
        completedStores.add(store);
      }
    });

    // Check if entire list is complete
    const totalItems = itemsList.length;
    const checkedItems = itemsList.filter(item => item.checked).length;
    const isFullyComplete = totalItems > 0 && checkedItems === totalItems;

    return { completedStores, isFullyComplete };
  };

  useEffect(() => {
    const unsubscribe = subscribeToShoppingList((items) => {
      setItems(items);
    });

    return () => unsubscribe();
  }, []);

  // Track store completion and trigger confetti
  useEffect(() => {
    // Skip confetti on initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      // Set initial state without triggering confetti
      const storeCompletion = calculateStoreCompletion(items);
      previousCompletedStoresRef.current = new Set(storeCompletion.completedStores);
      wasFullyCompleteRef.current = storeCompletion.isFullyComplete;
      return;
    }

    // Cleanup any pending confetti animations before triggering new ones
    if (confettiCleanupRef.current) {
      confettiCleanupRef.current();
      confettiCleanupRef.current = null;
    }

    const storeCompletion = calculateStoreCompletion(items);
    const currentCompletedStores = new Set(storeCompletion.completedStores);
    const previousCompletedStores = previousCompletedStoresRef.current;

    // Check for newly completed stores
    currentCompletedStores.forEach(store => {
      if (!previousCompletedStores.has(store)) {
        // Store just became complete - trigger confetti!
        const storeColor = getStoreColor(store);
        triggerStoreConfetti(store, storeColor);
      }
    });

    // Check if entire list just became 100% complete
    if (storeCompletion.isFullyComplete && !wasFullyCompleteRef.current) {
      // Entire list just became complete - big celebration!
      const cleanup = triggerCompleteConfetti();
      confettiCleanupRef.current = cleanup;
    }

    // Update refs for next comparison
    previousCompletedStoresRef.current = currentCompletedStores;
    wasFullyCompleteRef.current = storeCompletion.isFullyComplete;

    // Cleanup function to cancel pending animations when effect re-runs or component unmounts
    return () => {
      if (confettiCleanupRef.current) {
        confettiCleanupRef.current();
        confettiCleanupRef.current = null;
      }
    };
  }, [items]);

  const handleAddItem = async (itemData) => {
    try {
      await addShoppingItem(itemData);
      // Add row stays visible for continuous adding
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleUpdateItem = async (itemId, itemData) => {
    try {
      await updateShoppingItem(itemId, itemData);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const handleToggleItem = async (id, checked) => {
    try {
      await toggleShoppingItem(id, checked);
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteShoppingItem(id);
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  // Filter items based on selected store, camp meal (Firestore field `salad`), and search query
  const filteredItems = items.filter(item => {
    // Store filter
    const matchesStore = selectedStore === 'All' || item.store === selectedStore;
    
    // Camp meal filter (links to menu rows with type "salad"; field name remains `salad` for parity)
    const matchesSalad = selectedSalad === 'All' || (item.salad || 'General') === selectedSalad;
    
    // Search filter - defensively handle missing or undefined names
    const matchesSearch = searchQuery.trim() === '' || 
      (item.name && typeof item.name === 'string' && 
       item.name.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    
    return matchesStore && matchesSalad && matchesSearch;
  });

  return (
    <div className="shopping-list-page">
      <Header />
      <main className="main-content">
        <div className="shopping-list-container">
          {/* Store filter */}
          <div className="store-filter">
            <button
              className={`filter-button ${selectedStore === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedStore('All')}
            >
              All
            </button>
            {STORES.map(store => (
              <button
                key={store}
                className={`filter-button ${selectedStore === store ? 'active' : ''}`}
                onClick={() => setSelectedStore(store)}
                style={{
                  backgroundColor: selectedStore === store ? getStoreColor(store) : 'white',
                  color: selectedStore === store ? 'white' : '#333',
                  borderColor: getStoreColor(store)
                }}
              >
                {store}
              </button>
            ))}
          </div>

          {/* Camp meal filter (menu type "salad" in Firestore) */}
          {salads.length > 0 && (
            <div className="salad-filter">
              <button
                className={`filter-button filter-button-salad ${selectedSalad === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedSalad('All')}
              >
                All meals
              </button>
              <button
                className={`filter-button filter-button-salad ${selectedSalad === 'General' ? 'active' : ''}`}
                onClick={() => setSelectedSalad('General')}
                style={{
                  backgroundColor: selectedSalad === 'General' ? '#c47f08' : 'white',
                  color: selectedSalad === 'General' ? 'white' : '#333',
                  borderColor: '#c47f08'
                }}
              >
                General
              </button>
              {salads.map(salad => (
                <button
                  key={salad}
                  className={`filter-button filter-button-salad ${selectedSalad === salad ? 'active' : ''}`}
                  onClick={() => setSelectedSalad(salad)}
                  style={{
                    backgroundColor: selectedSalad === salad ? '#c47f08' : 'white',
                    color: selectedSalad === salad ? 'white' : '#333',
                    borderColor: '#c47f08'
                  }}
                >
                  {salad}
                </button>
              ))}
            </div>
          )}
          
          {/* Search field */}
          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search items..."
          />
          
          {/* Add form at the top */}
          <InlineAddRow
            onSave={handleAddItem}
          />
          <div className="shopping-list-table">
            <div className="table-body">
              {filteredItems.length === 0 ? (
                <div className="empty-message">
                  {searchQuery.trim() 
                    ? `No items found matching "${searchQuery}"`
                    : selectedStore === 'All' && selectedSalad === 'All'
                      ? 'No items in your shopping list yet' 
                      : selectedStore !== 'All' && selectedSalad === 'All'
                        ? `No items for ${selectedStore} yet`
                        : selectedStore === 'All' && selectedSalad !== 'All'
                          ? `No items for ${selectedSalad} yet`
                          : `No items for ${selectedStore} - ${selectedSalad} yet`}
                </div>
              ) : (
                filteredItems.map((item) => (
                  <EditableShoppingRow
                    key={item.id}
                    item={item}
                    onToggle={handleToggleItem}
                    onDelete={handleDeleteItem}
                    onSave={handleUpdateItem}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default ShoppingList;

