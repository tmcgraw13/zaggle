"use client";

import { useState } from "react";
import { AVAILABLE_ICONS, IconType } from "@/utils/randomIcon";

interface PlayerNameModalProps {
  setUserName: (name: string) => void;
  setUserIcon: (icon: IconType) => void;
  closeModal: () => void;
}

const iconMapping: Record<IconType, string> = {
  dog: "/characters/dog.gif",
  water: "/characters/water.gif",
  fire: "/characters/fire.gif",
  penguin: "/characters/penguin.gif",
  christmas: "/characters/christmas.gif",
  computer: "/characters/computer.gif",
};

const PlayerNameModal: React.FC<PlayerNameModalProps> = ({
  setUserName,
  setUserIcon,
  closeModal,
}) => {
  const [name, setName] = useState<string>("");
  const [selectedIcon, setSelectedIcon] = useState<IconType>("dog");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      setUserName(name);
      setUserIcon(selectedIcon);
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl w-full max-w-sm">
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          Join the Game
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Name input */}
          <div>
            <label className="text-slate-400 text-sm block mb-2">
              Your Name
            </label>
            <input
              type="text"
              className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={12}
              required
            />
          </div>

          {/* Icon selection */}
          <div>
            <label className="text-slate-400 text-sm block mb-3">
              Choose Your Character
            </label>
            <div className="grid grid-cols-3 gap-3">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`p-3 rounded-xl transition-all flex flex-col items-center gap-1 ${
                    selectedIcon === icon
                      ? "bg-indigo-600 ring-2 ring-indigo-400"
                      : "bg-slate-700/50 hover:bg-slate-700"
                  }`}
                >
                  <img
                    src={iconMapping[icon]}
                    alt={icon}
                    className="w-12 h-12 object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-semibold active:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Enter Game
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlayerNameModal;
