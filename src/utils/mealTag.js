/** Firestore / form value for items not tied to a specific menu dish (type `salad`). */
export const MEAL_TAG_UNASSIGNED_VALUE = 'General';

export function formatMealTagForDisplay(salad) {
  if (!salad || salad === MEAL_TAG_UNASSIGNED_VALUE) return 'Unassigned';
  return salad;
}
