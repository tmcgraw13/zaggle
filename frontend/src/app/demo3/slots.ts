import * as PIXI from "pixi.js";

export function createSlotHelpers(opts: {
  app: PIXI.Application;
  SLOT_SIZE: number;
  SLOT_GAP: number;
  PADDING: number;
  slotsLayer: PIXI.Container;
  LETTERS: string[];
}) {
  const { app, SLOT_SIZE, SLOT_GAP, PADDING, slotsLayer, LETTERS } = opts;

  let slots: any[] = [];

  function SLOTS_Y() {
    return PADDING;
  }

  function RACK_Y() {
    return app.renderer.height - PADDING - SLOT_SIZE - 20;
  }

  function layoutSlots() {
    slots.length = 0;
    slotsLayer.removeChildren();

    const totalWidth = 7 * SLOT_SIZE + 6 * SLOT_GAP;
    const startX = (app.renderer.width - totalWidth) / 2;

    for (let i = 0; i < 7; i++) {
      const g = new PIXI.Graphics();
      g.roundRect(0, 0, SLOT_SIZE, SLOT_SIZE, 16)
        .fill({ color: 0xe5e7eb })
        .stroke({ color: 0x94a3b8, width: 2 });
      g.alpha = 0.9;
      g.x = Math.round(startX + i * (SLOT_SIZE + SLOT_GAP));
      g.y = Math.round(SLOTS_Y());
      g.eventMode = "none";
      slotsLayer.addChild(g);
      slots.push({ g, x: g.x, y: g.y, occupiedBy: null, index: i });
    }
  }

  function rackPositions() {
    const totalWidth = LETTERS.length * SLOT_SIZE + (LETTERS.length - 1) * SLOT_GAP;
    const startX = (app.renderer.width - totalWidth) / 2;
    return LETTERS.map((_, i) => ({
      x: Math.round(startX + i * (SLOT_SIZE + SLOT_GAP)),
      y: Math.round(RACK_Y()),
    }));
  }

  function hitTestEmptySlot(x: number, y: number) {
    return (
      slots.find(
        (s) =>
          !s.occupiedBy &&
          x >= s.x - 8 &&
          x <= s.x + SLOT_SIZE + 8 &&
          y >= s.y - 8 &&
          y <= s.y + SLOT_SIZE + 8
      ) || null
    );
  }

  function nearestEmptySlot(x: number, y: number) {
    let best: any = null,
      bestD = Infinity;
    for (const s of slots) {
      if (s.occupiedBy) continue;
      const cx = s.x + SLOT_SIZE / 2;
      const cy = s.y + SLOT_SIZE / 2;
      const d = (cx - x) * (cx - x) + (cy - y) * (cy - y);
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    return best;
  }

  function firstAvailableSlot() {
    return slots.find((s) => !s.occupiedBy) || null;
  }

  return {
    slots,
    layoutSlots,
    rackPositions,
    hitTestEmptySlot,
    nearestEmptySlot,
    firstAvailableSlot,
  };
}
