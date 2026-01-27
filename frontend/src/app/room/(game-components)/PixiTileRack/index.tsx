"use client";

/**
 * PixiTileRack - Mobile-friendly drag-and-drop tile rack for Zaggle.
 *
 * Layout:
 * - Word slots at TOP
 * - Letter tiles at BOTTOM
 * - Flick up to place, tap to return
 */

import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as PIXI from "pixi.js";
import { SlotManager } from "./SlotManager";
import { TileManager } from "./TileManager";
import { calculatePoints, formatPoints } from "@/utils/scoring";

export interface PixiTileRackProps {
  hand: string[];
  dictionary: Set<string>;
  onWordSubmit: (word: string) => void;
  onWordChange?: (word: string, isValid: boolean, points: number) => void;
  disabled?: boolean;
}

export interface PixiTileRackRef {
  clearWord: () => void;
  shakeInvalidWord: () => void;
  getWord: () => string;
}

// Alphabet for wildcard substitution
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Check if a word with wildcards (_) matches any word in the dictionary.
 * Tries all possible letter combinations for wildcards.
 */
function checkWildcardWord(
  word: string,
  dictionary: Set<string>,
  onMatch?: (matched: string) => void
): boolean {
  const wildcardIndices: number[] = [];
  for (let i = 0; i < word.length; i++) {
    if (word[i] === "_") {
      wildcardIndices.push(i);
    }
  }

  if (wildcardIndices.length === 0) {
    return dictionary.has(word);
  }

  // Generate all possible combinations
  const chars = word.split("");

  function tryAllCombinations(index: number): boolean {
    if (index >= wildcardIndices.length) {
      const candidate = chars.join("");
      if (dictionary.has(candidate)) {
        onMatch?.(candidate);
        return true;
      }
      return false;
    }

    const wildcardPos = wildcardIndices[index];
    for (const letter of ALPHABET) {
      chars[wildcardPos] = letter;
      if (tryAllCombinations(index + 1)) {
        return true;
      }
    }
    chars[wildcardPos] = "_"; // Reset
    return false;
  }

  return tryAllCombinations(0);
}

// Get responsive tile size
function getTileSize(): number {
  if (typeof window === "undefined") return 56;
  const width = window.innerWidth;
  // Scale tile size based on screen width
  if (width < 360) return 44;
  if (width < 400) return 48;
  if (width < 500) return 52;
  return 56;
}

const PixiTileRack = forwardRef<PixiTileRackRef, PixiTileRackProps>(
  ({ hand, dictionary, onWordSubmit, onWordChange, disabled = false }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const slotManagerRef = useRef<SlotManager | null>(null);
    const tileManagerRef = useRef<TileManager | null>(null);
    const [currentWord, setCurrentWord] = useState("");
    const [isValidWord, setIsValidWord] = useState(false);
    const [points, setPoints] = useState(0);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      clearWord: () => {
        tileManagerRef.current?.returnAllTilesHome();
        slotManagerRef.current?.clearSlots();
        setCurrentWord("");
        setIsValidWord(false);
        setPoints(0);
      },
      shakeInvalidWord: () => {
        tileManagerRef.current?.shakeTilesInSlots();
        slotManagerRef.current?.setValidationState("invalid");
        setTimeout(() => {
          slotManagerRef.current?.setValidationState("neutral");
        }, 300);
      },
      getWord: () => {
        return tileManagerRef.current?.getWord() || "";
      },
    }));

    // Handle word change from tile manager
    const handleWordChange = useCallback(
      (word: string) => {
        setCurrentWord(word);

        if (word.length === 0) {
          setIsValidWord(false);
          setPoints(0);
          slotManagerRef.current?.setValidationState("neutral");
          onWordChange?.(word, false, 0);
          return;
        }

        if (word.length < 3) {
          setIsValidWord(false);
          setPoints(0);
          slotManagerRef.current?.setValidationState("short");
          onWordChange?.(word, false, 0);
          return;
        }

        // Check if word contains wildcards
        const upperWord = word.toUpperCase();
        const hasWildcard = upperWord.includes("_");

        let valid = false;
        let matchedWord = upperWord;

        if (hasWildcard) {
          // Try all possible letter combinations for wildcards
          valid = checkWildcardWord(upperWord, dictionary, (matched) => {
            matchedWord = matched;
          });
        } else {
          valid = dictionary.has(upperWord);
        }

        const wordPoints = valid ? calculatePoints(matchedWord) : 0;

        setIsValidWord(valid);
        setPoints(wordPoints);

        slotManagerRef.current?.setValidationState(valid ? "valid" : "invalid");
        onWordChange?.(word, valid, wordPoints);
      },
      [dictionary, onWordChange]
    );

    // Initialize Pixi app
    useEffect(() => {
      if (!containerRef.current) return;

      const container = containerRef.current;

      // Clear any existing canvas (handles React Strict Mode double-mount)
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      // Clean up any existing app
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }

      const SLOT_SIZE = getTileSize();
      const SLOT_GAP = Math.round(SLOT_SIZE * 0.15);

      // Create Pixi application
      const app = new PIXI.Application();
      let mounted = true;

      const initApp = async () => {
        const width = container.clientWidth;
        const height = container.clientHeight || 300;

        await app.init({
          width,
          height,
          backgroundAlpha: 0,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
          antialias: true,
        });

        // Check if component was unmounted during async init
        if (!mounted) {
          app.destroy(true, { children: true });
          return;
        }

        container.appendChild(app.canvas as HTMLCanvasElement);
        appRef.current = app;

        // Enable stage interactivity
        app.stage.eventMode = "static";
        app.stage.hitArea = app.screen;

        // Create layers
        const slotsLayer = new PIXI.Container();
        const tilesLayer = new PIXI.Container();
        tilesLayer.sortableChildren = true;

        app.stage.addChild(slotsLayer, tilesLayer);

        // Create slot manager - leave 180px at bottom for fixed button bar + extra safety margin
        const slotManager = new SlotManager({
          app,
          slotSize: SLOT_SIZE,
          slotGap: SLOT_GAP,
          padding: 20,
          bottomPadding: 180,
          slotsLayer,
        });

        slotManager.layoutSlots();
        slotManagerRef.current = slotManager;

        // Create tile manager
        const tileManager = new TileManager({
          slotSize: SLOT_SIZE,
          tilesLayer,
          slotManager,
          onWordChange: handleWordChange,
        });

        tileManagerRef.current = tileManager;

        // Create tiles for initial hand
        if (hand.length > 0) {
          const rackPositions = slotManager.getRackPositions(hand.length);
          tileManager.createTiles(hand, rackPositions);
        }
      };

      initApp();

      // Handle resize
      const handleResize = () => {
        if (!appRef.current || !containerRef.current) return;

        const SLOT_SIZE = getTileSize();
        const SLOT_GAP = Math.round(SLOT_SIZE * 0.15);
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight || 300;

        appRef.current.renderer.resize(width, height);

        // Update stage hit area
        appRef.current.stage.hitArea = appRef.current.screen;

        if (slotManagerRef.current) {
          slotManagerRef.current.updateDimensions(SLOT_SIZE, SLOT_GAP, 20, 180);
          slotManagerRef.current.layoutSlots();
        }

        if (tileManagerRef.current && slotManagerRef.current) {
          tileManagerRef.current.updateDimensions(SLOT_SIZE);
          const rackPositions = slotManagerRef.current.getRackPositions(hand.length);
          tileManagerRef.current.createTiles(hand, rackPositions);
        }
      };

      window.addEventListener("resize", handleResize);

      // Also listen to visualViewport for Safari's dynamic bars
      const visualViewport = window.visualViewport;
      if (visualViewport) {
        visualViewport.addEventListener("resize", handleResize);
      }

      return () => {
        mounted = false;
        window.removeEventListener("resize", handleResize);
        if (visualViewport) {
          visualViewport.removeEventListener("resize", handleResize);
        }
        if (appRef.current) {
          appRef.current.destroy(true, { children: true });
          appRef.current = null;
        }
        slotManagerRef.current = null;
        tileManagerRef.current = null;
      };
    }, []);

    // Update tiles when hand changes
    useEffect(() => {
      if (!tileManagerRef.current || !slotManagerRef.current) return;

      console.log("Hand updated:", hand);
      const rackPositions = slotManagerRef.current.getRackPositions(hand.length);
      tileManagerRef.current.createTiles(hand, rackPositions);

      // Reset state
      setCurrentWord("");
      setIsValidWord(false);
      setPoints(0);
      slotManagerRef.current.setValidationState("neutral");
    }, [hand]);

    // Handle submit button click
    const handleSubmit = useCallback(() => {
      if (!isValidWord || disabled) return;
      onWordSubmit(currentWord);
    }, [currentWord, isValidWord, disabled, onWordSubmit]);

    // Handle clear button click
    const handleClear = useCallback(() => {
      tileManagerRef.current?.returnAllTilesHome();
      slotManagerRef.current?.clearSlots();
      setCurrentWord("");
      setIsValidWord(false);
      setPoints(0);
      slotManagerRef.current?.setValidationState("neutral");
    }, []);

    return (
      <>
        {/* Pixi canvas container */}
        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ touchAction: "none" }}
        />

        {/* Fixed bottom bar - always visible */}
        <div
          className="fixed left-0 right-0 bottom-0 bg-slate-800 z-50"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {/* Word validation display */}
          <div className="flex items-center justify-center gap-2 py-2">
            {currentWord.length > 0 ? (
              <>
                <span
                  className={`text-lg font-bold ${
                    isValidWord ? "text-emerald-400" : "text-slate-400"
                  }`}
                >
                  {currentWord}
                </span>
                {isValidWord && (
                  <span className="text-emerald-400 font-bold">
                    {formatPoints(points)}
                  </span>
                )}
                {!isValidWord && currentWord.length >= 3 && (
                  <span className="text-red-400 text-sm">✗</span>
                )}
              </>
            ) : (
              <span className="text-slate-500 text-sm">Tap or flick tiles</span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-3 px-4 pb-4">
            <button
              onClick={handleClear}
              disabled={currentWord.length === 0}
              className="px-6 py-3 bg-slate-600 text-white text-base rounded-xl font-medium
                         disabled:opacity-30 disabled:cursor-not-allowed
                         active:bg-slate-500 transition-colors min-w-[100px]"
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValidWord || disabled}
              className="px-8 py-3 bg-emerald-600 text-white text-base rounded-xl font-bold
                         disabled:opacity-30 disabled:cursor-not-allowed
                         active:bg-emerald-500 transition-colors min-w-[120px]"
            >
              Submit
            </button>
          </div>
        </div>
      </>
    );
  }
);

PixiTileRack.displayName = "PixiTileRack";

export default PixiTileRack;
