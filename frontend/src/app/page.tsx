"use client";
import { useState } from "react";
import CreateGame from "./CreateGame";
import JoinGame from "./JoinGame";
import ButtonStandard from "@/components/ButtonStandard";
import ZaggleLogoAnimation from "@/components/ZaggleLogoAnimation";

export default function GameDashboard() {
  const [showComponent, setShowComponent] = useState<"join" | null>(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Welcome to the Game!
      </h1>


      {/* Buttons for creating or joining a game */}
      <div className="flex gap-6 mb-6">
        <CreateGame />
        {showComponent === "join" ? (
          <JoinGame />
        ) : (
          <ButtonStandard
            onButtonClick={() => setShowComponent("join")}
            buttonName="Join Game"
            className="px-6 py-3 bg-green-600 text-white rounded-md shadow-md transition-all duration-300 hover:bg-green-700"
          />
        )}
      </div>
    </div>
  );
}
