"use client";

import React, { useState, useEffect, useRef } from "react";
import { Player } from "@/models/player";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import PlayerIcon from "./PlayerIcon";

interface LeaderboardProps {
  players: Player[];
  currentPlayer?: string;
  collapsed?: boolean;
  onToggle?: () => void;
  maxPlayers?: number;
}

interface RankedPlayer extends Player {
  rank: number;
  previousScore?: number;
  scoreChanged?: boolean;
  isTied?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  currentPlayer,
  collapsed: controlledCollapsed,
  onToggle,
  maxPlayers = 10,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [rankedPlayers, setRankedPlayers] = useState<RankedPlayer[]>([]);
  const previousScoresRef = useRef<Record<string, number>>({});

  // Use controlled or uncontrolled collapsed state
  const collapsed = controlledCollapsed ?? isCollapsed;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  // Update ranked players when players change
  useEffect(() => {
    const previousScores = previousScoresRef.current;

    // Rank players by score
    const ranked: RankedPlayer[] = players
      .map((player) => ({
        ...player,
        rank: 0,
        previousScore: previousScores[player.username],
        scoreChanged:
          previousScores[player.username] !== undefined &&
          previousScores[player.username] !== (player.score || 0),
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    // Assign ranks (handle ties - same score = same rank)
    ranked.forEach((player, index) => {
      if (index === 0) {
        player.rank = 1;
        player.isTied = false;
      } else {
        const prevPlayer = ranked[index - 1];
        if ((player.score || 0) === (prevPlayer.score || 0)) {
          // Tie - same rank as previous player
          player.rank = prevPlayer.rank;
          player.isTied = true;
          prevPlayer.isTied = true; // Mark previous player as tied too
        } else {
          // Not a tie - rank is position + 1
          player.rank = index + 1;
          player.isTied = false;
        }
      }
    });

    setRankedPlayers(ranked);

    // Update previous scores for next comparison
    const newScores: Record<string, number> = {};
    players.forEach((p) => {
      newScores[p.username] = p.score || 0;
    });
    previousScoresRef.current = newScores;

    // Clear score changed flag after animation
    const timer = setTimeout(() => {
      setRankedPlayers((prev) =>
        prev.map((p) => ({ ...p, scoreChanged: false }))
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [players]);

  if (players.length === 0) {
    return null;
  }

  // Get top N players for display
  const displayPlayers = rankedPlayers.slice(0, maxPlayers);
  const currentPlayerData = rankedPlayers.find(
    (p) => p.username === currentPlayer
  );
  const currentPlayerInTop = displayPlayers.some(
    (p) => p.username === currentPlayer
  );

  // If collapsed, show compact toggle view
  if (collapsed) {
    const topPlayer = rankedPlayers[0];
    return (
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-medium">Scores</span>
          </div>
          <FiChevronDown className="text-slate-400" size={16} />
        </button>
      </div>
    );
  }

  // Expanded sidebar view - compact layout
  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-2 py-1.5 border-b border-slate-700/50">
        <span className="text-slate-400 text-xs font-medium">Leaderboard</span>
      </div>

      {/* Player list */}
      <div className="py-1 space-y-0.5">
        {displayPlayers.map((player) => (
          <div
            key={player.username}
            className={`flex items-center justify-between px-2 py-1 transition-all duration-300 ${
              player.username === currentPlayer
                ? "bg-primary-600/20"
                : ""
            } ${player.scoreChanged ? "highlight-score" : ""}`}
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {/* Rank with tie indicator */}
              <span
                className={`text-xs font-bold w-4 text-center flex-shrink-0 ${
                  player.rank === 1
                    ? "text-yellow-400"
                    : player.rank === 2
                      ? "text-slate-300"
                      : player.rank === 3
                        ? "text-amber-600"
                        : "text-slate-500"
                }`}
              >
                {player.isTied ? `T${player.rank}` : player.rank}
              </span>

              {/* Player icon */}
              <div className="w-5 h-5 flex-shrink-0">
                <PlayerIcon icon={player.icon} />
              </div>

              {/* Player name */}
              <span
                className={`text-xs truncate ${
                  player.username === currentPlayer
                    ? "text-primary-300 font-medium"
                    : "text-white"
                }`}
              >
                {player.username}
              </span>
            </div>

            {/* Score */}
            <span
              className={`text-xs font-bold ml-1 ${
                player.scoreChanged
                  ? "text-success-400 animate-score-pop"
                  : "text-emerald-400"
              }`}
            >
              {player.score || 0}
            </span>
          </div>
        ))}
      </div>

      {/* Show current player if not in top N */}
      {!currentPlayerInTop && currentPlayerData && (
        <div className="px-2 py-1 border-t border-slate-700/50 bg-primary-600/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold w-4 text-center text-slate-500 flex-shrink-0">
                {currentPlayerData.isTied ? `T${currentPlayerData.rank}` : currentPlayerData.rank}
              </span>
              <div className="w-5 h-5 flex-shrink-0">
                <PlayerIcon icon={currentPlayerData.icon} />
              </div>
              <span className="text-xs text-primary-300 font-medium truncate">
                {currentPlayerData.username}
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-400">
              {currentPlayerData.score || 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
