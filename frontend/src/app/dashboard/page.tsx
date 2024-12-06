"use client";
import { useState } from "react";
import serverUrl from "@/utils/config";
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

      {/* Zaggle Logo Animation with border */}
      <div
        className="mb-8 border-4 border-dashed border-gray-300 rounded-lg p-4"
        style={{
          padding: 0,
          height: "150px", // Match the height of the parent container
          width: "500px", // Make the width dynamic, it will take the full width of the parent
        }}
      >
        <ZaggleLogoAnimation />
      </div>

      {/* Buttons for creating or joining a game */}
      <div className="flex gap-6 mb-6">
        <CreateGame />
        <ButtonStandard
          onButtonClick={() => setShowComponent("join")}
          buttonName="Join Game"
          className="px-6 py-3 bg-green-600 text-white rounded-md shadow-md transition-all duration-300 hover:bg-green-700"
        />
      </div>

      <p className="text-center text-sm text-gray-600 mb-4">
        Server URL: {serverUrl}
      </p>

      {/* Display Join Game component */}
      <div className="mt-4 w-full max-w-md">
        {showComponent === "join" && <JoinGame />}
      </div>
    </div>
  );
}
