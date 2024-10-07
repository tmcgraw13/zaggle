"use client";

import { useState } from "react";
import GameComponent from "@/components/GameComponent";
import StartGameButton from "@/components/StartGameButton";
import CountdownTimer from "@/components/CountdownTimer";
import serverUrl from "@/utils/config";

export default function GameDashboard() {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [playerHand, setPlayerHand] = useState<string>(''); // Initialize an empty player hand

  const handleGameStart = () => {
    setGameStarted(true);
  };

  return (
    <div>
      <h1 className="text-2xl mb-4">Welcome to the Game</h1>
      <p>Server URL: {serverUrl}</p>
      {!gameStarted && (
        <StartGameButton
          onGameStart={handleGameStart}
          initialPlayerHand={playerHand}
          setPlayerHand={setPlayerHand}
        />
      )}
      {gameStarted && (
        <div>
          <GameComponent playerHand={playerHand} setPlayerHand={setPlayerHand} />
          <CountdownTimer onStart={handleGameStart} />
        </div>
      )}
    </div>
  );
}
