/**
 * CSV Export Utility
 * Converts data arrays to CSV format and triggers download
 */

/**
 * Escapes a field value for CSV format
 * Handles commas, quotes, and newlines
 */
const escapeCSVField = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If the value contains comma, quote, or newline, wrap it in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

/**
 * Converts an array of objects to CSV format
 */
const arrayToCSV = (data, headers) => {
  if (!data || data.length === 0) {
    return headers.join(',') + '\n';
  }
  
  // Create header row
  const headerRow = headers.map(escapeCSVField).join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return headers.map(header => {
      const value = item[header];
      // Handle nested objects and dates
      if (value instanceof Date) {
        return escapeCSVField(value.toISOString());
      }
      if (typeof value === 'object' && value !== null) {
        return escapeCSVField(JSON.stringify(value));
      }
      return escapeCSVField(value);
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
};

/**
 * Triggers a download of a CSV file
 */
const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
};

/**
 * Exports shopping list items to CSV
 */
export const exportShoppingListToCSV = (items) => {
  if (!items || items.length === 0) {
    alert('No shopping list items to export');
    return;
  }
  
  // Define headers for shopping list
  const headers = ['Name', 'Store', 'Quantity', 'Notes', 'Checked', 'Created At'];
  
  // Map items to CSV format
  const csvData = items.map(item => ({
    'Name': item.name || '',
    'Store': item.store || '',
    'Quantity': item.quantity || '',
    'Notes': item.notes || '',
    'Checked': item.checked ? 'Yes' : 'No',
    'Created At': item.createdAt ? (item.createdAt.toDate ? item.createdAt.toDate().toISOString() : new Date(item.createdAt).toISOString()) : ''
  }));
  
  const csvContent = arrayToCSV(csvData, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `shopping-list-export-${timestamp}.csv`;
  
  downloadCSV(csvContent, filename);
};

/**
 * Exports menu items to CSV
 */
export const exportMenuToCSV = (items) => {
  if (!items || items.length === 0) {
    alert('No menu items to export');
    return;
  }
  
  // Define headers for menu items (dynamic based on item type)
  const headers = ['Type', 'Name', 'Date', 'Lunch', 'Dinner', 'Prepared By', 'Created At'];
  
  // Map items to CSV format
  const csvData = items.map(item => ({
    'Type': item.type || '',
    'Name': item.name || '',
    'Date': item.date || '',
    'Lunch': item.lunch || '',
    'Dinner': item.dinner || '',
    'Prepared By': item.preparedBy || '',
    'Created At': item.createdAt ? (item.createdAt.toDate ? item.createdAt.toDate().toISOString() : new Date(item.createdAt).toISOString()) : ''
  }));
  
  const csvContent = arrayToCSV(csvData, headers);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `menu-export-${timestamp}.csv`;
  
  downloadCSV(csvContent, filename);
};

/**
 * Exports all database data to CSV files
 * Creates separate CSV files for shopping list and menu
 */
export const exportAllDataToCSV = async (getAllShoppingListItems, getAllMenuItems) => {
  try {
    // Fetch all data
    const [shoppingItems, menuItems] = await Promise.all([
      getAllShoppingListItems(),
      getAllMenuItems()
    ]);
    
    // Export shopping list first
    if (shoppingItems && shoppingItems.length > 0) {
      exportShoppingListToCSV(shoppingItems);
    }
    
    // Small delay to avoid browser download conflicts
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Export menu items
    if (menuItems && menuItems.length > 0) {
      exportMenuToCSV(menuItems);
    }
    
    // Show success message
    const totalItems = (shoppingItems?.length || 0) + (menuItems?.length || 0);
    if (totalItems > 0) {
      alert(`Successfully exported ${shoppingItems?.length || 0} shopping list items and ${menuItems?.length || 0} menu items to CSV files.`);
    } else {
      alert('No data found to export.');
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    alert('Failed to export data. Please try again.');
  }
};
