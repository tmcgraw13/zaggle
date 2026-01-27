/**
 * Tile management for PixiTileRack.
 *
 * Mobile-friendly interactions:
 * - TAP tile in rack → place in first slot
 * - TAP tile in slot → return to rack
 * - DRAG tile → drop on slot or return home
 * - FLICK UP → place in first slot
 * - FLICK DOWN → return to rack
 */

import * as PIXI from "pixi.js";
import { Slot, SlotManager } from "./SlotManager";
import { getLetterValue } from "@/utils/scoring";

export interface Tile {
  container: PIXI.Container;
  graphics: PIXI.Graphics;
  letterText: PIXI.Text;
  pointsText: PIXI.Text;
  letter: string;
  home: { x: number; y: number };
  slot: Slot | null;
}

export interface TileManagerOptions {
  slotSize: number;
  tilesLayer: PIXI.Container;
  slotManager: SlotManager;
  onWordChange?: (word: string) => void;
}

export class TileManager {
  private slotSize: number;
  private tilesLayer: PIXI.Container;
  private slotManager: SlotManager;
  private onWordChange?: (word: string) => void;

  public tiles: Tile[] = [];

  constructor(options: TileManagerOptions) {
    this.slotSize = options.slotSize;
    this.tilesLayer = options.tilesLayer;
    this.slotManager = options.slotManager;
    this.onWordChange = options.onWordChange;
  }

  /**
   * Create tiles for the given letters.
   */
  public createTiles(
    letters: string[],
    rackPositions: { x: number; y: number }[]
  ): void {
    // Clear existing tiles
    this.clearTiles();

    // Create new tiles
    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i].toUpperCase();
      const home = rackPositions[i];
      this.createTile(letter, home);
    }
  }

  /**
   * Create a single tile.
   */
  private createTile(letter: string, home: { x: number; y: number }): Tile {
    const container = new PIXI.Container();

    // Tile background
    const graphics = new PIXI.Graphics();
    graphics
      .roundRect(0, 0, this.slotSize, this.slotSize, 12)
      .fill({ color: 0xfef3c7 }) // amber-100
      .stroke({ color: 0xf59e0b, width: 3 }); // amber-500

    // Main letter text style
    const textStyle = new PIXI.TextStyle({
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: Math.round(this.slotSize * 0.5),
      fontWeight: "bold",
      fill: 0x1f2937, // gray-800
    });

    // Letter text
    const letterText = new PIXI.Text({ text: letter, style: textStyle });
    letterText.anchor.set(0.5);
    letterText.x = this.slotSize / 2;
    letterText.y = this.slotSize / 2 - 2;

    // Point value
    const pointsStyle = new PIXI.TextStyle({
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: Math.round(this.slotSize * 0.22),
      fontWeight: "600",
      fill: 0x78716c, // stone-500
    });

    const pointValue = getLetterValue(letter);
    const pointsText = new PIXI.Text({
      text: pointValue.toString(),
      style: pointsStyle,
    });
    pointsText.anchor.set(1, 1);
    pointsText.x = this.slotSize - 6;
    pointsText.y = this.slotSize - 4;

    container.addChild(graphics, letterText, pointsText);
    container.cursor = "pointer";
    container.eventMode = "static";
    container.zIndex = 1;
    container.position.set(home.x, home.y);

    this.tilesLayer.addChild(container);

    const tile: Tile = {
      container,
      graphics,
      letterText,
      pointsText,
      letter,
      home: { ...home },
      slot: null,
    };

    this.setupTileInteraction(tile);
    this.tiles.push(tile);

    return tile;
  }

  /**
   * Setup interactions for a tile.
   */
  private setupTileInteraction(tile: Tile): void {
    const container = tile.container;
    let dragging = false;
    let dragStart = { x: 0, y: 0, time: 0 };
    let dragOffset = { x: 0, y: 0 };
    let hasMoved = false;

    // Pointer down - start potential drag
    container.on("pointerdown", (e: PIXI.FederatedPointerEvent) => {
      dragging = true;
      hasMoved = false;
      container.zIndex = 100;

      const pos = e.global;
      dragStart = { x: pos.x, y: pos.y, time: performance.now() };
      dragOffset = { x: pos.x - container.x, y: pos.y - container.y };

      // Visual feedback
      container.scale.set(1.1);
    });

    // Pointer move - drag
    container.on("globalpointermove", (e: PIXI.FederatedPointerEvent) => {
      if (!dragging) return;

      const pos = e.global;
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;

      // Only start actual movement after threshold
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasMoved = true;
        container.position.set(pos.x - dragOffset.x, pos.y - dragOffset.y);
      }
    });

    // Pointer up - handle drop or tap
    const handlePointerUp = (e: PIXI.FederatedPointerEvent) => {
      if (!dragging) return;
      dragging = false;
      container.zIndex = 1;
      container.scale.set(1);

      const pos = e.global;
      const dt = performance.now() - dragStart.time;
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;

      // Calculate velocity for flick detection
      const vx = dt > 0 ? (dx / dt) * 1000 : 0;
      const vy = dt > 0 ? (dy / dt) * 1000 : 0;

      // FLICK UP - place in slot (negative Y = up)
      if (vy < -400 && Math.abs(vy) > Math.abs(vx)) {
        this.handleFlickUp(tile);
        return;
      }

      // FLICK DOWN - return to rack
      if (vy > 400 && Math.abs(vy) > Math.abs(vx)) {
        this.handleFlickDown(tile);
        return;
      }

      // TAP (no significant movement)
      if (!hasMoved && dt < 300) {
        this.handleTap(tile);
        return;
      }

      // DRAG DROP - check if dropped on a slot
      if (hasMoved) {
        this.handleDragDrop(tile, container.x + this.slotSize / 2, container.y + this.slotSize / 2);
      }
    };

    container.on("pointerup", handlePointerUp);
    container.on("pointerupoutside", handlePointerUp);
  }

  /**
   * Handle tap on tile - toggle between rack and slot.
   */
  private handleTap(tile: Tile): void {
    if (tile.slot) {
      // Tile is in slot - return to rack
      tile.slot.occupiedBy = null;
      tile.slot = null;
      this.animateTo(tile.container, tile.home);
    } else {
      // Tile is in rack - place in first available slot
      const slot = this.slotManager.firstAvailableSlot();
      if (slot) {
        this.placeTileInSlot(tile, slot);
      }
    }
    this.notifyWordChange();
  }

  /**
   * Handle flick up - place in first available slot.
   */
  private handleFlickUp(tile: Tile): void {
    // Release from current slot if any
    if (tile.slot) {
      tile.slot.occupiedBy = null;
      tile.slot = null;
    }

    const slot = this.slotManager.firstAvailableSlot();
    if (slot) {
      this.placeTileInSlot(tile, slot);
    } else {
      this.animateTo(tile.container, tile.home);
    }
    this.notifyWordChange();
  }

  /**
   * Handle flick down - return to rack.
   */
  private handleFlickDown(tile: Tile): void {
    if (tile.slot) {
      tile.slot.occupiedBy = null;
      tile.slot = null;
    }
    this.animateTo(tile.container, tile.home);
    this.notifyWordChange();
  }

  /**
   * Handle drag drop - place in slot or return home.
   */
  private handleDragDrop(tile: Tile, x: number, y: number): void {
    // Release from current slot if any
    if (tile.slot) {
      tile.slot.occupiedBy = null;
      tile.slot = null;
    }

    // Check if dropped on an empty slot
    const slot = this.slotManager.hitTestSlot(x, y);
    if (slot && !slot.occupiedBy) {
      this.placeTileInSlot(tile, slot);
    } else {
      // Return to rack
      this.animateTo(tile.container, tile.home);
    }
    this.notifyWordChange();
  }

  /**
   * Place a tile in a slot.
   */
  private placeTileInSlot(tile: Tile, slot: Slot): void {
    slot.occupiedBy = tile;
    tile.slot = slot;
    this.animateTo(tile.container, { x: slot.x, y: slot.y });
  }

  /**
   * Animate container to position.
   */
  private animateTo(
    container: PIXI.Container,
    to: { x: number; y: number }
  ): void {
    const from = { x: container.x, y: container.y };
    const duration = 150;
    const start = performance.now();

    const animate = () => {
      if (!container || container.destroyed) return;

      const elapsed = performance.now() - start;
      const t = Math.min(elapsed / duration, 1);

      // Ease out quad
      const ease = 1 - (1 - t) * (1 - t);

      container.x = from.x + (to.x - from.x) * ease;
      container.y = from.y + (to.y - from.y) * ease;

      if (t < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Return all tiles to their home positions.
   */
  public returnAllTilesHome(): void {
    for (const tile of this.tiles) {
      if (tile.slot) {
        tile.slot.occupiedBy = null;
        tile.slot = null;
      }
      this.animateTo(tile.container, tile.home);
    }
    this.notifyWordChange();
  }

  /**
   * Shake tiles in slots (invalid word feedback).
   */
  public shakeTilesInSlots(): void {
    const tilesInSlots = this.slotManager.getTilesInSlots();
    for (const tile of tilesInSlots) {
      this.shake(tile.container);
    }
  }

  /**
   * Shake animation.
   */
  private shake(container: PIXI.Container): void {
    const originalX = container.x;
    const duration = 300;
    const start = performance.now();

    const animate = () => {
      if (!container || container.destroyed) return;

      const elapsed = performance.now() - start;
      const t = elapsed / duration;

      if (t < 1) {
        const decay = 1 - t;
        const offset = Math.sin(t * Math.PI * 6) * 6 * decay;
        container.x = originalX + offset;
        requestAnimationFrame(animate);
      } else {
        container.x = originalX;
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Clear all tiles.
   */
  public clearTiles(): void {
    for (const tile of this.tiles) {
      if (tile.container && !tile.container.destroyed) {
        this.tilesLayer.removeChild(tile.container);
        tile.container.destroy({ children: true });
      }
    }
    this.tiles = [];
  }

  /**
   * Update dimensions.
   */
  public updateDimensions(slotSize: number): void {
    this.slotSize = slotSize;
  }

  /**
   * Notify word change.
   */
  private notifyWordChange(): void {
    if (this.onWordChange) {
      const word = this.slotManager.getWord();
      this.onWordChange(word);
    }
  }

  /**
   * Get the current word.
   */
  public getWord(): string {
    return this.slotManager.getWord();
  }
}
