import './FloatingAddButton.css';

const FloatingAddButton = ({ onClick, isVisible }) => {
  if (!isVisible) {
    return (
      <button 
        className="floating-add-button"
        onClick={onClick}
        aria-label="Add item"
      >
        <span className="plus-icon">+</span>
      </button>
    );
  }
  return null;
};

export default FloatingAddButton;


