"use client"; // Add this at the top of your file

import { useState } from "react";
import GameComponent from "@/components/GameComponent";
import StartGameButton from "@/components/StartGameButton";
import CountdownTimer from "@/components/CountdownTimer";
import serverUrl from "@/utils/config";
import MultiplayerGame from "@/components/MultiplayerGame";

export default function GameDashboard() {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [playerHand, setPlayerHand] = useState<string>(''); // Initialize an empty player hand
  const [startTime, setStartTime] = useState<Date | null>(null);

  const handleGameStart = () => {
    setGameStarted(true);
    setStartTime(new Date()); // Capture the current date and time
  };

  return (
    <div>
      <h1 className="text-2xl mb-4">Welcome to the Game</h1>
      <MultiplayerGame/>
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
          {startTime && <CountdownTimer startTime={startTime} />}
        </div>
      )}
    </div>
  );
}
