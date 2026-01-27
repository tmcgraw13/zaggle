"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";

const JoinGame: React.FC = () => {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState<string>("");

  const handleJoinGame = (): void => {
    if (roomCode.trim()) {
      router.push(`/room/${roomCode.toUpperCase()}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && roomCode.trim()) {
      handleJoinGame();
    }
  };

  const isDisabled = roomCode.trim().length === 0;

  return (
    <div className="w-full bg-slate-800/50 rounded-xl p-4">
      <label className="text-slate-400 text-xs font-medium block mb-2">
        Enter Room Code
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="ABCD"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          maxLength={6}
          className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-center text-lg font-bold tracking-wider placeholder-slate-600 focus:outline-none focus:border-indigo-500 uppercase"
        />
        <button
          onClick={handleJoinGame}
          disabled={isDisabled}
          className="px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold active:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          aria-label="Join"
        >
          <FiArrowRight size={22} />
        </button>
      </div>
    </div>
  );
};

export default JoinGame;
