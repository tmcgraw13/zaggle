"use client";

import { useState, useEffect } from "react";
import MultiplayerGame from "../(game)/MultiplayerGame";
import ButtonStandard from "@/components/ButtonStandard";
import socket from "@/utils/socket";
import PlayerNameModal from "../../../components/PlayerNameModal";

export default function RoomCode({ params }: { params: { code: string } }) {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [roomLink, setRoomLink] = useState<string>("");
  const [userName, setUserName] = useState<string | null>(null);
  const roomCode = params.code;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Controls the visibility of the name modal

  const joinGame = () => {
    if (!roomLink || !userName) return; // Guard clause to prevent sending empty values

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
    // Ensure this runs only in the client environment
    if (typeof window !== "undefined") {
      const link = `${window.location.origin}/room/${roomCode}`; // Generate shareable link
      setRoomLink(link);

      const storedUserName = localStorage.getItem("userName");
      setUserName(storedUserName);
    }
  }, [roomCode]);

  useEffect(() => {
    // Check if both userName and roomLink are set before joining the game
    if (userName && roomLink) {
      joinGame();
    }
  }, [userName, roomLink]); // Run when userName or roomLink changes

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopySuccess("Copied!");
        setTimeout(() => setCopySuccess(null), 2000); // Reset message after 2 seconds
      })
      .catch(() => {
        setCopySuccess("Failed to copy");
      });
  };

  return (
    <>
      {isModalOpen && !userName && (
        <PlayerNameModal
          setUserName={setUserName} // Pass setUserName function to the modal
          closeModal={() => setIsModalOpen(false)} // Close modal function
        />
      )}
      {!isModalOpen && userName && (
        <div className="text-center">
          <div>
            <b style={{ color: "red" }}>Room Code: </b>
            {roomCode}
            <ButtonStandard
              onButtonClick={() => handleCopy(roomCode)}
              buttonName={"Copy Code"}
            />
          </div>
          <div>
            <b style={{ color: "red" }}>Shareable Link: </b> {roomLink}
            <ButtonStandard
              onButtonClick={() => handleCopy(roomLink)}
              buttonName={"Copy Link"}
            />
          </div>
          {copySuccess && <div>{copySuccess}</div>}
          {userName && roomCode && <MultiplayerGame userName={userName} gameCode={roomCode} />}
        </div>
      )}
    </>
  );
}
