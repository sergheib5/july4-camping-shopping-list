import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditableShoppingRow from './EditableShoppingRow';

// Mock useSalads hook
vi.mock('../hooks/useSalads', () => ({
  default: () => ['Caesar Salad', 'Greek Salad', 'Cobb Salad']
}));

describe('EditableShoppingRow', () => {
  const mockItem = {
    id: '1',
    name: 'Test Item',
    store: 'Cooler & drinks',
    salad: 'Caesar Salad',
    quantity: '2 lbs',
    notes: 'Test notes',
    checked: false
  };

  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render item in display mode initially', () => {
    render(
      <EditableShoppingRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Test Item')).not.toBeInTheDocument();
  });

  it('should switch to edit mode when clicked', () => {
    render(
      <EditableShoppingRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onSave={mockOnSave}
      />
    );

    const row = screen.getByText('Test Item').closest('.shopping-item-row');
    fireEvent.click(row);

    expect(screen.getByDisplayValue('Test Item')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Cooler & drinks')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Caesar Salad')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2 lbs')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test notes')).toBeInTheDocument();
  });

  it('should call onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(
      <EditableShoppingRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onSave={mockOnSave}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith('1', true);
  });

  it('should call onSave when input is blurred', async () => {
    render(
      <EditableShoppingRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onSave={mockOnSave}
      />
    );

    const row = screen.getByText('Test Item').closest('.shopping-item-row');
    fireEvent.click(row);

    const nameInput = screen.getByDisplayValue('Test Item');
    fireEvent.change(nameInput, { target: { value: 'Updated Item' } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('should auto-save after debounce delay', async () => {
    vi.useFakeTimers();
    try {
      render(
        <EditableShoppingRow
          item={mockItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onSave={mockOnSave}
        />
      );

      const row = screen.getByText('Test Item').closest('.shopping-item-row');
      fireEvent.click(row);

      const nameInput = screen.getByDisplayValue('Test Item');
      fireEvent.change(nameInput, { target: { value: 'Updated Item' } });

      // Fast-forward timers
      await vi.advanceTimersByTimeAsync(500);

      expect(mockOnSave).toHaveBeenCalledWith('1', expect.objectContaining({
        name: 'Updated Item'
      }));
    } finally {
      vi.useRealTimers();
    }
  });

  it('should cancel editing when Escape key is pressed', () => {
    render(
      <EditableShoppingRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onSave={mockOnSave}
      />
    );

    const row = screen.getByText('Test Item').closest('.shopping-item-row');
    fireEvent.click(row);

    const nameInput = screen.getByDisplayValue('Test Item');
    fireEvent.change(nameInput, { target: { value: 'Updated' } });
    fireEvent.keyDown(nameInput, { key: 'Escape', code: 'Escape' });

    expect(screen.queryByDisplayValue('Updated')).not.toBeInTheDocument();
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <EditableShoppingRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onSave={mockOnSave}
      />
    );

    const deleteButton = screen.getByLabelText('Delete item');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should update store when select is changed', () => {
    render(
      <EditableShoppingRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onSave={mockOnSave}
      />
    );

    const row = screen.getByText('Test Item').closest('.shopping-item-row');
    fireEvent.click(row);

    const storeSelect = screen.getByDisplayValue('Cooler & drinks');
    fireEvent.change(storeSelect, { target: { value: 'Grill & foil' } });

    expect(storeSelect.value).toBe('Grill & foil');
  });

  it('should show strikethrough when item is checked', () => {
    const checkedItem = { ...mockItem, checked: true };
    render(
      <EditableShoppingRow
        item={checkedItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onSave={mockOnSave}
      />
    );

    const itemName = screen.getByText('Test Item');
    expect(itemName).toHaveClass('strikethrough');
  });

  it('should handle missing item fields', () => {
    const incompleteItem = {
      id: '2',
      name: '',
      store: '',
      salad: '',
      quantity: '',
      notes: '',
      checked: false
    };

    render(
      <EditableShoppingRow
        item={incompleteItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Unnamed Item')).toBeInTheDocument();
  });

  it('should display salad badge in view mode', () => {
    render(
      <EditableShoppingRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
  });

  it('should display General when salad is missing', () => {
    const itemWithoutSalad = { ...mockItem, salad: undefined };
    render(
      <EditableShoppingRow
        item={itemWithoutSalad}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('should update salad when select is changed', async () => {
    vi.useFakeTimers();
    try {
      render(
        <EditableShoppingRow
          item={mockItem}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onSave={mockOnSave}
        />
      );

      const row = screen.getByText('Test Item').closest('.shopping-item-row');
      fireEvent.click(row);

      const saladSelect = screen.getByDisplayValue('Caesar Salad');
      fireEvent.change(saladSelect, { target: { value: 'Greek Salad' } });

      expect(saladSelect.value).toBe('Greek Salad');

      // Fast-forward timers to trigger auto-save
      await vi.advanceTimersByTimeAsync(500);

      expect(mockOnSave).toHaveBeenCalledWith('1', expect.objectContaining({
        salad: 'Greek Salad'
      }));
    } finally {
      vi.useRealTimers();
    }
  });

  it('should include salad in save data when blurred', async () => {
    render(
      <EditableShoppingRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onSave={mockOnSave}
      />
    );

    const row = screen.getByText('Test Item').closest('.shopping-item-row');
    fireEvent.click(row);

    const saladSelect = screen.getByDisplayValue('Caesar Salad');
    fireEvent.change(saladSelect, { target: { value: 'Cobb Salad' } });
    fireEvent.blur(saladSelect);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('1', expect.objectContaining({
        salad: 'Cobb Salad'
      }));
    });
  });

  it('should reset salad to original value when Escape is pressed', () => {
    render(
      <EditableShoppingRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onSave={mockOnSave}
      />
    );

    const row = screen.getByText('Test Item').closest('.shopping-item-row');
    fireEvent.click(row);

    const saladSelect = screen.getByDisplayValue('Caesar Salad');
    fireEvent.change(saladSelect, { target: { value: 'Greek Salad' } });
    fireEvent.keyDown(saladSelect, { key: 'Escape', code: 'Escape' });

    // Should show original salad value
    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
  });

  it('should show salad dropdown options in edit mode', () => {
    render(
      <EditableShoppingRow
        item={mockItem}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onSave={mockOnSave}
      />
    );

    const row = screen.getByText('Test Item').closest('.shopping-item-row');
    fireEvent.click(row);

    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
    expect(screen.getByText('Greek Salad')).toBeInTheDocument();
    expect(screen.getByText('Cobb Salad')).toBeInTheDocument();
  });
});
