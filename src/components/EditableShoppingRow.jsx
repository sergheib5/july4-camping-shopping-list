import { useState, useRef, useEffect } from 'react';
import { STORES, getStoreColor, AUTO_SAVE_DEBOUNCE_MS, CLICK_OUTSIDE_DELAY_MS, DEFAULT_STORE } from '../utils/constants';
import useSalads from '../hooks/useSalads';
import './EditableShoppingRow.css';

const EditableShoppingRow = ({ item, onToggle, onDelete, onSave }) => {
  const salads = useSalads();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: item.name || '',
    store: item.store || DEFAULT_STORE,
    salad: item.salad || 'General',
    quantity: item.quantity || '',
    notes: item.notes || ''
  });
  const nameInputRef = useRef(null);
  const rowRef = useRef(null);
  const editDataRef = useRef(editData);
  const saveTimeoutRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    editDataRef.current = editData;
  }, [editData]);

  // Sync editData when item changes (when not editing)
  useEffect(() => {
    if (!isEditing) {
      setEditData({
        name: item.name || '',
        store: item.store || DEFAULT_STORE,
        salad: item.salad || 'General',
        quantity: item.quantity || '',
        notes: item.notes || ''
      });
    }
  }, [item, isEditing]);

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
        store: item.store || DEFAULT_STORE,
        salad: item.salad || 'General',
        quantity: item.quantity || '',
        notes: item.notes || ''
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
      [field]: value
    };
    setEditData(newEditData);
    
    // Auto-save with debounce
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      await onSave(item.id, newEditData);
    }, AUTO_SAVE_DEBOUNCE_MS);
  };

  const handleBlur = async () => {
    // Clear any pending save and save immediately
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    // Use ref to get latest state
    await onSave(item.id, editDataRef.current);
  };

  const handleCancel = () => {
    // Clear any pending saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setEditData({
      name: item.name || '',
      store: item.store || DEFAULT_STORE,
      salad: item.salad || 'General',
      quantity: item.quantity || '',
      notes: item.notes || ''
    });
    setIsEditing(false);
  };

  // Handle click outside to cancel editing
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isEditing && rowRef.current && !rowRef.current.contains(event.target)) {
        handleCancel();
      }
    };

    if (isEditing) {
      // Use a small timeout to avoid canceling when clicking to focus an input
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, CLICK_OUTSIDE_DELAY_MS);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isEditing]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

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
          >
            {STORES.map(store => (
              <option key={store} value={store}>{store}</option>
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
          >
            <option value="General">General</option>
            {salads.map(salad => (
              <option key={salad} value={salad}>{salad}</option>
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
      className={`shopping-item-row ${item.checked ? 'checked' : ''}`}
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
          {item.name || 'Unnamed Item'}
        </span>
      </div>
      <div className="col-store col-store-hidden">
        {/* Store badge hidden in display mode - filtering available at top */}
      </div>
      <div className="col-salad">
        <span className="salad-badge">
          {item.salad || 'General'}
        </span>
      </div>
      <div className="col-quantity">
        <span>{item.quantity || '-'}</span>
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
