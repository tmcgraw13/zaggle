"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import PlayerWordHistory from "./PlayerWordHistory";
import { playWord, getWordCount, shuffleHand } from "@/services/apiService";
import { Player } from "@/models/player";
import CountdownTimer from "@/components/CountdownTimer";
import PixiTileRack, { PixiTileRackRef } from "./PixiTileRack";
import { calculatePoints, formatPoints } from "@/utils/scoring";
import socket from "@/utils/socket";

// Point penalty for manual shuffle
const SHUFFLE_PENALTY = 5;

// Difficulty bonus based on available words (fewer words = bigger bonus)
// Free shuffle threshold: 15 words or less
function getDifficultyBonus(wordCount: number): number {
  if (wordCount === 1) return 15;      // Only 1 word possible - huge bonus!
  if (wordCount <= 3) return 10;       // Very limited options
  if (wordCount <= 5) return 7;        // Limited options
  if (wordCount <= 9) return 4;        // Somewhat limited
  if (wordCount <= 15) return 2;       // Slightly limited (free shuffle zone)
  return 0;                            // 16+ words - no bonus
}

interface PlayerActionPanelProps {
  player: Player;
  gameCode: string;
  startTime: string;
}

const PlayerActionPanel: React.FC<PlayerActionPanelProps> = ({
  player,
  gameCode,
  startTime,
}) => {
  const [submittedInputs, setSubmittedInputs] = useState<string[]>(
    player.word_history
  );
  const [message, setMessage] = useState<string>("");
  const [current_player, setPlayer] = useState<Player>(player);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [dictionary, setDictionary] = useState<Set<string>>(new Set());
  const [dictionaryLoaded, setDictionaryLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [wordCount, setWordCount] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  const tileRackRef = useRef<PixiTileRackRef>(null);
  const hasEndedGame = useRef(false);
  const isAutoShuffling = useRef(false);

  // Handle timer expiration
  const handleTimeUp = useCallback(() => {
    if (hasEndedGame.current) return;
    hasEndedGame.current = true;
    setIsTimeUp(true);
    console.log("Time's up! Ending game...");
    socket.emit("end_game", gameCode);
  }, [gameCode]);

  // Reset game state when startTime changes (new game)
  useEffect(() => {
    hasEndedGame.current = false;
    setIsTimeUp(false);
  }, [startTime]);

  // Load dictionary on mount
  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const response = await fetch("/curated_dictionary.json");
        if (!response.ok) {
          throw new Error("Failed to load dictionary");
        }
        const words: string[] = await response.json();
        setDictionary(new Set(words.map((w) => w.toUpperCase())));
        setDictionaryLoaded(true);
        console.log(`Dictionary loaded: ${words.length} words`);
      } catch (err) {
        console.error("Failed to load dictionary:", err);
        // Fallback: still allow gameplay, server will validate
        setDictionaryLoaded(true);
      }
    };

    loadDictionary();
  }, []);

  // Handle word submission from PixiTileRack
  const handleWordSubmit = useCallback(
    async (word: string) => {
      if (isSubmitting || isTimeUp) return;

      setIsSubmitting(true);
      setError(null);

      // Calculate difficulty bonus before submission (based on current word count)
      const difficultyBonus = wordCount !== null ? getDifficultyBonus(wordCount) : 0;

      try {
        const result = await playWord(word.toLowerCase(), current_player, gameCode, difficultyBonus);

        if (result.message === "Valid word") {
          const basePoints = calculatePoints(word);
          const totalPoints = basePoints + difficultyBonus;

          // Show points with bonus if applicable
          if (difficultyBonus > 0) {
            setMessage(`+${formatPoints(basePoints)} +${difficultyBonus} bonus!`);
          } else {
            setMessage(`+${formatPoints(basePoints)}`);
          }

          console.log("New player data from server:", result.player);
          console.log("New hand:", result.player.hand);
          setPlayer(result.player);
          setSubmittedInputs((prev) => [...prev, word.toUpperCase()]);

          // Clear the tile rack
          tileRackRef.current?.clearWord();

          // Notify other players of score update
          socket.emit("score_update", { gameCode });
        } else {
          setMessage(result.message);
          // Shake the tiles for invalid word
          tileRackRef.current?.shakeInvalidWord();
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
        tileRackRef.current?.shakeInvalidWord();
      } finally {
        setIsSubmitting(false);
      }
    },
    [current_player, gameCode, isSubmitting, isTimeUp, wordCount]
  );

  // Handle word change (for real-time feedback)
  const handleWordChange = useCallback(
    (word: string, isValid: boolean, points: number) => {
      // Clear previous message when word changes
      if (word.length === 0) {
        setMessage("");
      }
    },
    []
  );

  // Update current_player when player prop changes
  useEffect(() => {
    setPlayer(player);
    setSubmittedInputs(player.word_history);
  }, [player]);

  // Perform shuffle (with or without penalty)
  const performShuffle = useCallback(async (withPenalty: boolean) => {
    if (isShuffling || isTimeUp) return;

    setIsShuffling(true);
    try {
      const result = await shuffleHand(gameCode, current_player.username, withPenalty);
      if (result.player) {
        setPlayer(result.player);

        // Show appropriate message
        if (result.penalty_applied) {
          setMessage(`-${result.penalty_amount} pts (shuffle)`);
        } else {
          setMessage("Auto-shuffled!");
        }

        // Clear the tile rack
        tileRackRef.current?.clearWord();

        // Notify other players of score update
        socket.emit("score_update", { gameCode });
      }
    } catch (err) {
      console.error("Failed to shuffle hand:", err);
      setError("Failed to shuffle letters");
    } finally {
      setIsShuffling(false);
      isAutoShuffling.current = false;
    }
  }, [gameCode, current_player.username, isShuffling, isTimeUp]);

  // Fetch word count when hand changes and auto-shuffle if no words possible
  useEffect(() => {
    const fetchWordCount = async () => {
      if (!current_player.hand || current_player.hand.length === 0) {
        setWordCount(null);
        return;
      }

      // Skip if already auto-shuffling
      if (isAutoShuffling.current) return;

      try {
        const result = await getWordCount(current_player.hand);
        setWordCount(result.count);
        console.log(`Word count for hand: ${result.count}`, result.sample_words);

        // Auto-shuffle if no words possible (no penalty)
        if (result.count === 0 && !isTimeUp && !isShuffling) {
          console.log("No words possible - auto-shuffling...");
          isAutoShuffling.current = true;
          performShuffle(false); // false = no penalty
        }
      } catch (err) {
        console.error("Failed to get word count:", err);
        setWordCount(null);
      }
    };

    fetchWordCount();
  }, [current_player.hand, isTimeUp, isShuffling, performShuffle]);

  // Handle manual shuffle button click (free if <= 15 words, otherwise penalty)
  const handleShuffle = useCallback(async () => {
    if (isShuffling || isTimeUp) return;
    const applyPenalty = wordCount !== null && wordCount > 15;
    await performShuffle(applyPenalty);
  }, [performShuffle, isShuffling, isTimeUp, wordCount]);

  if (!dictionaryLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900 overflow-hidden">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dictionary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 relative">
      {/* Top bar: Timer + Message + Score - optimized for mobile */}
      <div className="flex items-center justify-between px-3 py-3 bg-slate-800/50 gap-2">
        {/* Timer */}
        <div className="w-12 h-12 flex-shrink-0">
          <CountdownTimer startTime={startTime} onTimeUp={handleTimeUp} />
        </div>

        {/* Center: Message + Word count + Bonus */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0">
          {message ? (
            <p
              className={`text-base sm:text-lg font-bold truncate ${
                message.startsWith("+")
                  ? "text-emerald-400"
                  : message.startsWith("-")
                  ? "text-red-400"
                  : "text-amber-400"
              }`}
            >
              {message}
            </p>
          ) : error ? (
            <p className="text-xs text-red-400 truncate">{error}</p>
          ) : null}

          {/* Word count + bonus inline */}
          {wordCount !== null && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-xs font-medium ${
                  wordCount === 0
                    ? "text-red-400 animate-pulse"
                    : wordCount <= 5
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {wordCount === 0
                  ? "Shuffling..."
                  : wordCount === 1
                  ? "1 word"
                  : `${wordCount}+ words`}
              </span>
              {wordCount > 0 && wordCount <= 15 && (
                <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/20 px-1.5 py-0.5 rounded-full">
                  +{getDifficultyBonus(wordCount)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Score + Shuffle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Shuffle button - compact */}
          {wordCount !== null && wordCount > 0 && !isTimeUp && (
            <button
              onClick={handleShuffle}
              disabled={isShuffling}
              className={`w-9 h-9 flex items-center justify-center rounded-full
                         disabled:opacity-50 text-white transition-colors text-lg
                         ${wordCount <= 15
                           ? "bg-emerald-600 active:bg-emerald-500"
                           : "bg-slate-600 active:bg-slate-500"}`}
              title={wordCount <= 15 ? "Free shuffle!" : `Shuffle costs ${SHUFFLE_PENALTY} points`}
              aria-label={wordCount <= 15 ? "Free shuffle" : `Shuffle (-${SHUFFLE_PENALTY}pts)`}
            >
              {isShuffling ? "..." : "\u{1F500}"}
            </button>
          )}

          {/* Score */}
          <div className="text-right min-w-[50px]">
            <p className="text-xl sm:text-2xl font-bold text-white leading-none">
              {current_player.score ?? 0}
            </p>
            <p className="text-[10px] text-slate-400">pts</p>
          </div>
        </div>
      </div>

      {/* PixiTileRack - takes all remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <PixiTileRack
          ref={tileRackRef}
          hand={current_player.hand || []}
          dictionary={dictionary}
          onWordSubmit={handleWordSubmit}
          onWordChange={handleWordChange}
          disabled={isSubmitting || isTimeUp}
        />
      </div>

      {/* Time's up overlay */}
      {isTimeUp && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-30">
          <div className="text-center">
            <p className="text-3xl font-bold text-white mb-2">Time&apos;s Up!</p>
            <p className="text-slate-400">Calculating results...</p>
          </div>
        </div>
      )}

      {/* Word history button - bottom right, above tile rack */}
      <button
        type="button"
        className="absolute bottom-4 right-4 bg-slate-700/90 active:bg-slate-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg z-20"
        onClick={() => setShowHistory(true)}
        aria-label="Show word history"
      >
        <AiOutlineInfoCircle size={22} />
      </button>

      {/* Word history modal - mobile optimized */}
      {showHistory && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="bg-slate-800 rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-sm max-h-[70vh] relative animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar for mobile sheet */}
            <div className="sm:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-slate-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white">Word History</h2>
              <button
                type="button"
                className="text-slate-400 active:text-white w-8 h-8 flex items-center justify-center rounded-full"
                onClick={() => setShowHistory(false)}
                aria-label="Close"
              >
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(70vh-80px)]">
              {submittedInputs.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No words played yet</p>
              ) : (
                <div className="space-y-2">
                  {submittedInputs.map((word, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-slate-700/50 rounded-lg px-4 py-3"
                    >
                      <span className="text-white font-semibold text-base">
                        {word.toUpperCase()}
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {formatPoints(calculatePoints(word))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerActionPanel;
