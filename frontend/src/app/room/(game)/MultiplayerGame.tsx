import React, { useState, useEffect } from "react";
import GameComponent from "./GameComponent";
import StartGameButton from "./StartGameButton";
import socket from "@/utils/socket";
import CountdownTimer from "@/components/CountdownTimer";
import { Player } from "@/models/player";

interface MultiplayerGameProps {
  gameCode: string;
  userName: string;
}

interface GameData {
  players: Player[];
  room_id: string;
  letter_seq: string[];
  start_time: string;
}

function MultiplayerGame({ userName, gameCode }: MultiplayerGameProps) {
  const [players, setPlayers] = useState<Player[]>([]); // Ensure initial value is an array
  const [gameData, setGameData] = useState<GameData>();
  const [player, setPlayer] = useState<Player>({
    username: userName,
    score: 0,
    hand: [],
    word_history: [],
    isLeader: false,
  });


  const handlePlayerJoined = (data: any) => {
    setGameData(data);
    setPlayers(data.players);
    for(var p  of data.players){
      if(p.username == userName){
        setPlayer(p);
      }
    }
  };

  useEffect(() => {
    socket.on("player_joined", handlePlayerJoined);
    socket.on("connect", () => {
      console.log("Successfully connected to the server");
    });
    socket.on("game_started", (data) => {
      setGameData(data);
      for(var p  of data.players){
        if(p.username == userName){
          setPlayer(p);
        }
      }
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

  return (
    <div>
      <h1>Multiplayer Game</h1>
      {!gameData?.start_time ? (
        <div>
          {player.isLeader && (
            <StartGameButton
              roomCode={gameCode}
            />
          )}
          {Array.isArray(players) && players.length > 0 && (
            <div>
              <h2>Players in Game:</h2>
              <ul>
                {players.map((p, index) => (
                  <li key={index}>
                    {player.isLeader && p.isLeader &&(
                      <b className="pr-1" style={{ color: "red" }}>
                        Leader
                      </b>
                    )}
                    {p.username}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2>Game has started!</h2>
          {gameData.start_time && (
            <>
              <GameComponent
                player={player}
                gameCode={gameCode}
              />
              {gameData.start_time && <CountdownTimer startTime={gameData.start_time} />}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default MultiplayerGame;
