"use client";

import { useState, useEffect } from "react";
import MultiplayerGame from "../(game)/MultiplayerGame";
import socket from "@/utils/socket";
import PlayerNameModal from "../../../components/PlayerNameModal";
import ShareGame from "../(game)/ShareGame";

export default function RoomCode({ params }: { params: { code: string } }) {
  const [userName, setUserName] = useState<string | null>(null);
  const roomCode = params.code;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Controls the visibility of the name modal

  const joinGame = () => {
    const gameCode = roomCode;
    const playerName = userName;
    socket.emit("join_game", { gameCode, playerName });
  };

  // Fetch userName from localStorage on component mount
  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      setIsModalOpen(true); // Open the modal if no userName is found
    }
  }, []); // Only run this effect once on mount

  

  useEffect(() => {
    // Check if both userName and roomLink are set before joining the game
    if (userName && roomCode) {
      joinGame();
    }
  }, [userName]); // Run when userName or roomLink changes

  

  // Save the username in localStorage
  const handleSetUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem("userName", name); // Persist the username
    setIsModalOpen(false); // Close the modal after setting the username
  };

  return (
    <>
      {isModalOpen && !userName && (
        <PlayerNameModal
          setUserName={handleSetUserName} // Pass setUserName function to the modal
          closeModal={() => setIsModalOpen(false)} // Close modal function
        />
      )}
      {!isModalOpen && userName && (
        <div className="text-center">
           <ShareGame gameCode={roomCode} />
          { roomCode && (
            <MultiplayerGame userName={userName} gameCode={roomCode} />
          )}
        </div>
      )}
    </>
  );
}
