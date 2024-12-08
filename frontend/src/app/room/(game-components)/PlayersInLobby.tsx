import React from "react";
import PlayerIcon from "./PlayerIcon";
import { Player } from "@/models/player";

interface PlayersInLobbyProps {
  players: Player[];
  isLeader: boolean;
}

const PlayersInLobby: React.FC<PlayersInLobbyProps> = ({ players, isLeader }) => {
  return (
    <div style={{ margin: "20px auto"}} className="mb-8 border-4 border-dashed border-gray-300 rounded-lg">
      <div>Players in Game:</div>
      <ul  style={{ 
        display: "flex", 
        paddingLeft: 0, 
        listStyleType: "none", 
        justifyContent: "center",   // Center list horizontally
        alignItems: "center"        // Center list items vertically
      }}>
        {players.map((player, index) => (
          <li key={index} style={{ display: "flex", alignItems: "center", padding: '10px' }}>
            <PlayerIcon /> 
            {isLeader && player.isLeader && (
              <b className="pr-1" style={{ color: "red" }}>
                Leader
              </b>
            )}
            {player.username}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayersInLobby;
