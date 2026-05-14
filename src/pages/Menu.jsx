import { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import MenuItemForm from '../components/MenuItemForm';
import { 
  subscribeToMenu, 
  addMenuItem,
  updateMenuItem,
  deleteMenuItem 
} from '../firebase/db';
import './Menu.css';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formType, setFormType] = useState('daily'); // 'daily', 'salad', 'snack', 'drink'

  useEffect(() => {
    const unsubscribe = subscribeToMenu((items) => {
      setMenuItems(items);
    });

    return () => unsubscribe();
  }, []);

  const handleAddItem = async (itemData, itemId) => {
    try {
      console.log('Menu handleAddItem:', { itemData, itemId });
      
      if (itemId) {
        console.log('Updating menu item:', itemId);
        await updateMenuItem(itemId, itemData);
      } else {
        console.log('Adding new menu item');
        await addMenuItem(itemData);
      }
      
      setShowForm(false);
      setEditingItem(null);
      setFormType('daily');
    } catch (error) {
      console.error('Error saving menu item:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        itemData,
        itemId
      });
      alert(`Failed to save item: ${error.message || 'Please try again.'}`);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMenuItem(id);
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormType(item.type || 'daily');
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormType('daily');
  };

  const handleAddNew = (type) => {
    setFormType(type);
    setEditingItem(null);
    setShowForm(true);
  };

  // Group items by type
  const dailyMenuItems = menuItems.filter(item => item.type === 'daily');
  const saladItems = menuItems.filter(item => item.type === 'salad');
  const snackItems = menuItems.filter(item => item.type === 'snack');
  const drinkItems = menuItems.filter(item => item.type === 'drink');

  return (
    <div className="menu-page">
      <Header />
      <main className="main-content">
        <div className="menu-container">
          {/* Daily Menu Section */}
          <section className="menu-section">
            <div className="section-header">
              <h2>📅 Daily cook plan</h2>
              <button 
                className="add-section-button"
                onClick={() => handleAddNew('daily')}
              >
                + Add
              </button>
            </div>
            {dailyMenuItems.length === 0 ? (
              <div className="empty-section">No daily cook plan rows yet</div>
            ) : (
              <div className="daily-menu-table">
                <div className="table-header">
                  <div className="col-date">Date</div>
                  <div className="col-lunch">Lunch</div>
                  <div className="col-dinner">Dinner</div>
                  <div className="col-actions"></div>
                </div>
                <div className="table-body">
                  {dailyMenuItems.map((item) => (
                    <div key={item.id} className="menu-row" onClick={() => handleEditItem(item)}>
                      <div className="col-date">{item.date || '-'}</div>
                      <div className="col-lunch">{item.lunch || '-'}</div>
                      <div className="col-dinner">{item.dinner || '-'}</div>
                      <div className="col-actions">
                        <button
                          className="cancel-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id);
                          }}
                          aria-label="Delete item"
                          title="Delete item"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Camp meals — stored as type "salad" in Firestore for schema parity */}
          <section className="menu-section">
            <div className="section-header">
              <h2>🔥 Camp meals</h2>
              <button 
                className="add-section-button"
                onClick={() => handleAddNew('salad')}
              >
                + Add
              </button>
            </div>
            {saladItems.length === 0 ? (
              <div className="empty-section">No camp meals yet</div>
            ) : (
              <div className="salads-table">
                <div className="table-header">
                  <div className="col-salad">Meal</div>
                  <div className="col-prepared">Lead / prep</div>
                  <div className="col-actions"></div>
                </div>
                <div className="table-body">
                  {saladItems.map((item) => (
                    <div key={item.id} className="menu-row" onClick={() => handleEditItem(item)}>
                      <div className="col-salad">{item.name || '-'}</div>
                      <div className="col-prepared">{item.preparedBy || '-'}</div>
                      <div className="col-actions">
                        <button
                          className="cancel-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id);
                          }}
                          aria-label="Delete item"
                          title="Delete item"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Snacks Section */}
          <section className="menu-section">
            <div className="section-header">
              <h2>🍿 Snacks</h2>
              <button 
                className="add-section-button"
                onClick={() => handleAddNew('snack')}
              >
                + Add
              </button>
            </div>
            {snackItems.length === 0 ? (
              <div className="empty-section">No snacks yet</div>
            ) : (
              <div className="snacks-list">
                {snackItems.map((item) => (
                  <div key={item.id} className="snack-item" onClick={() => handleEditItem(item)}>
                    <span>{item.name || '-'}</span>
                    <button
                      className="cancel-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      aria-label="Delete item"
                      title="Delete item"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Drinks Section */}
          <section className="menu-section">
            <div className="section-header">
              <h2>🥤 Drinks</h2>
              <button 
                className="add-section-button"
                onClick={() => handleAddNew('drink')}
              >
                + Add
              </button>
            </div>
            {drinkItems.length === 0 ? (
              <div className="empty-section">No drinks yet</div>
            ) : (
              <div className="snacks-list">
                {drinkItems.map((item) => (
                  <div key={item.id} className="snack-item" onClick={() => handleEditItem(item)}>
                    <span>{item.name || '-'}</span>
                    <button
                      className="cancel-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      aria-label="Delete item"
                      title="Delete item"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {showForm && (
          <MenuItemForm
            item={editingItem}
            type={formType}
            onSave={handleAddItem}
            onCancel={handleCloseForm}
          />
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Menu;

