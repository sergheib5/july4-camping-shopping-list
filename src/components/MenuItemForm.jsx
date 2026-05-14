import { useState, useEffect } from 'react';
import './MenuItemForm.css';

const MenuItemForm = ({ item, type, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: type || 'daily',
    date: '',
    lunch: '',
    dinner: '',
    name: '',
    preparedBy: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        type: item.type || type || 'daily',
        date: item.date || '',
        lunch: item.lunch || '',
        dinner: item.dinner || '',
        name: item.name || '',
        preparedBy: item.preparedBy || ''
      });
    } else {
      setFormData({
        type: type || 'daily',
        date: '',
        lunch: '',
        dinner: '',
        name: '',
        preparedBy: ''
      });
    }
  }, [item, type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataToSave = { ...formData };
      
      // Ensure type is always set
      if (!dataToSave.type) {
        dataToSave.type = type || 'daily';
      }
      
      // Remove empty fields based on type
      if (dataToSave.type === 'daily') {
        delete dataToSave.name;
        delete dataToSave.preparedBy;
      } else if (dataToSave.type === 'salad') {
        delete dataToSave.date;
        delete dataToSave.lunch;
        delete dataToSave.dinner;
      } else if (dataToSave.type === 'snack') {
        delete dataToSave.date;
        delete dataToSave.lunch;
        delete dataToSave.dinner;
        delete dataToSave.preparedBy;
      } else if (dataToSave.type === 'drink') {
        delete dataToSave.date;
        delete dataToSave.lunch;
        delete dataToSave.dinner;
        delete dataToSave.preparedBy;
      }

      console.log('Saving menu item:', { dataToSave, itemId: item?.id });
      await onSave(dataToSave, item?.id);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error saving menu item:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        itemData: formData
      });
      alert(`Failed to save item: ${error.message || 'Please try again.'}`);
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

  const getFormTitle = () => {
    if (item) return 'Edit menu item';
    if (type === 'daily') return 'Add daily cook row';
    if (type === 'salad') return 'Add camp meal';
    if (type === 'snack') return 'Add Snack';
    if (type === 'drink') return 'Add Drink';
    return 'Add Menu Item';
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <h2 className="form-title">{getFormTitle()}</h2>
        <form onSubmit={handleSubmit} className="menu-item-form">
          {type === 'daily' && (
            <>
              <div className="form-group">
                <label htmlFor="date">Date *</label>
                <input
                  type="text"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Dec 30, Jan 1"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="lunch">Lunch</label>
                <input
                  type="text"
                  id="lunch"
                  name="lunch"
                  value={formData.lunch}
                  onChange={handleChange}
                  placeholder="Enter lunch menu"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="dinner">Dinner</label>
                <input
                  type="text"
                  id="dinner"
                  name="dinner"
                  value={formData.dinner}
                  onChange={handleChange}
                  placeholder="Enter dinner menu"
                  className="form-input"
                />
              </div>
            </>
          )}

          {type === 'salad' && (
            <>
              <div className="form-group">
                <label htmlFor="name">Meal name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., foil-pack fajitas, Dutch-oven chili"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="preparedBy">Lead / prep</label>
                <input
                  type="text"
                  id="preparedBy"
                  name="preparedBy"
                  value={formData.preparedBy}
                  onChange={handleChange}
                  placeholder="Enter name"
                  className="form-input"
                />
              </div>
            </>
          )}

          {type === 'snack' && (
            <div className="form-group">
              <label htmlFor="name">Snack Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter snack name"
                className="form-input"
              />
            </div>
          )}

          {type === 'drink' && (
            <div className="form-group">
              <label htmlFor="name">Drink Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter drink name"
                className="form-input"
              />
            </div>
          )}

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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : item ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemForm;

