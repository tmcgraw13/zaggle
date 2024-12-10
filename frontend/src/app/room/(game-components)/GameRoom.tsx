import CountdownTimer from "@/components/CountdownTimer";
import { GameData } from "@/models/gameData";
import { Player } from "@/models/player";
import socket from "@/utils/socket";
import { useState, useEffect } from "react";
import PlayersInLobby from "./PlayersInLobby";
import GameStartButton from "./GameStartButton";
import GameSharePanel from "./GameSharePanel";
import PlayerActionPanel from "./PlayerActionPanel";


interface GameRoomProps {
  gameCode: string;
  userName: string;
}

function GameRoom({ userName, gameCode }: GameRoomProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameData, setGameData] = useState<GameData>();
  const [player, setPlayer] = useState<Player>({
    username: userName,
    score: 0,
    hand: [],
    word_history: [],
    isLeader: false,
    icon: "dog",
  });

  const handlePlayerJoined = (data: any) => {
    handleGameStartTime(data.start_time);
    setGameData(data);
    setPlayers(data.players);
    for (var p of data.players) {
      if (p.username === userName) {
        setPlayer(p);
      }
    }
  };

  const handleGameStartTime = (timestamp: string) => {
    if (timestamp) {
      localStorage.setItem("startTime", timestamp);
    } else {
      localStorage.removeItem("startTime");
    }
  };

  useEffect(() => {
    socket.on("player_joined", handlePlayerJoined);
    socket.on("connect", () => {
      console.log("Successfully connected to the server");
    });
    socket.on("game_started", (data) => {
      setGameData(data);
      for (var p of data.players) {
        if (p.username === userName) {
          setPlayer(p);
        }
      }
      handleGameStartTime(data.start_time);
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
      {!gameData?.start_time ? (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            {/* Player Room on the left */}
            <div style={{ flex: 1, paddingRight: "10px" }}>
              {Array.isArray(players) && players.length > 0 && (
                <PlayersInLobby players={players} isLeader={player.isLeader} />
              )}
              {/* Start Game Button centered */}
              {!gameData?.start_time && player.isLeader && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "10px",
                  }}
                >
                  <GameStartButton roomCode={gameCode} />
                </div>
              )}
            </div>
            <GameSharePanel gameCode={gameCode} />
          </div>
        </div>
      ) : (
        <div>
          <h2>Game has started!</h2>
          {gameData.start_time && (
            <>
              <PlayerActionPanel player={player} gameCode={gameCode} />
              {gameData.start_time && (
                <CountdownTimer startTime={gameData.start_time} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default GameRoom;
