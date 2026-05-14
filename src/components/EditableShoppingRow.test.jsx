import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditableShoppingRow from './EditableShoppingRow';
import { AUTO_SAVE_DEBOUNCE_MS, CLICK_OUTSIDE_DELAY_MS } from '../utils/constants';

const menuItems = [
  { id: 'd1', type: 'daily', date: 'July 3', lunch: 'Tacos', dinner: 'Chicken' },
  { id: 's1', type: 'salad', name: 'Caesar Salad' },
  { id: 'k1', type: 'snack', name: 'Chips' },
];

describe('EditableShoppingRow', () => {
  const mockItem = {
    id: '1',
    name: 'Test Item',
    store: 'Fresh Farm',
    salad: 's1',
    quantity: '2 lbs',
    notes: 'Test notes',
    checked: false,
  };

  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnSave = vi.fn();

  const renderRow = (item = mockItem) =>
    render(
      <EditableShoppingRow
        item={item}
        menuItems={menuItems}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
        onSave={mockOnSave}
      />,
    );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render item in display mode initially', () => {
    renderRow();
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
  });

  it('should switch to edit mode when clicked', () => {
    renderRow();
    const row = screen.getByText('Test Item').closest('.shopping-item-row');
    fireEvent.click(row);

    expect(screen.getByDisplayValue('Test Item')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Fresh Farm')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Caesar Salad')).toBeInTheDocument();
  });

  it('should call onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup();
    renderRow();
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    expect(mockOnToggle).toHaveBeenCalledWith('1', true);
  });

  it('should display Unassigned when salad is missing', () => {
    renderRow({ ...mockItem, salad: undefined });
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('should map legacy salad name to menu label', () => {
    renderRow({ ...mockItem, salad: 'Caesar Salad' });
    expect(screen.getByText('Caesar Salad')).toBeInTheDocument();
  });

  it('should update store when select is changed', () => {
    renderRow();
    fireEvent.click(screen.getByText('Test Item').closest('.shopping-item-row'));

    const storeSelect = screen.getByLabelText('Store lane');
    fireEvent.change(storeSelect, { target: { value: 'Aldi' } });

    expect(storeSelect.value).toBe('Aldi');
  });

  it('should call onSave when input is blurred', async () => {
    renderRow();
    fireEvent.click(screen.getByText('Test Item').closest('.shopping-item-row'));
    const nameInput = screen.getByDisplayValue('Test Item');
    fireEvent.change(nameInput, { target: { value: 'Updated Item' } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('meal select lists only camp meals; non-camp tag appears as a single extra option', () => {
    renderRow({ ...mockItem, salad: 'd1|lunch' });
    fireEvent.click(screen.getByText('Test Item').closest('.shopping-item-row'));
    const mealSelect = screen.getByLabelText('Menu meal');
    const optionTexts = [...mealSelect.querySelectorAll('option')].map((o) => o.textContent);
    expect(optionTexts.some((t) => t.includes('Caesar'))).toBe(true);
    expect(optionTexts.some((t) => t.includes('Chips'))).toBe(false);
    expect(optionTexts.some((t) => t.includes('Tacos'))).toBe(true);
    expect(mealSelect.value).toBe('d1|lunch');
  });

  it('debounces autosave until debounce delay elapses', async () => {
    vi.useFakeTimers();
    mockOnSave.mockResolvedValue(undefined);
    renderRow();
    fireEvent.click(screen.getByText('Test Item').closest('.shopping-item-row'));
    mockOnSave.mockClear();
    const nameInput = screen.getByDisplayValue('Test Item');
    fireEvent.change(nameInput, { target: { value: 'Debounced' } });
    expect(mockOnSave).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(AUTO_SAVE_DEBOUNCE_MS - 1);
    expect(mockOnSave).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ name: 'Debounced' }),
    );
  });

  it('Escape reverts edits and does not autosave', () => {
    renderRow();
    fireEvent.click(screen.getByText('Test Item').closest('.shopping-item-row'));
    const nameInput = screen.getByDisplayValue('Test Item');
    fireEvent.change(nameInput, { target: { value: 'Reverted' } });
    fireEvent.keyDown(nameInput, { key: 'Escape' });

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Reverted')).not.toBeInTheDocument();
  });

  it('calls onDelete when delete control is used in edit mode', () => {
    renderRow();
    fireEvent.click(screen.getByText('Test Item').closest('.shopping-item-row'));
    fireEvent.click(screen.getByRole('button', { name: 'Delete item' }));
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('persists quantity on blur', async () => {
    renderRow();
    fireEvent.click(screen.getByText('Test Item').closest('.shopping-item-row'));
    const qty = screen.getByDisplayValue('2 lbs');
    fireEvent.change(qty, { target: { value: '3 lbs' } });
    fireEvent.blur(qty);
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('1', expect.objectContaining({ quantity: '3 lbs' }));
    });
  });

  it('flushes save on outside mousedown after listener delay', async () => {
    vi.useFakeTimers();
    mockOnSave.mockResolvedValue(undefined);
    renderRow();
    fireEvent.click(screen.getByText('Test Item').closest('.shopping-item-row'));
    mockOnSave.mockClear();
    fireEvent.change(screen.getByDisplayValue('Test Item'), { target: { value: 'Click out' } });
    expect(mockOnSave).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(CLICK_OUTSIDE_DELAY_MS);
      fireEvent.mouseDown(document.body);
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(mockOnSave).toHaveBeenCalledWith('1', expect.objectContaining({ name: 'Click out' }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(AUTO_SAVE_DEBOUNCE_MS);
    });
    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });
});
