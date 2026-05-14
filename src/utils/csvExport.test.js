import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  exportShoppingListToCSV,
  exportMenuToCSV,
  exportAllDataToCSV
} from './csvExport';

describe('csvExport', () => {
  let mockCreateElement;
  let mockAppendChild;
  let mockRemoveChild;
  let mockClick;
  let mockLink;
  let mockURL;

  beforeEach(() => {
    // Mock DOM methods
    mockClick = vi.fn();
    mockLink = {
      setAttribute: vi.fn(),
      click: mockClick,
      style: {}
    };
    mockAppendChild = vi.fn();
    mockRemoveChild = vi.fn();
    mockCreateElement = vi.fn(() => mockLink);

    document.createElement = mockCreateElement;
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;

    // Mock Blob and URL
    class MockBlob {
      constructor() {
        this.content = arguments[0];
        this.type = arguments[1]?.type || '';
      }
    }
    globalThis.Blob = MockBlob;
    mockURL = {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn()
    };
    globalThis.URL = mockURL;

    // Mock window.alert
    globalThis.alert = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('exportShoppingListToCSV', () => {
    it('should export shopping list items to CSV', () => {
      const items = [
        {
          name: 'Apples',
          store: 'Fresh Farm',
          salad: 'General',
          quantity: '2 lbs',
          notes: 'Organic',
          checked: false,
          createdAt: { toDate: () => new Date('2024-01-01') }
        },
        {
          name: 'Milk',
          store: 'Aldi',
          salad: 'General',
          quantity: '1 gallon',
          notes: '',
          checked: true,
          createdAt: { toDate: () => new Date('2024-01-02') }
        }
      ];

      exportShoppingListToCSV(items, []);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'blob:mock-url');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('shopping-list-export-'));
      expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
      expect(mockURL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should handle empty items array', () => {
      exportShoppingListToCSV([]);
      expect(globalThis.alert).toHaveBeenCalledWith('No shopping list items to export');
      expect(mockCreateElement).not.toHaveBeenCalled();
    });

    it('should handle null items', () => {
      exportShoppingListToCSV(null);
      expect(globalThis.alert).toHaveBeenCalledWith('No shopping list items to export');
    });

    it('should handle items with missing fields', () => {
      const items = [
        {
          name: 'Test Item',
          store: '',
          salad: 'General',
          quantity: null,
          notes: undefined,
          checked: false
        }
      ];

      exportShoppingListToCSV(items, []);
      expect(mockCreateElement).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle items with special characters in CSV', () => {
      const items = [
        {
          name: 'Item with "quotes"',
          store: 'Store, with comma',
          salad: 'General',
          quantity: '1\nnewline',
          notes: 'Normal notes',
          checked: false,
          createdAt: { toDate: () => new Date('2024-01-01') }
        }
      ];

      exportShoppingListToCSV(items, []);
      expect(mockCreateElement).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle createdAt as Date object', () => {
      const items = [
        {
          name: 'Test',
          store: 'Store',
          salad: 'General',
          quantity: '1',
          notes: '',
          checked: false,
          createdAt: new Date('2024-01-01')
        }
      ];

      exportShoppingListToCSV(items, []);
      expect(mockCreateElement).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('exportMenuToCSV', () => {
    it('should export menu items to CSV', () => {
      const items = [
        {
          type: 'meal',
          name: 'Breakfast',
          date: '2024-01-01',
          lunch: 'Sandwich',
          dinner: 'Pasta',
          preparedBy: 'John',
          createdAt: { toDate: () => new Date('2024-01-01') }
        }
      ];

      exportMenuToCSV(items);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('menu-export-'));
      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle empty menu items', () => {
      exportMenuToCSV([]);
      expect(globalThis.alert).toHaveBeenCalledWith('No menu items to export');
    });

    it('should handle null menu items', () => {
      exportMenuToCSV(null);
      expect(globalThis.alert).toHaveBeenCalledWith('No menu items to export');
    });
  });

  describe('exportAllDataToCSV', () => {
    it('should export both shopping list and menu items', async () => {
      const mockGetAllShoppingListItems = vi.fn().mockResolvedValue([
        { name: 'Item 1', store: 'Store 1', salad: 'General', quantity: '1', notes: '', checked: false }
      ]);
      const mockGetAllMenuItems = vi.fn().mockResolvedValue([
        { type: 'meal', name: 'Breakfast', date: '2024-01-01', lunch: '', dinner: '', preparedBy: '' }
      ]);

      await exportAllDataToCSV(mockGetAllShoppingListItems, mockGetAllMenuItems);

      expect(mockGetAllShoppingListItems).toHaveBeenCalled();
      expect(mockGetAllMenuItems).toHaveBeenCalled();
      expect(mockCreateElement).toHaveBeenCalledTimes(2); // Called for both exports
    });

    it('should handle empty data', async () => {
      const mockGetAllShoppingListItems = vi.fn().mockResolvedValue([]);
      const mockGetAllMenuItems = vi.fn().mockResolvedValue([]);

      await exportAllDataToCSV(mockGetAllShoppingListItems, mockGetAllMenuItems);

      expect(globalThis.alert).toHaveBeenCalledWith('No data found to export.');
    });

    it('should handle errors gracefully', async () => {
      const mockGetAllShoppingListItems = vi.fn().mockRejectedValue(new Error('Database error'));
      const mockGetAllMenuItems = vi.fn().mockResolvedValue([]);

      await exportAllDataToCSV(mockGetAllShoppingListItems, mockGetAllMenuItems);

      expect(globalThis.alert).toHaveBeenCalledWith('Failed to export data. Please try again.');
    });

    it('should export only shopping list if menu is empty', async () => {
      const mockGetAllShoppingListItems = vi.fn().mockResolvedValue([
        { name: 'Item 1', store: 'Store 1', salad: 'General', quantity: '1', notes: '', checked: false }
      ]);
      const mockGetAllMenuItems = vi.fn().mockResolvedValue([]);

      await exportAllDataToCSV(mockGetAllShoppingListItems, mockGetAllMenuItems);

      expect(mockCreateElement).toHaveBeenCalledTimes(1); // Only shopping list export
    });

    it('should export only menu if shopping list is empty', async () => {
      const mockGetAllShoppingListItems = vi.fn().mockResolvedValue([]);
      const mockGetAllMenuItems = vi.fn().mockResolvedValue([
        { type: 'meal', name: 'Breakfast', date: '2024-01-01', lunch: '', dinner: '', preparedBy: '' }
      ]);

      await exportAllDataToCSV(mockGetAllShoppingListItems, mockGetAllMenuItems);

      expect(mockCreateElement).toHaveBeenCalledTimes(1); // Only menu export
    });
  });
});
