import { useState } from 'react';
import './ShoppingItemRow.css';

const ShoppingItemRow = ({ item, onToggle, onDelete, onEdit }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleCheckboxChange = (e) => {
    onToggle(item.id, e.target.checked);
  };

  return (
    <div 
      className={`shopping-item-row ${item.checked ? 'checked' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="col-checkbox">
        <input
          type="checkbox"
          checked={item.checked || false}
          onChange={handleCheckboxChange}
          className="item-checkbox"
        />
      </div>
      <div className="col-item" onClick={() => onEdit(item)}>
        <span className={item.checked ? 'strikethrough' : ''}>
          {item.name || 'Unnamed Item'}
        </span>
      </div>
      <div className="col-store">
        <span className="store-badge">{item.store || 'Other'}</span>
      </div>
      <div className="col-quantity">
        <span>{item.quantity || '-'}</span>
      </div>
      <div className="col-notes">
        <span className="notes-text">{item.notes || ''}</span>
      </div>
      <div className="col-actions">
        {isHovered && (
          <button
            className="delete-button"
            onClick={() => onDelete(item.id)}
            aria-label="Delete item"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};

export default ShoppingItemRow;


