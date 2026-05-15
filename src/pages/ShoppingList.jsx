import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import InlineAddRow from '../components/InlineAddRow';
import EditableShoppingRow from '../components/EditableShoppingRow';
import SearchField from '../components/SearchField';
import useMenuMeals from '../hooks/useMenuMeals';
import {
  subscribeToShoppingList,
  addShoppingItem,
  updateShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
} from '../firebase/db';
import { STORES, getStoreColor, normalizeRetailStore } from '../utils/constants';
import {
  resolveNormalizedMealKey,
  labelForMealKey,
  UNASSIGNED_MEAL_VALUE,
  getMealColor,
} from '../utils/menuMeals';
import { triggerStoreConfetti, triggerCompleteConfetti } from '../utils/confetti';
import './ShoppingList.css';

const storeBucket = (item) => normalizeRetailStore(item.store);

const ShoppingList = () => {
  const { menuItems, mealOptions, campMealOptions } = useMenuMeals();
  const [items, setItems] = useState([]);
  const [selectedStore, setSelectedStore] = useState('All');
  const [selectedMeal, setSelectedMeal] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const previousCompletedStoresRef = useRef(new Set());
  const wasFullyCompleteRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const confettiCleanupRef = useRef(null);

  const calculateStoreCompletion = (itemsList) => {
    const storeItems = {};
    const completedStores = new Set();

    itemsList.forEach((item) => {
      const store = storeBucket(item);
      if (!storeItems[store]) {
        storeItems[store] = { total: 0, checked: 0 };
      }
      storeItems[store].total++;
      if (item.checked) {
        storeItems[store].checked++;
      }
    });

    Object.keys(storeItems).forEach((store) => {
      const d = storeItems[store];
      if (d.total > 0 && d.checked === d.total) {
        completedStores.add(store);
      }
    });

    const totalItems = itemsList.length;
    const checkedItems = itemsList.filter((item) => item.checked).length;
    const isFullyComplete = totalItems > 0 && checkedItems === totalItems;

    return { completedStores, isFullyComplete };
  };

  useEffect(() => {
    const unsubscribe = subscribeToShoppingList((list) => {
      setItems(list);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      const sc = calculateStoreCompletion(items);
      previousCompletedStoresRef.current = new Set(sc.completedStores);
      wasFullyCompleteRef.current = sc.isFullyComplete;
      return;
    }

    if (confettiCleanupRef.current) {
      confettiCleanupRef.current();
      confettiCleanupRef.current = null;
    }

    const sc = calculateStoreCompletion(items);
    const currentCompletedStores = new Set(sc.completedStores);
    const previousCompletedStores = previousCompletedStoresRef.current;

    currentCompletedStores.forEach((store) => {
      if (!previousCompletedStores.has(store)) {
        const storeColor = getStoreColor(store);
        triggerStoreConfetti(store, storeColor);
      }
    });

    if (sc.isFullyComplete && !wasFullyCompleteRef.current) {
      const cleanup = triggerCompleteConfetti();
      confettiCleanupRef.current = cleanup;
    }

    previousCompletedStoresRef.current = currentCompletedStores;
    wasFullyCompleteRef.current = sc.isFullyComplete;

    return () => {
      if (confettiCleanupRef.current) {
        confettiCleanupRef.current();
        confettiCleanupRef.current = null;
      }
    };
  }, [items]);

  const effectiveSelectedMeal = useMemo(() => {
    if (selectedMeal === 'All' || selectedMeal === UNASSIGNED_MEAL_VALUE) return 'All';
    return campMealOptions.some((o) => o.value === selectedMeal) ? selectedMeal : 'All';
  }, [selectedMeal, campMealOptions]);

  const handleAddItem = async (itemData) => {
    try {
      await addShoppingItem(itemData);
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
      alert('Failed to update item. Please try again.');
    }
  };

  const closeDeleteDialog = useCallback(() => setPendingDeleteId(null), []);

  const handleRequestDeleteItem = (id) => {
    setPendingDeleteId(id);
  };

  const handleConfirmDeleteItem = async () => {
    const id = pendingDeleteId;
    if (!id) return;
    setPendingDeleteId(null);
    try {
      await deleteShoppingItem(id);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const pendingDeleteItem = useMemo(
    () => (pendingDeleteId ? items.find((i) => i.id === pendingDeleteId) : null),
    [items, pendingDeleteId],
  );

  const filteredItems = items.filter((item) => {
    const matchesStore =
      selectedStore === 'All' || storeBucket(item) === selectedStore;

    const mealKey = resolveNormalizedMealKey(item, menuItems);
    const matchesMeal =
      effectiveSelectedMeal === 'All' || mealKey === effectiveSelectedMeal;

    const matchesSearch =
      searchQuery.trim() === '' ||
      (item.name &&
        typeof item.name === 'string' &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase().trim()));

    return matchesStore && matchesMeal && matchesSearch;
  });

  const mealSections = useMemo(() => {
    const map = new Map();
    for (const item of filteredItems) {
      const k = resolveNormalizedMealKey(item, menuItems);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(item);
    }

    const mealOrderIndex = (key) => {
      if (key === UNASSIGNED_MEAL_VALUE) return 9999;
      const i = mealOptions.findIndex((o) => o.value === key);
      return i === -1 ? 5000 + String(key).charCodeAt(0) : i;
    };

    const keys = [...map.keys()].sort((a, b) => mealOrderIndex(a) - mealOrderIndex(b));

    return keys.map((mealKey) => {
      const title =
        labelForMealKey(mealKey, menuItems);
      return { mealKey, title, items: map.get(mealKey) };
    });
  }, [filteredItems, menuItems, mealOptions]);

  const mealChipLabel = (mealKey) => {
    if (mealKey === 'All') return 'All Meals';
    return labelForMealKey(mealKey, menuItems);
  };

  const emptySummary = () => {
    if (searchQuery.trim()) {
      return `No items found matching "${searchQuery}"`;
    }
    if (effectiveSelectedMeal !== 'All') {
      const m = mealChipLabel(effectiveSelectedMeal);
      if (selectedStore === 'All') {
        return `No items tagged for ${m} yet`;
      }
      return `No items for ${m} at ${selectedStore} yet`;
    }
    if (selectedStore === 'All') {
      return 'Your shopping list is empty';
    }
    return `No items for ${selectedStore} yet`;
  };

  return (
    <div className="shopping-list-page">
      <Header />
      <main className="main-content">
        <div className="shopping-list-container">
          <div
            className="store-filter store-filter--retail"
            role="toolbar"
            aria-label="Filter by store"
          >
            <button
              type="button"
              className={`filter-button ${selectedStore === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedStore('All')}
            >
              All Stores
            </button>
            {STORES.map((store) => {
              const active = selectedStore === store;
              const color = getStoreColor(store);
              return (
                <button
                  type="button"
                  key={store}
                  className={`filter-button ${active ? 'active' : ''}`}
                  onClick={() => setSelectedStore(store)}
                  style={{
                    backgroundColor: active ? color : 'white',
                    color: active ? '#fff' : '#333',
                    borderColor: color,
                    borderWidth: 2,
                  }}
                >
                  {store}
                </button>
              );
            })}
          </div>

          <div
            className="meal-filter meal-filter--chips"
            role="toolbar"
            aria-label="Filter by camp meal"
          >
            <button
              type="button"
              className={`filter-button ${effectiveSelectedMeal === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedMeal('All')}
            >
              All Meals
            </button>
            {campMealOptions.map((opt) => {
              const active = effectiveSelectedMeal === opt.value;
              const color = getMealColor(opt.value);
              return (
                <button
                  type="button"
                  key={opt.value}
                  className={`filter-button ${active ? 'active' : ''}`}
                  onClick={() => setSelectedMeal(opt.value)}
                  style={{
                    backgroundColor: active ? color : 'white',
                    color: active ? '#fff' : '#333',
                    borderColor: color,
                    borderWidth: 2,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search items..."
          />

          <InlineAddRow onSave={handleAddItem} campMealOptions={campMealOptions} />

          <div className="shopping-list-fill">
            {filteredItems.length === 0 ? (
              <div className="shopping-list-empty" role="status">
                <div className="shopping-list-empty__card">
                  <img
                    className="shopping-list-empty__icon"
                    src="/camp-icon.svg"
                    alt=""
                    width={56}
                    height={56}
                  />
                  <p className="shopping-list-empty__message">{emptySummary()}</p>
                </div>
              </div>
            ) : (
              <div className="shopping-list-table">
                <div className="table-body">
                  {mealSections.map(({ mealKey, title, items: sectionItems }) => (
                    <section
                      key={mealKey}
                      className={`meal-section${mealKey === UNASSIGNED_MEAL_VALUE ? ' meal-section--general' : ''}`}
                    >
                      <h3 className="meal-section__title">{title}</h3>
                      <div className="meal-section__rows">
                        {sectionItems.map((item) => (
                          <EditableShoppingRow
                            key={item.id}
                            item={item}
                            menuItems={menuItems}
                            hideMealBadge
                            onToggle={handleToggleItem}
                            onDelete={handleRequestDeleteItem}
                            onSave={handleUpdateItem}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <ConfirmDeleteDialog
        open={pendingDeleteId != null}
        detail={pendingDeleteItem?.name || null}
        onCancel={closeDeleteDialog}
        onConfirm={handleConfirmDeleteItem}
      />
      <BottomNav />
    </div>
  );
};

export default ShoppingList;
