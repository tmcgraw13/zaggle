import React, { useState, useEffect } from "react";
import GameComponent from "./GameComponent";
import StartGameButton from "./StartGameButton";
import socket from "@/utils/socket";
import CountdownTimer from "@/components/CountdownTimer";

interface MultiplayerGameProps {
  gameCode: string;
  userName: string;
}

function MultiplayerGame({ userName, gameCode }: MultiplayerGameProps) {
  const [players, setPlayers] = useState([]);
  const [isLeader, setIsLeader] = useState(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [playerHand, setPlayerHand] = useState<string>(""); // Initialize an empty player hand
  const [startTime, setStartTime] = useState<Date>();


  const startGame = (data: any) => {
    let playerName = userName;
    setPlayerHand(data.player_hand)
    console.log(playerName, gameCode);
    socket.emit("start_game", { gameCode, playerName });
  };

  const isLeaderAndCurrentPlayer = (player: string) => {
    return isLeader && players[0] === player;
  };

  useEffect(()=>{
    if(gameStarted){
      const timeString = localStorage.getItem("startTime")
      if(timeString) setStartTime(new Date(Date.parse(timeString)))
    }
  },[gameStarted])

  useEffect(() => {
    socket.on("player_joined", (data) => {
      console.log(data);
      setGameStarted(data.started);
      setPlayers(data.players);
      if (data.players[0] === userName) {
        setIsLeader(true); // First player is the leader
      }
    });

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

    // Clean up the socket connection when the component unmounts
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
      {!gameStarted ? (
        <div>
          {isLeader && (
            <StartGameButton
              onGameStart={startGame}
              names={['test1',"test2"]}
              roomCode={gameCode}
            />
          )}
          {players.length > 0 && (
            <div>
              <h2>Players in Game:</h2>
              <ul>
                {players.map((player, index) => (
                  <li key={index}>
                    {isLeaderAndCurrentPlayer(player) && (
                      <b className="pr-1" style={{ color: "red" }}>
                        Leader
                      </b>
                    )}
                    {player}
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
