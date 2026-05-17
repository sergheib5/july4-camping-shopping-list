import { useState, useRef, useEffect, useCallback } from 'react';
import { STORES, DEFAULT_STORE } from '../utils/constants';
import { UNASSIGNED_MEAL_VALUE } from '../utils/menuMeals';
import StoreBrandMark from './StoreBrandMark';
import './InlineAddRow.css';

const INITIAL_FORM = {
  name: '',
  store: DEFAULT_STORE,
  salad: UNASSIGNED_MEAL_VALUE,
  quantity: '',
};

/** 0 = name only, 1 = + store, 2 = + meal & quantity (ready to save) */
const STEP_STORE = 1;
const STEP_DETAILS = 2;

const InlineAddRow = ({ onSave, campMealOptions = [] }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [step, setStep] = useState(0);

  const nameInputRef = useRef(null);
  const storeSelectRef = useRef(null);
  const mealSelectRef = useRef(null);
  const quantityInputRef = useRef(null);
  const formRef = useRef(null);
  const prevStepRef = useRef(step);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM);
    setStep(0);
    requestAnimationFrame(() => nameInputRef.current?.focus());
  }, []);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (step === STEP_STORE) storeSelectRef.current?.focus();
    if (step === STEP_DETAILS && prevStepRef.current === STEP_STORE) {
      quantityInputRef.current?.focus();
    }
    prevStepRef.current = step;
  }, [step]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submitIfReady = useCallback(
    (e) => {
      if (!formData.name.trim()) return false;
      if (e) e.preventDefault();
      onSave(formData);
      resetForm();
      return true;
    },
    [formData, onSave, resetForm],
  );

  const goToDetails = useCallback(() => {
    setStep(STEP_DETAILS);
  }, []);

  const handlePlusClick = () => {
    setStep(STEP_DETAILS);
    requestAnimationFrame(() => nameInputRef.current?.focus());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < STEP_DETAILS) {
      if (formData.name.trim()) {
        setStep((s) => Math.min(s + 1, STEP_DETAILS));
      }
      return;
    }
    submitIfReady(e);
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!formData.name.trim()) return;
      if (step === 0) {
        setStep(STEP_STORE);
        return;
      }
      if (step >= STEP_DETAILS) submitIfReady(e);
    }
    if (e.key === 'Escape') handleEscape(e);
  };

  const handleFieldKeyDown = (e, fieldStep) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!formData.name.trim()) {
        nameInputRef.current?.focus();
        return;
      }
      if (fieldStep === STEP_DETAILS) {
        submitIfReady(e);
        return;
      }
      if (fieldStep === STEP_STORE) {
        goToDetails();
      }
    }
    if (e.key === 'Escape') handleEscape(e);
  };

  const handleEscape = (e) => {
    if (step > 0 || formData.name.trim() || formData.quantity.trim()) {
      e.preventDefault();
      if (step > 0) {
        setStep((s) => s - 1);
      } else {
        resetForm();
      }
    }
  };

  const handleNameBlur = () => {
    if (formData.name.trim() && step === 0) {
      setStep(STEP_STORE);
    }
  };

  const handleStoreChange = (value) => {
    handleChange('store', value);
    goToDetails();
  };

  const handleStoreBlur = () => {
    if (formData.name.trim() && step === STEP_STORE) {
      goToDetails();
    }
  };

  const handleMealChange = (value) => {
    handleChange('salad', value);
    requestAnimationFrame(() => quantityInputRef.current?.focus());
  };

  const showStore = step >= STEP_STORE;
  const showDetails = step >= STEP_DETAILS;

  return (
    <form
      className={`inline-add-row inline-add-row--step-${step}`}
      onSubmit={handleSubmit}
      ref={formRef}
      aria-label="Add shopping item"
    >
      <div className="inline-add-row__name">
        <button
          type="button"
          className="inline-add-row__plus"
          onClick={handlePlusClick}
          aria-label="Show store, meal, and quantity"
          aria-expanded={showDetails}
          aria-controls="inline-add-details"
        >
          +
        </button>
        <input
          ref={nameInputRef}
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          onKeyDown={handleNameKeyDown}
          onBlur={handleNameBlur}
          placeholder="Add item"
          className="inline-input item-input"
          aria-label="Add item"
          required
        />
      </div>

      {(showStore || showDetails) && (
        <div
          id="inline-add-details"
          className="inline-add-row__details"
          role="group"
          aria-label="Item details"
        >
          {showStore && (
            <div className="inline-add-row__field inline-add-row__field--store">
              <label className="inline-add-row__label" htmlFor="inline-add-store">
                Store
              </label>
              <div className="inline-add-row__select-wrap">
                <StoreBrandMark store={formData.store} size="tiny" />
                <select
                  id="inline-add-store"
                  ref={storeSelectRef}
                  value={formData.store}
                  onChange={(e) => handleStoreChange(e.target.value)}
                  onBlur={handleStoreBlur}
                  onKeyDown={(e) => handleFieldKeyDown(e, STEP_STORE)}
                  className="inline-select"
                  aria-label="Store lane"
                >
                  {STORES.map((store) => (
                    <option key={store} value={store}>
                      {store}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {showDetails && (
            <>
              <div className="inline-add-row__field inline-add-row__field--meal">
                <label className="inline-add-row__label" htmlFor="inline-add-meal">
                  Meal
                </label>
                <select
                  id="inline-add-meal"
                  ref={mealSelectRef}
                  value={formData.salad}
                  onChange={(e) => handleMealChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      quantityInputRef.current?.focus();
                    }
                    if (e.key === 'Escape') handleEscape(e);
                  }}
                  className="inline-select"
                  aria-label="Menu meal"
                >
                  <option value={UNASSIGNED_MEAL_VALUE}>General</option>
                  {campMealOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="inline-add-row__field inline-add-row__field--quantity">
                <label className="inline-add-row__label" htmlFor="inline-add-qty">
                  Quantity
                </label>
                <div className="inline-add-row__qty-row">
                  <input
                    id="inline-add-qty"
                    ref={quantityInputRef}
                    type="text"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                    onKeyDown={(e) => handleFieldKeyDown(e, STEP_DETAILS)}
                    placeholder="e.g. 2 lbs (optional)"
                    className="inline-input quantity-input"
                    aria-label="Quantity"
                  />
                  <button type="submit" className="inline-add-row__add-btn">
                    Add
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {step === STEP_STORE && (
        <p className="inline-add-row__hint" aria-live="polite">
          Choose a store — meal and quantity appear next.
        </p>
      )}
    </form>
  );
};

export default InlineAddRow;
