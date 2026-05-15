import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  STORES,
  coerceStoreFromItem,
  AUTO_SAVE_DEBOUNCE_MS,
  CLICK_OUTSIDE_DELAY_MS,
  getStoreGradient,
} from '../utils/constants';
import {
  resolveNormalizedMealKey,
  labelForMealKey,
  UNASSIGNED_MEAL_VALUE,
  buildCampMealAssignmentOptions,
} from '../utils/menuMeals';
import StoreBrandMark from './StoreBrandMark';
import QuantityDisplay from './QuantityDisplay';
import './EditableShoppingRow.css';

const mealSelectValue = (item, menuItems) => {
  const k = resolveNormalizedMealKey(item, menuItems);
  return k === UNASSIGNED_MEAL_VALUE ? UNASSIGNED_MEAL_VALUE : k;
};

const EditableShoppingRow = ({
  item,
  menuItems,
  hideMealBadge = false,
  onToggle,
  onDelete,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: item.name || '',
    store: coerceStoreFromItem(item.store),
    salad: mealSelectValue(item, menuItems),
    quantity: item.quantity || '',
    notes: item.notes || '',
  });
  const nameInputRef = useRef(null);
  const rowRef = useRef(null);
  const editDataRef = useRef(editData);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    editDataRef.current = editData;
  }, [editData]);

  const assignmentOptions = useMemo(
    () => buildCampMealAssignmentOptions(menuItems, editData.salad),
    [menuItems, editData.salad],
  );

  useEffect(() => {
    if (!isEditing) {
      setEditData({
        name: item.name || '',
        store: coerceStoreFromItem(item.store),
        salad: mealSelectValue(item, menuItems),
        quantity: item.quantity || '',
        notes: item.notes || '',
      });
    }
  }, [item, menuItems, isEditing]);

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggle(item.id, e.target.checked);
  };

  const handleRowClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      setEditData({
        name: item.name || '',
        store: coerceStoreFromItem(item.store),
        salad: mealSelectValue(item, menuItems),
        quantity: item.quantity || '',
        notes: item.notes || '',
      });
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  const handleChange = (field, value) => {
    const newEditData = {
      ...editData,
      [field]: value,
    };
    setEditData(newEditData);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      await onSave(item.id, newEditData);
    }, AUTO_SAVE_DEBOUNCE_MS);
  };

  const persistEdit = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    await onSave(item.id, editDataRef.current);
  }, [item.id, onSave]);

  const handleBlur = () => {
    void persistEdit();
  };

  const handleCancel = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    setEditData({
      name: item.name || '',
      store: coerceStoreFromItem(item.store),
      salad: mealSelectValue(item, menuItems),
      quantity: item.quantity || '',
      notes: item.notes || '',
    });
    setIsEditing(false);
  };

  const flushSaveAndClose = useCallback(async () => {
    try {
      await persistEdit();
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  }, [persistEdit]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isEditing && rowRef.current && !rowRef.current.contains(event.target)) {
        void flushSaveAndClose();
      }
    };

    if (isEditing) {
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, CLICK_OUTSIDE_DELAY_MS);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isEditing, flushSaveAndClose]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const badgeLabel = labelForMealKey(
    resolveNormalizedMealKey(item, menuItems),
    menuItems,
  );

  const storeLabel = coerceStoreFromItem(item.store);

  if (isEditing) {
    return (
      <div
        ref={rowRef}
        className="shopping-item-row editing"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="col-checkbox">
          <input
            type="checkbox"
            checked={item.checked || false}
            onChange={handleToggle}
            className="item-checkbox"
            disabled
          />
        </div>
        <div className="col-item">
          <input
            ref={nameInputRef}
            type="text"
            value={editData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="inline-input"
          />
        </div>
        <div className="col-store">
          <select
            value={editData.store}
            onChange={(e) => handleChange('store', e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="inline-select"
            aria-label="Store lane"
          >
            {STORES.map((store) => (
              <option key={store} value={store}>
                {store}
              </option>
            ))}
          </select>
        </div>
        <div className="col-salad">
          <select
            value={editData.salad}
            onChange={(e) => handleChange('salad', e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="inline-select"
            aria-label="Menu meal"
          >
            <option value={UNASSIGNED_MEAL_VALUE}>{UNASSIGNED_MEAL_VALUE}</option>
            {assignmentOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-quantity">
          <input
            type="text"
            value={editData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="inline-input"
          />
        </div>
        <div className="col-notes">
          <input
            type="text"
            value={editData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="inline-input"
            aria-label="Notes"
            placeholder="Notes (optional)"
          />
        </div>
        <div className="col-actions">
          <button
            className="cancel-button"
            onClick={handleDelete}
            aria-label="Delete item"
            title="Delete item"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rowRef}
      className={`shopping-item-row ${item.checked ? 'checked' : ''} ${hideMealBadge ? 'shopping-item-row--meal-grouped' : ''}`}
      onClick={handleRowClick}
    >
      <div className="col-checkbox" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={item.checked || false}
          onChange={handleToggle}
          className="item-checkbox"
        />
      </div>
      <div className="col-item">
        <span className={item.checked ? 'strikethrough' : ''}>
          <strong className="col-item__name">{item.name || 'Unnamed Item'}</strong>
        </span>
      </div>
      <div className="col-store">
        <span
          className="store-badge"
          style={{ background: getStoreGradient(item.store) }}
          title={storeLabel}
        >
          <StoreBrandMark store={item.store} />
          <span className="store-badge__label">{storeLabel}</span>
        </span>
      </div>
      <div
        className={`col-salad ${hideMealBadge ? 'col-salad--hidden' : ''}`}
        aria-hidden={hideMealBadge || undefined}
      >
        {!hideMealBadge ? (
          <span
            className={`salad-badge${badgeLabel === UNASSIGNED_MEAL_VALUE ? ' salad-badge--general' : ''}`}
          >
            {badgeLabel}
          </span>
        ) : null}
      </div>
      <div className="col-quantity">
        <QuantityDisplay quantity={item.quantity} />
      </div>
      <div className="col-notes">
        <span className="notes-text">{item.notes || ''}</span>
      </div>
      <div className="col-actions" onClick={(e) => e.stopPropagation()}>
        <button
          className="cancel-button"
          onClick={handleDelete}
          aria-label="Delete item"
          title="Delete item"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default EditableShoppingRow;
