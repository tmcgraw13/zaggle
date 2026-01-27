/**
 * Slot management for PixiTileRack.
 *
 * Mobile-first layout:
 * - Word slots at TOP of canvas
 * - Tile rack at BOTTOM of canvas
 * - Large gap for flicking
 */

import * as PIXI from "pixi.js";

export interface Slot {
  graphics: PIXI.Graphics;
  x: number;
  y: number;
  occupiedBy: Tile | null;
  index: number;
}

export interface Tile {
  container: PIXI.Container;
  letter: string;
  home: { x: number; y: number };
  slot: Slot | null;
}

export interface SlotManagerOptions {
  app: PIXI.Application;
  slotSize: number;
  slotGap: number;
  padding: number;
  bottomPadding?: number;
  slotsLayer: PIXI.Container;
  numSlots?: number;
}

export class SlotManager {
  private app: PIXI.Application;
  private slotSize: number;
  private slotGap: number;
  private padding: number;
  private bottomPadding: number;
  private slotsLayer: PIXI.Container;
  private numSlots: number;

  public slots: Slot[] = [];

  constructor(options: SlotManagerOptions) {
    this.app = options.app;
    this.slotSize = options.slotSize;
    this.slotGap = options.slotGap;
    this.padding = options.padding;
    this.bottomPadding = options.bottomPadding ?? options.padding;
    this.slotsLayer = options.slotsLayer;
    this.numSlots = options.numSlots ?? 7;
  }

  /**
   * Get the Y position for word slots (at the top).
   */
  private getSlotsY(): number {
    return this.padding;
  }

  /**
   * Get the Y position for the rack (at the bottom, above the button bar).
   */
  private getRackY(): number {
    return this.app.renderer.height - this.bottomPadding - this.slotSize;
  }

  /**
   * Layout the word slots at the top.
   */
  public layoutSlots(): void {
    this.slots = [];
    this.slotsLayer.removeChildren();

    const totalWidth =
      this.numSlots * this.slotSize + (this.numSlots - 1) * this.slotGap;
    const startX = (this.app.renderer.width - totalWidth) / 2;

    for (let i = 0; i < this.numSlots; i++) {
      const g = new PIXI.Graphics();

      // Slot appearance - dashed border look
      g.roundRect(0, 0, this.slotSize, this.slotSize, 12)
        .fill({ color: 0x334155, alpha: 0.5 }) // slate-700 semi-transparent
        .stroke({ color: 0x64748b, width: 2 }); // slate-500

      g.x = Math.round(startX + i * (this.slotSize + this.slotGap));
      g.y = Math.round(this.getSlotsY());
      g.eventMode = "none";

      this.slotsLayer.addChild(g);

      this.slots.push({
        graphics: g,
        x: g.x,
        y: g.y,
        occupiedBy: null,
        index: i,
      });
    }
  }

  /**
   * Get rack positions for tiles (at the bottom).
   */
  public getRackPositions(count: number): { x: number; y: number }[] {
    const totalWidth = count * this.slotSize + (count - 1) * this.slotGap;
    const startX = (this.app.renderer.width - totalWidth) / 2;

    return Array.from({ length: count }, (_, i) => ({
      x: Math.round(startX + i * (this.slotSize + this.slotGap)),
      y: Math.round(this.getRackY()),
    }));
  }

  /**
   * Hit test for a slot at given position.
   */
  public hitTestSlot(x: number, y: number): Slot | null {
    const tolerance = this.slotSize * 0.3;

    for (const slot of this.slots) {
      const centerX = slot.x + this.slotSize / 2;
      const centerY = slot.y + this.slotSize / 2;

      if (
        Math.abs(x - centerX) <= this.slotSize / 2 + tolerance &&
        Math.abs(y - centerY) <= this.slotSize / 2 + tolerance
      ) {
        return slot;
      }
    }
    return null;
  }

  /**
   * Find the first empty slot.
   */
  public firstAvailableSlot(): Slot | null {
    return this.slots.find((s) => !s.occupiedBy) || null;
  }

  /**
   * Get the word formed by tiles in slots.
   */
  public getWord(): string {
    return this.slots
      .filter((s) => s.occupiedBy)
      .map((s) => s.occupiedBy!.letter)
      .join("");
  }

  /**
   * Get all tiles currently in slots.
   */
  public getTilesInSlots(): Tile[] {
    return this.slots
      .filter((s) => s.occupiedBy)
      .map((s) => s.occupiedBy as Tile);
  }

  /**
   * Clear all slots.
   */
  public clearSlots(): void {
    for (const slot of this.slots) {
      if (slot.occupiedBy) {
        slot.occupiedBy.slot = null;
        slot.occupiedBy = null;
      }
    }
  }

  /**
   * Highlight slots based on validation state.
   */
  public setValidationState(
    state: "neutral" | "valid" | "invalid" | "short"
  ): void {
    const colors = {
      neutral: { fill: 0x334155, stroke: 0x64748b, alpha: 0.5 },
      valid: { fill: 0x065f46, stroke: 0x10b981, alpha: 0.6 }, // green
      invalid: { fill: 0x7f1d1d, stroke: 0xef4444, alpha: 0.5 }, // red
      short: { fill: 0x334155, stroke: 0x94a3b8, alpha: 0.5 }, // gray
    };

    const { fill, stroke, alpha } = colors[state];

    for (const slot of this.slots) {
      slot.graphics.clear();
      slot.graphics
        .roundRect(0, 0, this.slotSize, this.slotSize, 12)
        .fill({ color: fill, alpha })
        .stroke({ color: stroke, width: state === "valid" ? 3 : 2 });
    }
  }

  /**
   * Update dimensions.
   */
  public updateDimensions(
    slotSize: number,
    slotGap: number,
    padding: number,
    bottomPadding?: number
  ): void {
    this.slotSize = slotSize;
    this.slotGap = slotGap;
    this.padding = padding;
    this.bottomPadding = bottomPadding ?? padding;
  }

  /**
   * Get slot size.
   */
  public getSlotSize(): number {
    return this.slotSize;
  }
}
