import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ShoppingList from './ShoppingList';
import Menu from './Menu';
import {
  __resetFirebaseMemory,
  __seedFirebaseMemory,
  __getShoppingMemory,
  __getMenuMemory,
} from '../test/memoryFirebaseDb';

vi.mock('../firebase/db', async () => import('../test/memoryFirebaseDb.js'));

vi.mock('../utils/confetti', () => ({
  triggerStoreConfetti: vi.fn(),
  triggerCompleteConfetti: vi.fn(() => () => {}),
}));

const renderShopping = () =>
  render(
    <MemoryRouter>
      <ShoppingList />
    </MemoryRouter>,
  );

const renderMenu = () =>
  render(
    <MemoryRouter initialEntries={['/menu']}>
      <Menu />
    </MemoryRouter>,
  );

describe('Shopping list & menu (in-memory Firebase)', () => {
  let user;
  let consoleLogSpy;

  beforeEach(() => {
    __resetFirebaseMemory();
    user = userEvent.setup();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('adds shopping items for a camp meal across two stores, then removes them', async () => {
    const createdAt = new Date('2026-05-01T12:00:00');
    __seedFirebaseMemory({
      menu: [
        {
          id: 'camp-meal-bbq',
          type: 'salad',
          name: 'BBQ night',
          preparedBy: 'Alex',
          createdAt,
        },
      ],
    });

    renderShopping();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'BBQ night' })).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText('Add item');
    const storeSelect = screen.getByLabelText('Store lane');
    const mealSelect = screen.getByLabelText('Menu meal');

    await user.type(nameInput, 'Burger buns');
    await user.selectOptions(storeSelect, 'Aldi');
    await user.selectOptions(mealSelect, 'camp-meal-bbq');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Burger buns')).toBeInTheDocument();
    });

    await user.clear(nameInput);
    await user.type(nameInput, 'Bratwurst');
    await user.selectOptions(storeSelect, 'Costco');
    await user.selectOptions(mealSelect, 'camp-meal-bbq');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Bratwurst')).toBeInTheDocument();
    });

    expect(__getShoppingMemory()).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Aldi' }));

    expect(screen.getByText('Burger buns')).toBeInTheDocument();
    expect(screen.queryByText('Bratwurst')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Costco' }));
    expect(screen.getByText('Bratwurst')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'All Stores' }));

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete item' });
    expect(deleteButtons).toHaveLength(2);

    await user.click(deleteButtons[0]);
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Delete item' })).toHaveLength(1);
    });

    await user.click(screen.getByRole('button', { name: 'Delete item' }));
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Delete item' })).not.toBeInTheDocument();
    });

    expect(__getShoppingMemory()).toHaveLength(0);
    expect(screen.getByText(/Your shopping list is empty/i)).toBeInTheDocument();
  });

  it('adds a camp meal, snack, and drink on the menu page then deletes all rows', async () => {
    renderMenu();

    const campSection = screen.getByRole('heading', { name: /Camp meals/i }).closest('section');
    await user.click(within(campSection).getByRole('button', { name: '+ Add' }));

    await screen.findByRole('heading', { name: /Add camp meal/i });
    await user.type(screen.getByLabelText(/Meal name/i), 'Dutch oven chili');
    await user.type(screen.getByLabelText(/Lead \/ prep/i), 'Jamie');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Add camp meal/i })).not.toBeInTheDocument();
    });
    expect(screen.getByText('Dutch oven chili')).toBeInTheDocument();

    const snackSection = screen.getByRole('heading', { name: /Snacks/i }).closest('section');
    await user.click(within(snackSection).getByRole('button', { name: '+ Add' }));

    await screen.findByRole('heading', { name: /Add Snack/i });
    await user.type(screen.getByLabelText(/Snack Name/i), 'Trail mix');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Add Snack/i })).not.toBeInTheDocument();
    });
    expect(screen.getByText('Trail mix')).toBeInTheDocument();

    const drinkSection = screen.getByRole('heading', { name: /Drinks/i }).closest('section');
    await user.click(within(drinkSection).getByRole('button', { name: '+ Add' }));

    await screen.findByRole('heading', { name: /Add Drink/i });
    await user.type(screen.getByLabelText(/Drink Name/i), 'Iced tea');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Add Drink/i })).not.toBeInTheDocument();
    });
    expect(screen.getByText('Iced tea')).toBeInTheDocument();

    expect(__getMenuMemory()).toHaveLength(3);

    for (const label of ['Dutch oven chili', 'Trail mix', 'Iced tea']) {
      const cell = screen.getByText(label);
      const row = cell.closest('.menu-row, .snack-item');
      expect(row).toBeTruthy();
      await user.click(within(row).getByRole('button', { name: 'Delete item' }));
      await user.click(screen.getByRole('button', { name: 'Remove' }));
    }

    await waitFor(() => {
      expect(__getMenuMemory()).toHaveLength(0);
    });

    expect(screen.getByText(/No camp meals yet/i)).toBeInTheDocument();
    expect(screen.getByText(/No snacks yet/i)).toBeInTheDocument();
    expect(screen.getByText(/No drinks yet/i)).toBeInTheDocument();
  });
});
