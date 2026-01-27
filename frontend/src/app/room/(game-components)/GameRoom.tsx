"use client";

import { GameData } from "@/models/gameData";
import { Player } from "@/models/player";
import socket from "@/utils/socket";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PlayersInLobby from "./PlayersInLobby";
import GameStartButton from "./GameStartButton";
import GameSharePanel from "./GameSharePanel";
import PlayerActionPanel from "./PlayerActionPanel";
import GameEndModal from "./GameEndModal";
import Leaderboard from "./Leaderboard";

interface GameRoomProps {
  gameCode: string;
  userName: string;
  userIcon?: string;
  onEditProfile?: () => void;
}

function GameRoom({ userName, gameCode, userIcon, onEditProfile }: GameRoomProps) {
  const router = useRouter();
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
  const [gameEnded, setGameEnded] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handlePlayerJoined = useCallback(
    (data: GameData) => {
      handleGameStartTime(data.start_time);
      setGameData(data);
      setPlayers(data.players);
      for (const p of data.players) {
        if (p.username === userName) {
          setPlayer(p);
        }
      }
    },
    [userName]
  );

  const handleGameStarted = useCallback(
    (data: GameData) => {
      setGameData(data);
      setPlayers(data.players);
      for (const p of data.players) {
        if (p.username === userName) {
          setPlayer(p);
        }
      }
      handleGameStartTime(data.start_time);
      setGameEnded(false);
    },
    [userName]
  );

  const handleGameEnded = useCallback(
    (data: GameData) => {
      setGameData(data);
      setPlayers(data.players);
      for (const p of data.players) {
        if (p.username === userName) {
          setPlayer(p);
        }
      }
      setGameEnded(true);
    },
    [userName]
  );

  const handleGameStartTime = (timestamp: string | undefined) => {
    if (timestamp) {
      localStorage.setItem("startTime", timestamp);
    } else {
      localStorage.removeItem("startTime");
    }
  };

  const handlePlayAgain = useCallback(() => {
    // Reset everyone to lobby - they can choose to stay or leave
    socket.emit("reset_to_lobby", gameCode);
  }, [gameCode]);

  const handleLeaveGame = useCallback(() => {
    // Leave the game and go back to home
    socket.emit("leave_game", { gameCode, username: userName });
    router.push("/");
  }, [gameCode, userName, router]);

  const handleLobbyReset = useCallback(
    (data: GameData) => {
      setGameData(data);
      setPlayers(data.players);
      for (const p of data.players) {
        if (p.username === userName) {
          setPlayer(p);
        }
      }
      setGameEnded(false);
      handleGameStartTime(undefined);
    },
    [userName]
  );

  const handlePlayerLeft = useCallback(
    (data: GameData) => {
      setGameData(data);
      setPlayers(data.players);
    },
    []
  );

  const handleScoresUpdated = useCallback(
    (data: GameData) => {
      setPlayers(data.players);
      // Update current player's data if needed
      for (const p of data.players) {
        if (p.username === userName) {
          setPlayer(p);
        }
      }
    },
    [userName]
  );

  const handlePlayerUpdated = useCallback(
    (data: GameData) => {
      setGameData(data);
      setPlayers(data.players);
      // Update current player's data (name/icon may have changed)
      for (const p of data.players) {
        if (p.username === userName) {
          setPlayer(p);
        }
      }
    },
    [userName]
  );

  useEffect(() => {
    socket.on("player_joined", handlePlayerJoined);
    socket.on("connect", () => {
      console.log("Successfully connected to the server");
    });
    socket.on("game_started", handleGameStarted);
    socket.on("game_ended", handleGameEnded);
    socket.on("lobby_reset", handleLobbyReset);
    socket.on("player_left", handlePlayerLeft);
    socket.on("scores_updated", handleScoresUpdated);
    socket.on("player_updated", handlePlayerUpdated);
    socket.on("error", (data) => {
      alert(data.message);
    });

    return () => {
      socket.off("connect");
      socket.off("player_joined");
      socket.off("game_started");
      socket.off("game_ended");
      socket.off("lobby_reset");
      socket.off("player_left");
      socket.off("scores_updated");
      socket.off("player_updated");
      socket.off("error");
    };
  }, [handlePlayerJoined, handleGameStarted, handleGameEnded, handleLobbyReset, handlePlayerLeft, handleScoresUpdated, handlePlayerUpdated]);

  // Determine game state
  const isInLobby = !gameData?.start_time;
  const isPlaying = gameData?.start_time && !gameEnded;

  return (
    <div className="h-full bg-slate-900 overflow-hidden">
      {/* Lobby state */}
      {isInLobby && (
        <div className="h-full overflow-auto p-4">
          {Array.isArray(players) && players.length > 0 && (
            <PlayersInLobby
              players={players}
              isLeader={player.isLeader}
              currentPlayer={userName}
              onEditProfile={onEditProfile}
            />
          )}
          {player.isLeader && <GameStartButton roomCode={gameCode} />}
          <GameSharePanel gameCode={gameCode} />
        </div>
      )}

      {/* Playing state */}
      {isPlaying && gameData.start_time && (
        <div className="h-full overflow-hidden relative">
          {/* In-game leaderboard (multiplayer only) - floating on left side, centered */}
          {players.length > 1 && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-40 w-36">
              <Leaderboard
                players={players}
                currentPlayer={userName}
                collapsed={false}
                maxPlayers={10}
              />
            </div>
          )}

          {/* Main game UI */}
          <PlayerActionPanel
            player={player}
            gameCode={gameCode}
            startTime={gameData.start_time}
          />
        </div>
      )}

      {/* Game end modal */}
      <GameEndModal
        isVisible={gameEnded}
        players={players}
        currentPlayer={userName}
        isLeader={player.isLeader}
        onPlayAgain={handlePlayAgain}
        onLeaveGame={handleLeaveGame}
      />
    </div>
  );
}

export default GameRoom;
