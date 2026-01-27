"use client";

import React, { useMemo, useEffect, useState } from "react";
import { Player } from "@/models/player";
import { calculatePoints, formatPoints } from "@/utils/scoring";
import PlayerIcon from "./PlayerIcon";

interface GameEndModalProps {
  players: Player[];
  currentPlayer?: string;
  isLeader?: boolean;
  onPlayAgain?: () => void;
  onLeaveGame?: () => void;
  isVisible: boolean;
}

interface PlayerStats extends Player {
  rank: number;
  bestWord: string | null;
  bestWordScore: number;
  wordsPlayed: number;
}

// Confetti piece component
const ConfettiPiece: React.FC<{ delay: number; color: string }> = ({
  delay,
  color,
}) => {
  const left = Math.random() * 100;
  const size = Math.random() * 10 + 5;

  return (
    <div
      className="absolute animate-confetti"
      style={{
        left: `${left}%`,
        width: size,
        height: size,
        backgroundColor: color,
        animationDelay: `${delay}s`,
        borderRadius: Math.random() > 0.5 ? "50%" : "0",
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  );
};

// Confetti container
const Confetti: React.FC = () => {
  const colors = [
    "#4F46E5", // primary
    "#10B981", // success
    "#F59E0B", // warning
    "#EF4444", // danger
    "#818CF8", // primary-400
    "#34D399", // success-400
  ];

  const pieces = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} delay={piece.delay} color={piece.color} />
      ))}
    </div>
  );
};

const GameEndModal: React.FC<GameEndModalProps> = ({
  players,
  currentPlayer,
  isLeader,
  onPlayAgain,
  onLeaveGame,
  isVisible,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  // Calculate player stats and rankings
  const playerStats: PlayerStats[] = useMemo(() => {
    const stats = players.map((player) => {
      // Find best word
      let bestWord: string | null = null;
      let bestWordScore = 0;

      for (const word of player.word_history || []) {
        const score = calculatePoints(word);
        if (score > bestWordScore) {
          bestWordScore = score;
          bestWord = word;
        }
      }

      return {
        ...player,
        rank: 0,
        bestWord,
        bestWordScore,
        wordsPlayed: player.word_history?.length || 0,
      };
    });

    // Sort by score descending
    stats.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Assign ranks
    stats.forEach((player, index) => {
      player.rank = index + 1;
    });

    return stats;
  }, [players]);

  const winner = playerStats[0];
  const isCurrentPlayerWinner = winner && currentPlayer && winner.username === currentPlayer;

  // Show confetti when modal appears (only for the winner)
  useEffect(() => {
    if (isVisible && isCurrentPlayerWinner) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [isVisible, isCurrentPlayerWinner]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Confetti */}
      {showConfetti && <Confetti />}

      {/* Modal - bottom sheet on mobile, centered on larger screens */}
      <div className="relative z-20 bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:mx-4 max-h-[90vh] overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
          {winner && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16">
                <PlayerIcon icon={winner.icon} />
              </div>
              <div className="text-primary-100">
                <span className="text-2xl font-bold text-white">
                  {winner.username}
                </span>
                <span className="text-lg ml-2">
                  ({formatPoints(winner.score || 0)})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Leaderboard</h3>
          <div className="space-y-3">
            {playerStats.map((player) => (
              <div
                key={player.username}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  player.rank === 1
                    ? "bg-warning-500/20 border border-warning-500/50"
                    : "bg-slate-700/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      player.rank === 1
                        ? "bg-warning-500 text-white"
                        : player.rank === 2
                          ? "bg-slate-400 text-white"
                          : player.rank === 3
                            ? "bg-amber-700 text-white"
                            : "bg-slate-600 text-slate-300"
                    }`}
                  >
                    {player.rank}
                  </div>

                  {/* Player icon */}
                  <div className="w-10 h-10 flex-shrink-0">
                    <PlayerIcon icon={player.icon} />
                  </div>

                  {/* Player info */}
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{player.username}</p>
                    <p className="text-slate-400 text-sm">
                      {player.wordsPlayed} words
                    </p>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-xl font-bold text-white">
                    {player.score || 0}
                  </p>
                  <p className="text-slate-400 text-xs">points</p>
                </div>
              </div>
            ))}
          </div>

          {/* Best Words */}
          {playerStats.some((p) => p.bestWord) && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Best Words
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {playerStats
                  .filter((p) => p.bestWord)
                  .map((player) => (
                    <div
                      key={player.username}
                      className="bg-slate-700/50 rounded-lg p-3"
                    >
                      <p className="text-slate-400 text-xs truncate">
                        {player.username}
                      </p>
                      <p className="text-white font-bold">
                        {player.bestWord?.toUpperCase()}
                      </p>
                      <p className="text-success-400 text-sm">
                        {formatPoints(player.bestWordScore)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions - larger touch targets for mobile */}
        <div className="px-4 pb-6 flex flex-col gap-3">
          {/* Leader can reset everyone to lobby */}
          {isLeader && onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="w-full py-4 bg-emerald-600 active:bg-emerald-500 text-white rounded-xl font-semibold transition-colors text-base"
            >
              Play Again
            </button>
          )}
          {/* Non-leaders see a waiting message */}
          {!isLeader && (
            <p className="text-center text-slate-400 text-sm py-3">
              Waiting for host to start a new game...
            </p>
          )}
          {/* Everyone can leave */}
          {onLeaveGame && (
            <button
              onClick={onLeaveGame}
              className="w-full py-4 bg-slate-700 active:bg-slate-600 text-white rounded-xl font-medium transition-colors text-base"
            >
              Leave Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameEndModal;
