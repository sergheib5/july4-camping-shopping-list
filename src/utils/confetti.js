import confetti from 'canvas-confetti';

/**
 * Trigger confetti celebration when a store is completed
 * @param {string} storeName - Name of the store that was completed
 * @param {string} storeColor - Hex color code for the store
 * @returns {Function} Cleanup function to cancel pending animations
 */
export const triggerStoreConfetti = (storeName, storeColor) => {
  // Convert hex color to RGB for confetti
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 215, b: 0 }; // Default to gold
  };

  const rgb = hexToRgb(storeColor);
  const color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  // Create a burst of confetti with the store color
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: [color],
    gravity: 0.8,
    ticks: 200,
  });

  // Store timeout IDs for cleanup
  const timeout1 = setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: [color],
      gravity: 0.8,
    });
  }, 250);

  const timeout2 = setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: [color],
      gravity: 0.8,
    });
  }, 400);

  // Return cleanup function
  return () => {
    clearTimeout(timeout1);
    clearTimeout(timeout2);
  };
};

/**
 * Trigger a big celebration when the entire shopping list is 100% complete
 * @returns {Function} Cleanup function to cancel pending animations
 */
export const triggerCompleteConfetti = () => {
  // Big burst from center
  confetti({
    particleCount: 200,
    spread: 100,
    origin: { y: 0.5 },
    colors: ['#4caf50', '#2196f3', '#f44336', '#ff9800', '#9c27b0', '#00bcd4'],
    gravity: 0.8,
    ticks: 300,
  });

  // Multiple bursts from different angles
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // Launch from left
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#4caf50', '#2196f3', '#f44336', '#ff9800'],
    });
    
    // Launch from right
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#4caf50', '#2196f3', '#f44336', '#ff9800'],
    });
  }, 250);

  // Final big burst
  const finalTimeout = setTimeout(() => {
    confetti({
      particleCount: 300,
      spread: 120,
      origin: { y: 0.4 },
      colors: ['#4caf50', '#2196f3', '#f44336', '#ff9800', '#9c27b0', '#00bcd4', '#ffeb3b'],
      gravity: 0.6,
      ticks: 400,
    });
  }, 2000);

  // Return cleanup function
  return () => {
    clearInterval(interval);
    clearTimeout(finalTimeout);
  };
};

