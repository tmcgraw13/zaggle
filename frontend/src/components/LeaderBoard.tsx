import RoomCode from "@/app/room/[code]/page"
import socket from "@/utils/socket";
import React, { useState, useEffect } from 'react';
// take names from RoomCode
// take scores from names
// order names by score 


useEffect(() => {
    socket.on("leaderboard_update", (data) => {
      console.log(data);

      }
    });

    const Leaderboard = () => {
  // Initial player data
  const [players, setPlayers] = useState([
    { id: 1, name: 'Jake', score: 0 },
    { id: 2, name: 'Cordelia', score: 0 },
    { id: 3, name: 'Father Braga', score: 0 },
  ]);

  // Function to simulate score updates (you can customize how scores are updated)
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) => ({
          ...player,
          score: player.score + Math.floor(Math.random() * 10), // Simulate random score increase
        }))
      );
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  // Sort players by score (highest first)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div>
      <h1>Leaderboard</h1>
      <ul>
        {sortedPlayers.map((player, index) => (
          <li key={player.id}>
            {index + 1}. {player.name}: {player.score} points
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
