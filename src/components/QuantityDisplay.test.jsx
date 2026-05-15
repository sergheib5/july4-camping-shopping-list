import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuantityDisplay from './QuantityDisplay';

describe('QuantityDisplay', () => {
  it('renders dash when empty', () => {
    render(<QuantityDisplay quantity="" />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders amount above unit in a stacked layout', () => {
    const { container } = render(<QuantityDisplay quantity="4 pack" />);
    const root = screen.getByLabelText('4 pack');
    expect(container.querySelector('.quantity-display__unit--placeholder')).toBeNull();
    expect(container.querySelector('.quantity-display__amount')).toHaveTextContent('4');
    expect(container.querySelector('.quantity-display__unit')).toHaveTextContent('pack');
    const amount = container.querySelector('.quantity-display__amount');
    const unit = container.querySelector('.quantity-display__unit');
    expect(amount.compareDocumentPosition(unit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('reserves unit row for bare numbers so digits align with split quantities', () => {
    const { container } = render(<QuantityDisplay quantity="18" />);
    expect(screen.getByLabelText('18')).toBeInTheDocument();
    const unit = container.querySelector('.quantity-display__unit');
    expect(unit).toHaveClass('quantity-display__unit--placeholder');
  });
});
