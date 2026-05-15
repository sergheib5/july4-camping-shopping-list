import { useState } from 'react';
import { getStoreGradient, coerceStoreFromItem } from '../utils/constants';
import StoreBrandMark from './StoreBrandMark';
import QuantityDisplay from './QuantityDisplay';
import './ShoppingItemRow.css';

const ShoppingItemRow = ({ item, onToggle, onDelete, onEdit }) => {
  const [isHovered, setIsHovered] = useState(false);
  const storeLabel =
    item.store != null && String(item.store).trim() !== ''
      ? coerceStoreFromItem(item.store)
      : 'Other';

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
      <div className="col-quantity">
        <QuantityDisplay quantity={item.quantity} />
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


