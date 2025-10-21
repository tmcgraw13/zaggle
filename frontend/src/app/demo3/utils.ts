
export function getLayoutConstants() {
  const width = window.innerWidth;

  // Smooth proportional scale for tiles/slots
  const scale = Math.min(Math.max(width / 1200, 0.5), 1);

  // Scale slot and gap proportionally
  const SLOT_SIZE = 80 * scale;
  const SLOT_GAP = 16 * scale;

  // Padding should *not* shrink as much — interpolate between 50 and 32 instead
  const PADDING = 50 - (width - 400) * (18 / 800); // transitions from 50 → 32
  const clampedPadding = Math.max(32, Math.min(50, PADDING));

  return { PADDING: clampedPadding, SLOT_SIZE, SLOT_GAP };
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

export function tweenTo(
  obj: any,
  to: { x: number; y: number },
  ms = 300,
  onComplete?: () => void
) {
  const from = { x: obj.x, y: obj.y };
  const start = performance.now();
  function step(now: number) {
    const t = clamp((now - start) / ms, 0, 1);
    // easeInOutQuad curve
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    obj.x = lerp(from.x, to.x, ease);
    obj.y = lerp(from.y, to.y, ease);
    if (t < 1) requestAnimationFrame(step);
    else onComplete && onComplete();
  }
  requestAnimationFrame(step);
}
