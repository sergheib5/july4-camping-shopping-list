import { useState, useEffect } from 'react';
import { subscribeToMenu } from '../firebase/db';

/**
 * Menu items with Firestore `type === 'salad'` are the “camp meal / cookout” lane.
 * Shopping rows still use the `salad` field to tag which meal an item belongs to.
 */
const useSalads = () => {
  const [salads, setSalads] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToMenu((menuItems) => {
      // Filter for salad type and extract names
      const saladNames = menuItems
        .filter(item => item.type === 'salad' && item.name)
        .map(item => item.name)
        .sort(); // Sort alphabetically
      
      setSalads(saladNames);
    });

    return () => unsubscribe();
  }, []);

  return salads;
};

export default useSalads;
