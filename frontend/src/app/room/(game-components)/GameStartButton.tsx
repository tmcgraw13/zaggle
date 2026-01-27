"use client";

import { useState } from "react";
import { startGame } from "@/services/apiService";
import socket from "@/utils/socket";
import { FiPlay } from "react-icons/fi";

interface GameStartButtonProps {
  roomCode: string;
}

const GameStartButton: React.FC<GameStartButtonProps> = ({ roomCode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const activateStartTime = new Date();
      await startGame(roomCode, activateStartTime);
      socket.emit("start_game", { gameCode: roomCode });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start game";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center mb-6">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="w-full max-w-xs mx-auto flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white text-lg font-semibold rounded-xl shadow-lg active:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Starting...
          </>
        ) : (
          <>
            <FiPlay size={22} />
            Start Game
          </>
        )}
      </button>

      {error && (
        <p className="mt-3 text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
};

export default GameStartButton;
