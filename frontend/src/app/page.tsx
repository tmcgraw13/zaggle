"use client";
import { useState } from "react";
import CreateGame from "./CreateGame";
import JoinGame from "./JoinGame";
import ButtonStandard from "@/components/ButtonStandard";

export default function GameDashboard() {
  const [showComponent, setShowComponent] = useState<"join" | null>(null);

  return (
<div className="h-full flex flex-col">
  {/* Center content horizontally, scroll vertically if needed */}
  <div className="flex flex-col items-center mt-10 mb-10 overflow-auto flex-1 space-y-8">
    <h1 className="text-3xl font-bold text-gray-800">
      Welcome to the Game!
    </h1>

    <div className="flex gap-6">
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
</div>

  );
}

