import React from "react";
import PlayerIcon from "./PlayerIcon";
import { Player } from "@/models/player";
import { FiEdit2 } from "react-icons/fi";

interface PlayersInLobbyProps {
  players: Player[];
  isLeader: boolean;
  currentPlayer?: string;
  onEditProfile?: () => void;
}

const PlayersInLobby: React.FC<PlayersInLobbyProps> = ({
  players,
  isLeader,
  currentPlayer,
  onEditProfile,
}) => {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
      <h3 className="text-slate-400 text-sm font-medium mb-3 text-center">
        Players ({players.length})
      </h3>
      <div className="flex flex-wrap justify-center gap-3">
        {players.map((player, index) => {
          const isCurrentPlayer = player.username === currentPlayer;

          return (
            <div
              key={index}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                player.isLeader
                  ? "bg-indigo-600/30 border border-indigo-500/50"
                  : "bg-slate-700/50"
              }`}
            >
              <div className="relative">
                <div className="w-8 h-8">
                  <PlayerIcon icon={player.icon} />
                </div>
                {/* Edit button for current player */}
                {isCurrentPlayer && onEditProfile && (
                  <button
                    onClick={onEditProfile}
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center active:bg-indigo-500"
                    title="Edit profile"
                  >
                    <FiEdit2 size={10} className="text-white" />
                  </button>
                )}
              </div>
              <span className="text-white font-medium">{player.username}</span>
              {player.isLeader && (
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/30 px-1.5 py-0.5 rounded">
                  HOST
                </span>
              )}
              {isCurrentPlayer && !player.isLeader && (
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/30 px-1.5 py-0.5 rounded">
                  YOU
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayersInLobby;
