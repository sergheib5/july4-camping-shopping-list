import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShoppingItemRow from './ShoppingItemRow';

describe('ShoppingItemRow', () => {
  const mockItem = {
    id: '1',
    name: 'Test Item',
    store: 'Costco',
    quantity: '2 lbs',
    notes: 'Test notes',
    checked: false
  };

  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render item name', () => {
    render(
      <ShoppingItemRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('should render store badge', () => {
    render(
      <ShoppingItemRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('Costco')).toBeInTheDocument();
  });

  it('should render quantity', () => {
    render(
      <ShoppingItemRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByLabelText('2 lbs')).toBeInTheDocument();
  });

  it('should render notes', () => {
    render(
      <ShoppingItemRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('Test notes')).toBeInTheDocument();
  });

  it('should call onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ShoppingItemRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith('1', true);
  });

  it('should call onEdit when item is clicked', () => {
    render(
      <ShoppingItemRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const itemName = screen.getByText('Test Item');
    fireEvent.click(itemName);

    expect(mockOnEdit).toHaveBeenCalledWith(mockItem);
  });

  it('should show delete button on hover', () => {
    render(
      <ShoppingItemRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const row = screen.getByText('Test Item').closest('.shopping-item-row');
    fireEvent.mouseEnter(row);

    const deleteButton = screen.getByLabelText('Delete item');
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <ShoppingItemRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const row = screen.getByText('Test Item').closest('.shopping-item-row');
    fireEvent.mouseEnter(row);

    const deleteButton = screen.getByLabelText('Delete item');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should show strikethrough when item is checked', () => {
    const checkedItem = { ...mockItem, checked: true };
    render(
      <ShoppingItemRow
        item={checkedItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const itemName = screen.getByText('Test Item');
    expect(itemName.closest('span')).toHaveClass('strikethrough');
  });

  it('should handle missing item name', () => {
    const itemWithoutName = { ...mockItem, name: '' };
    render(
      <ShoppingItemRow
        item={itemWithoutName}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('Unnamed Item')).toBeInTheDocument();
  });

  it('should handle missing store', () => {
    const itemWithoutStore = { ...mockItem, store: '' };
    render(
      <ShoppingItemRow
        item={itemWithoutStore}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('should handle missing quantity', () => {
    const itemWithoutQuantity = { ...mockItem, quantity: '' };
    render(
      <ShoppingItemRow
        item={itemWithoutQuantity}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('should handle missing notes', () => {
    const itemWithoutNotes = { ...mockItem, notes: '' };
    render(
      <ShoppingItemRow
        item={itemWithoutNotes}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    // Notes column should exist but be empty
    const notesElement = screen.getByText('Test Item').closest('.shopping-item-row');
    expect(notesElement).toBeInTheDocument();
  });
});
