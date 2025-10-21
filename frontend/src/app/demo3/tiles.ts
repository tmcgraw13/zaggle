import * as PIXI from "pixi.js";
import { tweenTo } from "./utils";

export function createTileHelpers(opts: {
  SLOT_SIZE: number;
  tilesLayer: PIXI.Container;
  textStyle: PIXI.TextStyle;
  rackPositions: () => { x: number; y: number }[];
  hitTestEmptySlot: (x: number, y: number) => any | null;
  nearestEmptySlot: (x: number, y: number) => any | null;
  firstAvailableSlot: () => any | null;
}) {
  const { SLOT_SIZE, tilesLayer, textStyle, rackPositions, hitTestEmptySlot, nearestEmptySlot, firstAvailableSlot } = opts;

  let tiles: any[] = [];

  function createTile(letter: string, idx: number) {
    const c = new PIXI.Container();
    const g = new PIXI.Graphics();
    g.roundRect(0, 0, SLOT_SIZE, SLOT_SIZE, 16)
      .fill({ color: 0xfef3c7 }) // Tailwind amber-100
      .stroke({ color: 0xf59e0b, width: 3 }); // Tailwind amber-500
    const t = new PIXI.Text({ text: letter, style: textStyle });
    t.anchor.set(0.5);
    t.x = SLOT_SIZE / 2;
    t.y = SLOT_SIZE / 2;
    c.addChild(g, t);
    c.cursor = "grab";
    c.eventMode = "static"; // enable pointer events
    c.zIndex = 1;
    tilesLayer.addChild(c);

    const home = rackPositions()[idx]; // initial rack position
    c.position.set(home.x, home.y);

    const tile: any = {
      ctr: c,
      label: t,
      letter,
      home: { ...home },
      slot: null, // slot reference if placed
      vx: 0,
      vy: 0,
      lastMoves: [] as any[], // history for flick detection
    };
    enableTileInteraction(tile);
    tiles.push(tile);
    return tile;
  }

  function enableTileInteraction(tile: any) {
    const c = tile.ctr;
    let dragging = false;
    let dragOffset = { x: 0, y: 0 };

    // Click tracking
    let lastClickTime = 0;
    let clickTimeout: any = null;

    // --- pointer down
    c.on("pointerdown", (e: any) => {
      dragging = true;
      c.zIndex = 1000;
      c.cursor = "grabbing";
      const global = e.global;
      dragOffset.x = global.x - c.x;
      dragOffset.y = global.y - c.y;
      tile.lastMoves.length = 0;
      recordMove(global.x, global.y);

      // If tile was in a slot, release it
      if (tile.slot) {
        tile.slot.occupiedBy = null;
        tile.slot = null;
      }
    });

    c.on("pointerupoutside", onUp);
    c.on("pointerup", onUp);

    // --- dragging motion
    c.on("globalpointermove", (e: any) => {
      if (!dragging) return;
      const { x, y } = e.global;
      const nx = x - dragOffset.x;
      const ny = y - dragOffset.y;
      c.position.set(nx, ny);
      recordMove(x, y);
    });

    // --- record last moves for velocity detection
    function recordMove(x: number, y: number) {
      const now = performance.now();
      tile.lastMoves.push({ x, y, t: now });
      while (tile.lastMoves.length && now - tile.lastMoves[0].t > 120) {
        tile.lastMoves.shift();
      }
    }

    // --- calculate velocity for flick
    function computeVelocity() {
      if (tile.lastMoves.length < 2) return { vx: 0, vy: 0, v: 0 };
      const a = tile.lastMoves[0];
      const b = tile.lastMoves[tile.lastMoves.length - 1];
      const dt = (b.t - a.t) / 1000;
      if (dt <= 0) return { vx: 0, vy: 0, v: 0 };
      const vx = (b.x - a.x) / dt;
      const vy = (b.y - a.y) / dt;
      return { vx, vy, v: Math.hypot(vx, vy) };
    }

    // --- release
    function onUp() {
      if (!dragging) return;
      dragging = false;
      c.cursor = "grab";
      c.zIndex = 10;

      const { vx, vy, v } = computeVelocity();
      const flickThreshold = 1200; // adjust sensitivity here
      const flickDownThreshold = 900; // downward-specific threshold

      // If a strong downward flick is detected, return to home (clearing any slot)
      if (vy > flickDownThreshold && Math.abs(vy) > Math.abs(vx)) {
        if (tile.slot) {
          tile.slot.occupiedBy = null;
          tile.slot = null;
        }
        // Cancel any pending click action so the tile doesn't get placed after the flick
        clearTimeout(clickTimeout);
        lastClickTime = 0;
        // Temporarily disable pointer events to avoid immediate re-grab/placement
        tile.ctr.eventMode = "none";
        returnTileHome(tile);
        setTimeout(() => {
          try {
            tile.ctr.eventMode = "static";
          } catch (e) {
            /* ignore */
          }
        }, 300);
        return;
      }

      if (v > flickThreshold) {
        // flick → nearest slot or fallback
        const targetSlot =
          nearestEmptySlot(c.x + vx * 0.1, c.y + vy * 0.1) ||
          firstAvailableSlot();
        if (targetSlot) placeTileInSlot(tile, targetSlot);
        else returnTileHome(tile);
        return;
      }

      // normal drop → snap to hovered or nearest slot
      const hoverSlot = hitTestEmptySlot(c.x, c.y);
      if (hoverSlot) {
        placeTileInSlot(tile, hoverSlot);
        return;
      }

      const nextSlotInOrder = firstAvailableSlot();
      if (nextSlotInOrder) placeTileInSlot(tile, nextSlotInOrder);
      else returnTileHome(tile);
    }

    // --- unified click logic (single + double)
    c.on("pointertap", () => {
      const now = performance.now();
      const diff = now - lastClickTime;

      if (diff < 300) {
        // DOUBLE CLICK detected
        clearTimeout(clickTimeout);

        // Return to rack
        if (tile.slot) {
          tile.slot.occupiedBy = null;
          tile.slot = null;
        }
        returnTileHome(tile);
      } else {
        // SINGLE CLICK (delay slightly to check for double)
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
          if (dragging) return;
          if (tile.slot) return;
          const slot = firstAvailableSlot();
          if (slot) placeTileInSlot(tile, slot);
        }, 300);
      }

      lastClickTime = now;
    });
  }

  function placeTileInSlot(tile: any, slot: any) {
    if (slot.occupiedBy) return;
    slot.occupiedBy = tile;
    tile.slot = slot;
    tweenTo(tile.ctr, { x: slot.x, y: slot.y }, 220);
  }

  function returnTileHome(tile: any) {
    tweenTo(tile.ctr, tile.home, 260);
  }

  return { tiles, createTile, placeTileInSlot, returnTileHome };
}
