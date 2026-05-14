import { useState, useEffect } from 'react';
import useSalads from '../hooks/useSalads';
import { STORES, DEFAULT_STORE } from '../utils/constants';
import './ShoppingItemForm.css';

const ShoppingItemForm = ({ item, onSave, onCancel }) => {
  const salads = useSalads();
  const [formData, setFormData] = useState({
    name: '',
    store: DEFAULT_STORE,
    salad: 'General',
    quantity: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        store: item.store || DEFAULT_STORE,
        salad: item.salad || 'General',
        quantity: item.quantity || '',
        notes: item.notes || ''
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // onSave handles both add and update
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
    setFormData(prev => ({
      ...prev,
      [name]: value
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
              {STORES.map(store => (
                <option key={store} value={store}>{store}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="salad">Camp meal</label>
            <select
              id="salad"
              name="salad"
              value={formData.salad}
              onChange={handleChange}
              className="form-select"
            >
              <option value="General">General</option>
              {salads.map(salad => (
                <option key={salad} value={salad}>{salad}</option>
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

