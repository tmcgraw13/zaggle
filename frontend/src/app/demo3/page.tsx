"use client";

import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let app: PIXI.Application | null = null;
    let mounted = true;

    (async function () {
      const newApp = new PIXI.Application();
      await newApp.init({
        background: "#0f172a",
        resizeTo: window,
        antialias: true,
      });

      if (!mounted) {
        newApp.destroy(true);
        return;
      }

      app = newApp;
      if (containerRef.current) {
        containerRef.current.appendChild(app.canvas);
      }

      // --- Layout constants
      const PADDING = 32;
      const SLOT_SIZE = 80;
      const SLOT_GAP = 16;
      const LETTERS = ["A", "B", "C", "D", "E", "F", "G"];

      const SLOTS_Y = () => PADDING + 40;
      const RACK_Y = () => app!.renderer.height - PADDING - SLOT_SIZE - 20;

      const slotsLayer = new PIXI.Container();
      const tilesLayer = new PIXI.Container();
      app.stage.addChild(slotsLayer, tilesLayer);

      const textStyle = new PIXI.TextStyle({
        fill: "#0f172a",
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        fontSize: 36,
        fontWeight: "800",
      });

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      const clamp = (n: number, lo: number, hi: number) =>
        Math.max(lo, Math.min(hi, n));

      function tweenTo(
        obj: any,
        to: { x: number; y: number },
        ms = 300,
        onComplete?: () => void
      ) {
        const from = { x: obj.x, y: obj.y };
        const start = performance.now();
        function step(now: number) {
          const t = clamp((now - start) / ms, 0, 1);
          const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOutQuad
          obj.x = lerp(from.x, to.x, ease);
          obj.y = lerp(from.y, to.y, ease);
          if (t < 1) requestAnimationFrame(step);
          else onComplete && onComplete();
        }
        requestAnimationFrame(step);
      }

      // --- Slots
      let slots: any[] = [];

      function layoutSlots() {
        slots.length = 0;
        slotsLayer.removeChildren();
        const totalWidth = 7 * SLOT_SIZE + 6 * SLOT_GAP;
        const startX = (app!.renderer.width - totalWidth) / 2;
        for (let i = 0; i < 7; i++) {
          const g = new PIXI.Graphics();
          g.roundRect(0, 0, SLOT_SIZE, SLOT_SIZE, 16)
            .fill(0xe5e7eb)
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
        const totalWidth =
          LETTERS.length * SLOT_SIZE + (LETTERS.length - 1) * SLOT_GAP;
        const startX = (app!.renderer.width - totalWidth) / 2;
        return LETTERS.map((_, i) => ({
          x: Math.round(startX + i * (SLOT_SIZE + SLOT_GAP)),
          y: Math.round(RACK_Y()),
        }));
      }

      // --- Tiles
      let tiles: any[] = [];

      function createTile(letter: string, idx: number) {
        const c = new PIXI.Container();
        const g = new PIXI.Graphics();
        g.roundRect(0, 0, SLOT_SIZE, SLOT_SIZE, 16)
          .fill(0xfef3c7)
          .stroke({ color: 0xf59e0b, width: 3 });
        const t = new PIXI.Text({ text: letter, style: textStyle });
        t.anchor.set(0.5);
        t.x = SLOT_SIZE / 2;
        t.y = SLOT_SIZE / 2;
        c.addChild(g, t);
        c.cursor = "grab";
        c.eventMode = "static";
        c.zIndex = 1;
        tilesLayer.addChild(c);

        const home = rackPositions()[idx];
        c.position.set(home.x, home.y);

        const tile: any = {
          ctr: c,
          label: t,
          letter,
          home: { ...home },
          slot: null,
          vx: 0,
          vy: 0,
          lastMoves: [] as any[],
        };
        enableTileInteraction(tile);
        tiles.push(tile);
        return tile;
      }

      LETTERS.forEach((L, i) => createTile(L, i));
      tilesLayer.sortableChildren = true;

      // --- Interaction logic
      function enableTileInteraction(tile: any) {
        const c = tile.ctr;
        let dragging = false;
        let dragOffset = { x: 0, y: 0 };
        let clickTimer = 0;

        c.on("pointerdown", (e: any) => {
          dragging = true;
          c.zIndex = 1000;
          c.cursor = "grabbing";
          const global = e.global;
          dragOffset.x = global.x - c.x;
          dragOffset.y = global.y - c.y;
          tile.lastMoves.length = 0;
          recordMove(global.x, global.y);
          if (tile.slot) {
            tile.slot.occupiedBy = null;
            tile.slot = null;
          }
        });

        c.on("pointerupoutside", onUp);
        c.on("pointerup", onUp);

        c.on("globalpointermove", (e: any) => {
          if (!dragging) return;
          const { x, y } = e.global;
          const nx = x - dragOffset.x;
          const ny = y - dragOffset.y;
          c.position.set(nx, ny);
          recordMove(x, y);
        });

        function recordMove(x: number, y: number) {
          const now = performance.now();
          tile.lastMoves.push({ x, y, t: now });
          while (tile.lastMoves.length && now - tile.lastMoves[0].t > 120) {
            tile.lastMoves.shift();
          }
        }

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

        function onUp() {
          if (!dragging) return;
          dragging = false;
          c.cursor = "grab";
          c.zIndex = 10;

          const { vx, vy, v } = computeVelocity();
          const flickThreshold = 1200;

          if (v > flickThreshold) {
            const targetSlot =
              nearestEmptySlot(c.x + vx * 0.1, c.y + vy * 0.1) ||
              firstAvailableSlot();
            if (targetSlot) placeTileInSlot(tile, targetSlot);
            else returnTileHome(tile);
            return;
          }

          const hoverSlot = hitTestEmptySlot(c.x, c.y);
          if (hoverSlot) {
            placeTileInSlot(tile, hoverSlot);
            return;
          }
          const nearest = nearestEmptySlot(c.x, c.y);
          if (nearest) placeTileInSlot(tile, nearest);
          else returnTileHome(tile);
        }

        c.on("pointertap", () => {
          const now = performance.now();
          if (now - clickTimer < 300) return;
          clickTimer = now;
          if (dragging) return;
          if (tile.slot) return;
          const slot = firstAvailableSlot();
          if (slot) placeTileInSlot(tile, slot);
        });

        c.on("pointerdown", () => {
          const now = performance.now();
          if (now - clickTimer < 300) {
            if (tile.slot) {
              tile.slot.occupiedBy = null;
              tile.slot = null;
            }
            returnTileHome(tile);
          }
          clickTimer = now;
        });
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
        for (const s of slots) {
          if (!s.occupiedBy) return s;
        }
        return null;
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

      function relayout() {
        const homes = rackPositions();
        layoutSlots();
        tiles.forEach((tile, i) => {
          tile.home = { ...homes[i] };
          if (tile.slot) {
            const idx = tile.slot.index;
            const freshSlot = slots[idx];
            tile.slot = freshSlot;
            freshSlot.occupiedBy = tile;
            tweenTo(tile.ctr, { x: freshSlot.x, y: freshSlot.y }, 0);
          } else {
            tweenTo(tile.ctr, tile.home, 0);
          }
        });
      }

      window.addEventListener("resize", relayout);

      window.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "r") resetAll();
      });

      function resetAll() {
        slots.forEach((s) => {
          s.occupiedBy = null;
        });
        tiles.forEach((t) => {
          t.slot = null;
          returnTileHome(t);
        });
      }

      app!.ticker.add(() => {
        const p = app!.renderer.events.pointer.global;
        for (const s of slots) {
          if (
            !s.occupiedBy &&
            p.x >= s.x &&
            p.x <= s.x + SLOT_SIZE &&
            p.y >= s.y &&
            p.y <= s.y + SLOT_SIZE
          ) {
            s.g.tint = 0xc7d2fe;
          } else {
            s.g.tint = 0xffffff;
          }
        }
      });

      layoutSlots();
    })();

    return () => {
      mounted = false;
      if (app) {
        app.destroy(true);
        app = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-screen bg-slate-900 relative">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-3 text-slate-200 text-sm opacity-90">
        Drag or flick tiles into slots. Click = first empty slot. Double-click =
        return. Press R to reset.
      </div>
    </div>
  );
}
