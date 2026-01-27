"use client";
import { useState } from "react";
import CreateGame from "./CreateGame";
import JoinGame from "./JoinGame";
import ZaggleLogoAnimation from "@/components/ZaggleLogoAnimation";
import { FiPlus, FiUsers } from "react-icons/fi";

export default function GameDashboard() {
  const [showJoin, setShowJoin] = useState(false);

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-8 bg-slate-900">
      {/* Logo */}
      <div className="mb-8">
        <ZaggleLogoAnimation />
      </div>

      {/* Tagline */}
      <p className="text-slate-400 text-center mb-8 max-w-xs">
        The fast-paced word game. Create words, score points, beat your friends!
      </p>

      {/* Action Buttons */}
      <div className="w-full max-w-xs space-y-3">
        <CreateGame />

        {showJoin ? (
          <JoinGame />
        ) : (
          <button
            onClick={() => setShowJoin(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-700 text-white rounded-xl font-semibold active:bg-slate-600 transition-all"
          >
            <FiUsers size={20} />
            Join Game
          </button>
        )}
      </div>

      {/* Footer */}
      <p className="mt-12 text-slate-600 text-xs">
        1 minute rounds. Unlimited fun.
      </p>
    </div>
  );
}

