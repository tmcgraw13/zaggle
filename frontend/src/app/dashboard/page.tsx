"use client";

import GameComponent from "@/components/GameComponent";
import serverUrl from "@/utils/config";

export default function GameDashboard() {
  

  return (
    <div>
      <h1 className="text-2xl mb-4">Welcome to the Game</h1>
      <p>Server URL: {serverUrl}</p>
      <GameComponent/>
    </div>
  );
}
