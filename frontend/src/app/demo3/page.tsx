"use client";

import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { getLayoutConstants, tweenTo } from "./utils";
import { createSlotHelpers } from "./slots";
import { createTileHelpers } from "./tiles";

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let app: PIXI.Application | null = null;
    let mounted = true;

    (async function () {
      // --- Initialize PixiJS application
      const newApp = new PIXI.Application();
      await newApp.init({
        background: "#0f172a", // background color (Tailwind slate-900)
        resizeTo: containerRef.current!, // resize canvas to container, not whole window
        antialias: true, // smooth edges for shapes/text
      });

      if (!mounted) {
        newApp.destroy(true);
        return;
      }

      app = newApp;
      if (containerRef.current) {
        containerRef.current.appendChild(app.canvas); // attach canvas to DOM
      }

      // --- Layout constants (easy to tweak)
      let { PADDING, SLOT_SIZE, SLOT_GAP } = getLayoutConstants();
      const LETTERS = ["A", "B", "C", "D", "E", "F", "G"]; // letters in rack

    

      // --- Layers for better z-ordering
      const slotsLayer = new PIXI.Container();
      const tilesLayer = new PIXI.Container();
      app.stage.addChild(slotsLayer, tilesLayer);

      // --- Text style for letters
      const textStyle = new PIXI.TextStyle({
        fill: "#0f172a", // dark text color
        fontFamily:
          "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        fontSize: 36,
        fontWeight: "800",
      });

      // animation helpers moved to ./utils.ts

      // =========================
      // SLOTS SETUP (moved to ./slots)
      // =========================
      const {
        slots,
        layoutSlots,
        rackPositions,
        hitTestEmptySlot,
        nearestEmptySlot,
        firstAvailableSlot,
      } = createSlotHelpers({
        app: app!,
        SLOT_SIZE,
        SLOT_GAP,
        PADDING,
        slotsLayer,
        LETTERS,
      });

      // =========================
      // TILES SETUP (moved to ./tiles)
      // =========================
      const { tiles, createTile, placeTileInSlot, returnTileHome } = createTileHelpers({
        SLOT_SIZE,
        tilesLayer,
        textStyle,
        rackPositions,
        hitTestEmptySlot,
        nearestEmptySlot,
        firstAvailableSlot,
      });

      LETTERS.forEach((L, i) => createTile(L, i));
      tilesLayer.sortableChildren = true;

      // =========================
      // RELAYOUT ON RESIZE
      // =========================
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

      // =========================
      // RESET GAME
      // =========================
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

      // =========================
      // SLOT HIGHLIGHT (hover effect)
      // =========================
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
            s.g.tint = 0xc7d2fe; // highlight (Tailwind indigo-200)
          } else {
            s.g.tint = 0xffffff;
          }
        }
      });

      layoutSlots();
    })();

    // --- cleanup
    return () => {
      mounted = false;
      if (app) {
        app.destroy(true);
        app = null;
      }
    };
  }, []);

  return (
    <div className="h-full">
      {/* Pixi canvas mounts here */}
      <div ref={containerRef} className="h-full" />

      {/* Instructions overlay */}
      <div className="absolute bottom-3 left-3 text-slate-200 text-sm opacity-90">
        Drag or flick tiles into slots. Click = first empty slot. Double-click =
        return. Press R to reset.
      </div>
    </div>
  );
}
