import { useState, useEffect } from 'react';
import { subscribeToMenu } from '../firebase/db';
import { buildMealOptions, buildCampMealOptions } from '../utils/menuMeals';

/**
 * Live menu rows from Firestore — same collection as the Menu page.
 * Used to drive shopping-list meal filters and row meal pickers.
 */
const useMenuMeals = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [mealOptions, setMealOptions] = useState([]);
  const [campMealOptions, setCampMealOptions] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToMenu((items) => {
      setMenuItems(items);
      setMealOptions(buildMealOptions(items));
      setCampMealOptions(buildCampMealOptions(items));
    });
    return () => unsubscribe();
  }, []);

  return { menuItems, mealOptions, campMealOptions };
};

export default useMenuMeals;
