/**
 * Animation utilities for PixiTileRack.
 *
 * Provides smooth tweening and animation effects for tiles.
 */

// Math utilities
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

// Check if a PixiJS object is still valid (not destroyed)
export const isValidPixiObject = (obj: any): boolean => {
  if (!obj) return false;
  if (obj.destroyed) return false;
  if (obj.scale && obj.scale === null) return false;
  return true;
};

/**
 * Easing functions for animations.
 */
export const Easing = {
  // Quadratic ease in/out
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // Cubic ease out (good for natural motion)
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),

  // Elastic ease out (bouncy effect)
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
        ? 1
        : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  // Back ease out (slight overshoot)
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

/**
 * Tween an object's position smoothly.
 */
export function tweenTo(
    obj: any,
  to: { x: number; y: number },
  ms = 300,
  easing: (t: number) => number = Easing.easeInOutQuad,
  onComplete?: () => void
): () => void {
  // Guard against invalid object
  if (!isValidPixiObject(obj)) {
    onComplete?.();
    return () => {};
  }

  const from = { x: obj.x, y: obj.y };
  const start = performance.now();
  let cancelled = false;

  function step(now: number) {
    if (cancelled || !isValidPixiObject(obj)) {
      onComplete?.();
      return;
    }

    const t = clamp((now - start) / ms, 0, 1);
    const ease = easing(t);

    try {
      obj.x = lerp(from.x, to.x, ease);
      obj.y = lerp(from.y, to.y, ease);
    } catch {
      // Object was destroyed during animation
      return;
    }

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      onComplete?.();
    }
  }

  requestAnimationFrame(step);

  // Return cancel function
  return () => {
    cancelled = true;
  };
}

/**
 * Tween an object's scale smoothly.
 */
export function tweenScale(
    obj: any,
  targetScale: number,
  ms = 200,
  easing: (t: number) => number = Easing.easeOutCubic,
  onComplete?: () => void
): () => void {
  // Guard against invalid object
  if (!isValidPixiObject(obj) || !obj.scale) {
    onComplete?.();
    return () => {};
  }

  const from = { x: obj.scale.x, y: obj.scale.y };
  const to = { x: targetScale, y: targetScale };
  const start = performance.now();
  let cancelled = false;

  function step(now: number) {
    if (cancelled || !isValidPixiObject(obj) || !obj.scale) {
      onComplete?.();
      return;
    }

    const t = clamp((now - start) / ms, 0, 1);
    const ease = easing(t);

    try {
      obj.scale.x = lerp(from.x, to.x, ease);
      obj.scale.y = lerp(from.y, to.y, ease);
    } catch {
      return;
    }

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      onComplete?.();
    }
  }

  requestAnimationFrame(step);

  return () => {
    cancelled = true;
  };
}

/**
 * Shake animation for invalid word feedback.
 */
export function shake(
    obj: any,
  intensity = 8,
  duration = 300,
  onComplete?: () => void
): () => void {
  // Guard against invalid object
  if (!isValidPixiObject(obj)) {
    onComplete?.();
    return () => {};
  }

  const originalX = obj.x;
  const start = performance.now();
  let cancelled = false;

  function step(now: number) {
    if (cancelled || !isValidPixiObject(obj)) {
      onComplete?.();
      return;
    }

    const elapsed = now - start;
    const t = elapsed / duration;

    try {
      if (t < 1) {
        // Decaying oscillation
        const decay = 1 - t;
        const offset = Math.sin(t * Math.PI * 8) * intensity * decay;
        obj.x = originalX + offset;
        requestAnimationFrame(step);
      } else {
        obj.x = originalX;
        onComplete?.();
      }
    } catch {
      return;
    }
  }

  requestAnimationFrame(step);

  return () => {
    cancelled = true;
    try {
      if (isValidPixiObject(obj)) obj.x = originalX;
    } catch {
      // Ignore
    }
  };
}

/**
 * Pop-in animation for new tiles.
 */
export function popIn(
    obj: any,
  ms = 150,
  onComplete?: () => void
): () => void {
  // Guard against invalid object
  if (!isValidPixiObject(obj) || !obj.scale) {
    onComplete?.();
    return () => {};
  }

  try {
    obj.scale.x = 0;
    obj.scale.y = 0;
    obj.alpha = 0;
  } catch {
    onComplete?.();
    return () => {};
  }

  const start = performance.now();
  let cancelled = false;

  function step(now: number) {
    if (cancelled || !isValidPixiObject(obj) || !obj.scale) {
      onComplete?.();
      return;
    }

    const t = clamp((now - start) / ms, 0, 1);
    const ease = Easing.easeOutBack(t);

    try {
      obj.scale.x = ease;
      obj.scale.y = ease;
      obj.alpha = t;
    } catch {
      return;
    }

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      onComplete?.();
    }
  }

  requestAnimationFrame(step);

  return () => {
    cancelled = true;
    try {
      if (isValidPixiObject(obj) && obj.scale) {
        obj.scale.x = 1;
        obj.scale.y = 1;
        obj.alpha = 1;
      }
    } catch {
      // Ignore
    }
  };
}

/**
 * Float up animation for score display.
 */
export function floatUp(
    obj: any,
  distance = 50,
  ms = 800,
  onComplete?: () => void
): () => void {
  // Guard against invalid object
  if (!isValidPixiObject(obj)) {
    onComplete?.();
    return () => {};
  }

  const startY = obj.y;
  const start = performance.now();
  let cancelled = false;

  function step(now: number) {
    if (cancelled || !isValidPixiObject(obj)) {
      onComplete?.();
      return;
    }

    const t = clamp((now - start) / ms, 0, 1);

    try {
      // Move up with ease out
      obj.y = startY - distance * Easing.easeOutCubic(t);

      // Fade out in last 30%
      obj.alpha = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
    } catch {
      return;
    }

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      onComplete?.();
    }
  }

  requestAnimationFrame(step);

  return () => {
    cancelled = true;
  };
}

/**
 * Get responsive layout constants based on screen size.
 */
export function getLayoutConstants() {
  const width = typeof window !== "undefined" ? window.innerWidth : 1200;

  // Smooth proportional scale for tiles/slots
  const scale = Math.min(Math.max(width / 1200, 0.5), 1);

  // Scale slot and gap proportionally
  const SLOT_SIZE = 80 * scale;
  const SLOT_GAP = 16 * scale;

  // Padding interpolation
  const rawPadding = 50 - (width - 400) * (18 / 800);
  const PADDING = Math.max(32, Math.min(50, rawPadding));

  return { PADDING, SLOT_SIZE, SLOT_GAP, scale };
}
