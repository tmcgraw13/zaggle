import React, { useState, useEffect } from "react";
import GameComponent from "./GameComponent";
import StartGameButton from "./StartGameButton";
import socket from "@/utils/socket";
import CountdownTimer from "@/components/CountdownTimer";

interface MultiplayerGameProps {
  gameCode: string;
  userName: string;
}
interface Player {
  username: string;
  score: number;
  hand: string[]; // Assuming hand is an array of strings
  word_history: string[]; // Assuming word_history is an array of strings
  isLeader: boolean;
}

function MultiplayerGame({ userName, gameCode }: MultiplayerGameProps) {
  const [players, setPlayers] = useState<Player[]>([]); // Ensure initial value is an array
  const [isLeader, setIsLeader] = useState(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [playerHand, setPlayerHand] = useState<string>("");
  const [startTime, setStartTime] = useState<Date>();

  const startGame = (data: any) => {
    setPlayerHand(data.player_hand);
    console.log(userName, gameCode);
    socket.emit("start_game", { gameCode, playerName: userName });
  };

  const handlePlayerJoined = (data: any) => {
    setPlayers(data.players);
    setIsLeader(players[0]?.username === userName);
  };

  useEffect(() => {
    if (gameStarted) {
      const timeString = localStorage.getItem("startTime");
      if (timeString) setStartTime(new Date(Date.parse(timeString)));
    }
  }, [gameStarted]);

  useEffect(() => {
    socket.on("player_joined", handlePlayerJoined);
    socket.on("connect", () => {
      console.log("Successfully connected to the server");
    });
    socket.on("game_started", () => {
      console.log("The game has started!!!");
      setGameStarted(true);
    });
    socket.on("error", (data) => {
      alert(data.message);
    });

    return () => {
      socket.off("connect");
      socket.off("player_joined");
      socket.off("game_started");
      socket.off("error");
    };
  }, []);

  useEffect(() => {
    console.log("Updated players list:", players);
  }, [players]);

  return (
    <div>
      <h1>Multiplayer Game</h1>
      {!gameStarted ? (
        <div>
          {isLeader && (
            <StartGameButton
              onGameStart={startGame}
              names={["test1", "test2"]}
              roomCode={gameCode}
            />
          )}
          {Array.isArray(players) && players.length > 0 && (
            <div>
              <h2>Players in Game:</h2>
              <ul>
                {players.map((player, index) => (
                  <li key={index}>
                    {player.isLeader && (
                      <b className="pr-1" style={{ color: "red" }}>
                        Leader
                      </b>
                    )}
                    {player.username}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2>Game has started!</h2>
          {gameStarted && (
            <>
              <GameComponent
                playerHand={playerHand}
                setPlayerHand={setPlayerHand}
              />
              {startTime && <CountdownTimer startTime={startTime} />}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default MultiplayerGame;
