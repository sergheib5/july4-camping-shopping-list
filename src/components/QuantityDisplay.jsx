import { parseQuantityForDisplay } from '../utils/quantityDisplay';
import './QuantityDisplay.css';

const QuantityDisplay = ({ quantity, className = '' }) => {
  const parsed = parseQuantityForDisplay(quantity);
  const rootClass = ['quantity-display', className].filter(Boolean).join(' ');

  if (parsed.empty) {
    return (
      <span className={`${rootClass} quantity-display--empty`} aria-label="No quantity">
        <span className="quantity-display__amount">-</span>
        <span
          className="quantity-display__unit quantity-display__unit--placeholder"
          aria-hidden
        >
          {'\u00a0'}
        </span>
      </span>
    );
  }

  if (parsed.text) {
    return <span className={rootClass}>{parsed.text}</span>;
  }

  const label = parsed.unit ? `${parsed.amount} ${parsed.unit}` : parsed.amount;

  return (
    <span className={rootClass} aria-label={label}>
      <span className="quantity-display__amount">{parsed.amount}</span>
      <span
        className={
          parsed.unit
            ? 'quantity-display__unit'
            : 'quantity-display__unit quantity-display__unit--placeholder'
        }
        aria-hidden={!parsed.unit}
      >
        {parsed.unit || '\u00a0'}
      </span>
    </span>
  );
};

export default QuantityDisplay;
