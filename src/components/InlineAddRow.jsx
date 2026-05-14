import { useState, useRef, useEffect } from 'react';
import { STORES, DEFAULT_STORE } from '../utils/constants';
import { UNASSIGNED_MEAL_VALUE } from '../utils/menuMeals';
import './InlineAddRow.css';

const InlineAddRow = ({ onSave, campMealOptions = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    store: DEFAULT_STORE,
    salad: UNASSIGNED_MEAL_VALUE,
    quantity: '',
  });

  const nameInputRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const isEmpty = !formData.name.trim() && !formData.quantity.trim();
    if (isEmpty && nameInputRef.current) {
      const timeoutId = setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.name, formData.quantity, formData.salad]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
      setFormData({
        name: '',
        store: DEFAULT_STORE,
        salad: UNASSIGNED_MEAL_VALUE,
        quantity: '',
      });
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (formData.name.trim()) {
        handleSubmit(e);
      } else if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }
    if (e.key === 'Escape') {
      if (formData.name.trim() || formData.quantity.trim()) {
        setFormData({
          name: '',
          store: DEFAULT_STORE,
          salad: UNASSIGNED_MEAL_VALUE,
          quantity: '',
        });
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }
    }
  };

  return (
    <form className="inline-add-row" onSubmit={handleSubmit} ref={formRef}>
      <div className="col-item-wide">
        <input
          ref={nameInputRef}
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add item"
          className="inline-input item-input"
          required
        />
      </div>
      <div className="col-quantity-compact col-quantity-first">
        <input
          type="text"
          value={formData.quantity}
          onChange={(e) => handleChange('quantity', e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Qty"
          className="inline-input quantity-input"
        />
      </div>
      <div className="col-store-compact">
        <select
          value={formData.store}
          onChange={(e) => handleChange('store', e.target.value)}
          className="inline-select"
          onKeyDown={handleKeyDown}
          aria-label="Store lane"
        >
          {STORES.map((store) => (
            <option key={store} value={store}>
              {store}
            </option>
          ))}
        </select>
      </div>
      <div className="col-salad-compact">
        <select
          value={formData.salad}
          onChange={(e) => handleChange('salad', e.target.value)}
          className="inline-select"
          onKeyDown={handleKeyDown}
          aria-label="Menu meal"
        >
          <option value={UNASSIGNED_MEAL_VALUE}>Unassigned</option>
          {campMealOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
};

export default InlineAddRow;
