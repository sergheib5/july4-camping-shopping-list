import { useState } from 'react';
import './SearchField.css';

const SearchField = ({ value, onChange, placeholder = 'Search items...' }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`search-field-container ${isFocused ? 'focused' : ''}`}>
      <span className="search-icon">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="search-input"
      />
      {value && (
        <button
          className="search-clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchField;
