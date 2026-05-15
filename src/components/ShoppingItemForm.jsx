import { useState, useEffect, useMemo } from 'react';
import useMenuMeals from '../hooks/useMenuMeals';
import { STORES, DEFAULT_STORE } from '../utils/constants';
import {
  resolveNormalizedMealKey,
  UNASSIGNED_MEAL_VALUE,
  buildCampMealAssignmentOptions,
} from '../utils/menuMeals';
import './ShoppingItemForm.css';

const mealSelectValue = (item, menuItems) => {
  if (!item) return UNASSIGNED_MEAL_VALUE;
  const k = resolveNormalizedMealKey(item, menuItems);
  return k === UNASSIGNED_MEAL_VALUE ? UNASSIGNED_MEAL_VALUE : k;
};

const ShoppingItemForm = ({ item, onSave, onCancel }) => {
  const { menuItems } = useMenuMeals();
  const [formData, setFormData] = useState({
    name: '',
    store: DEFAULT_STORE,
    salad: UNASSIGNED_MEAL_VALUE,
    quantity: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const assignmentOptions = useMemo(
    () => buildCampMealAssignmentOptions(menuItems, formData.salad),
    [menuItems, formData.salad],
  );

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        store: item.store || DEFAULT_STORE,
        salad: mealSelectValue(item, menuItems),
        quantity: item.quantity || '',
        notes: item.notes || '',
      });
    } else {
      setFormData({
        name: '',
        store: DEFAULT_STORE,
        salad: UNASSIGNED_MEAL_VALUE,
        quantity: '',
        notes: '',
      });
    }
  }, [item, menuItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave(formData, item?.id);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <h2 className="form-title">{item ? 'Edit Item' : 'Add Shopping Item'}</h2>
        <form onSubmit={handleSubmit} className="shopping-item-form">
          <div className="form-group">
            <label htmlFor="name">Item Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter item name"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="store">Store</label>
            <select
              id="store"
              name="store"
              value={formData.store}
              onChange={handleChange}
              className="form-select"
            >
              {STORES.map((store) => (
                <option key={store} value={store}>
                  {store}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="salad">Menu meal</label>
            <select
              id="salad"
              name="salad"
              value={formData.salad}
              onChange={handleChange}
              className="form-select"
            >
              <option value={UNASSIGNED_MEAL_VALUE}>{UNASSIGNED_MEAL_VALUE}</option>
              {assignmentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="text"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g., 1 bag, 15 lb"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any additional notes..."
              rows="3"
              className="form-textarea"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={isSubmitting || !formData.name.trim()}
            >
              {isSubmitting ? 'Saving...' : item ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShoppingItemForm;
