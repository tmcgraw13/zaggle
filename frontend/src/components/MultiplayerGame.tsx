import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import serverUrl from "@/utils/config";

const socket = io(serverUrl); // Replace with your backend URL

function MultiplayerGame() {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([]);
  const [isLeader, setIsLeader] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const joinGame = () => {
    socket.emit('join_game', { gameCode, playerName });
  };

  const startGame = () => {
    socket.emit('start_game', { gameCode, playerName });
  };

  const isLeaderAndCurrentPlayer = (player:string) => {
    return isLeader && players[0]===player
  }

  useEffect(() => {
    socket.on('player_joined', (data) => {
      setPlayers(data.players);
      if (data.players[0] === playerName) {
        setIsLeader(true); // First player is the leader
      }
    });

    socket.on('connect', () => {
        console.log('Successfully connected to the server');
    });
    

    socket.on('game_started', () => {
      setGameStarted(true);
    });

    socket.on('error', (data) => {
      alert(data.message);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.off('player_joined');
      socket.off('game_started');
      socket.off('error');
    };
  }, [playerName]);

  return (
    <div>
      <h1>Multiplayer Game</h1>
      {!gameStarted ? (
        <div>
          <input
            type="text"
            placeholder="Game Code"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value)}
            className='text-black'
          />
          <input
            type="text"
            placeholder="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className='text-black'
          />
          <button onClick={joinGame}>Join Game</button>

          {players.length > 0 && (
            <div>
              <h2>Players in Game:</h2>
              <ul>
                {players.map((player, index) => (
                  <li key={index}>{isLeaderAndCurrentPlayer(player) && <b className="pr-1" style={{ color: 'red' }}>Leader</b>}{player}</li>
                ))}
              </ul>
              {isLeader && <button onClick={startGame}>Start Game</button>}
            </div>
          )}
        </div>
      ) : (
        <h2>Game has started!</h2>
      )}
    </div>
  );
}

export default MultiplayerGame;
