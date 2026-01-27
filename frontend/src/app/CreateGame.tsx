"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { generateFourRandomLetters } from "@/utils/randomLetterGenerator";
import { FiPlus } from "react-icons/fi";

const CreateGame: React.FC = () => {
  const router = useRouter();

  const handleCreateGame = (): void => {
    const roomCode: string = generateFourRandomLetters();
    router.push(`/room/${roomCode}`);
  };

  return (
    <button
      onClick={handleCreateGame}
      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-xl font-semibold active:bg-emerald-500 transition-all"
    >
      <FiPlus size={20} />
      Create Game
    </button>
  );
};

export default CreateGame;
