import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShoppingItemForm from './ShoppingItemForm';

// Mock useSalads hook
vi.mock('../hooks/useSalads', () => ({
  default: () => ['Caesar Salad', 'Greek Salad', 'Cobb Salad']
}));

describe('ShoppingItemForm', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Add mode', () => {
    it('should render form with default values', () => {
      render(<ShoppingItemForm onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByText('Add Shopping Item')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Cooler & drinks')).toBeInTheDocument();
      expect(screen.getByDisplayValue('General')).toBeInTheDocument();
    });

    it('should have General as default salad value', () => {
      render(<ShoppingItemForm onSave={mockOnSave} onCancel={mockOnCancel} />);

      const saladSelect = screen.getByDisplayValue('General');
      expect(saladSelect).toBeInTheDocument();
    });

    it('should include salad options from useSalads hook', () => {
      render(<ShoppingItemForm onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
      expect(screen.getByText('Greek Salad')).toBeInTheDocument();
      expect(screen.getByText('Cobb Salad')).toBeInTheDocument();
    });

    it('should call onSave with salad field when form is submitted', async () => {
      const user = userEvent.setup();
      render(<ShoppingItemForm onSave={mockOnSave} onCancel={mockOnCancel} />);

      const nameInput = screen.getByPlaceholderText('Enter item name');
      const saladSelect = screen.getByLabelText('Camp meal');

      await user.type(nameInput, 'Lettuce');
      await user.selectOptions(saladSelect, 'Caesar Salad');

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Lettuce',
            store: 'Cooler & drinks',
            salad: 'Caesar Salad',
            quantity: '',
            notes: ''
          }),
          undefined
        );
      });
    });

    it('should include salad in form submission', async () => {
      const user = userEvent.setup();
      render(<ShoppingItemForm onSave={mockOnSave} onCancel={mockOnCancel} />);

      const nameInput = screen.getByPlaceholderText('Enter item name');
      const saladSelect = screen.getByLabelText('Camp meal');
      const quantityInput = screen.getByPlaceholderText('e.g., 1 bag, 15 lb');

      await user.type(nameInput, 'Tomatoes');
      await user.selectOptions(saladSelect, 'Greek Salad');
      await user.type(quantityInput, '2 lbs');

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Tomatoes',
            store: 'Cooler & drinks',
            salad: 'Greek Salad',
            quantity: '2 lbs',
            notes: ''
          }),
          undefined
        );
      });
    });
  });

  describe('Edit mode', () => {
    const mockItem = {
      id: '1',
      name: 'Test Item',
      store: 'Grill & foil',
      salad: 'Caesar Salad',
      quantity: '3 lbs',
      notes: 'Test notes'
    };

    it('should populate form with item data including salad', () => {
      render(
        <ShoppingItemForm
          item={mockItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Edit Item')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Item')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Grill & foil')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Caesar Salad')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3 lbs')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test notes')).toBeInTheDocument();
    });

    it('should update salad when changed', async () => {
      const user = userEvent.setup();
      render(
        <ShoppingItemForm
          item={mockItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saladSelect = screen.getByDisplayValue('Caesar Salad');
      await user.selectOptions(saladSelect, 'Cobb Salad');

      const updateButton = screen.getByText('Update');
      await user.click(updateButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            salad: 'Cobb Salad'
          }),
          '1'
        );
      });
    });

    it('should default to General when item has no salad', () => {
      const itemWithoutSalad = { ...mockItem, salad: undefined };
      render(
        <ShoppingItemForm
          item={itemWithoutSalad}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByDisplayValue('General')).toBeInTheDocument();
    });

    it('should call onSave with updated salad', async () => {
      const user = userEvent.setup();
      render(
        <ShoppingItemForm
          item={mockItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      );

      const saladSelect = screen.getByDisplayValue('Caesar Salad');
      await user.selectOptions(saladSelect, 'Greek Salad');

      const updateButton = screen.getByText('Update');
      await user.click(updateButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Item',
            store: 'Grill & foil',
            salad: 'Greek Salad',
            quantity: '3 lbs',
            notes: 'Test notes'
          }),
          '1'
        );
      });
    });
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ShoppingItemForm onSave={mockOnSave} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should disable save button when name is empty', () => {
    render(<ShoppingItemForm onSave={mockOnSave} onCancel={mockOnCancel} />);

    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();
  });

  it('should enable save button when name is filled', async () => {
    const user = userEvent.setup();
    render(<ShoppingItemForm onSave={mockOnSave} onCancel={mockOnCancel} />);

    const nameInput = screen.getByPlaceholderText('Enter item name');
    await user.type(nameInput, 'Test Item');

    const saveButton = screen.getByText('Save');
    expect(saveButton).not.toBeDisabled();
  });
});
