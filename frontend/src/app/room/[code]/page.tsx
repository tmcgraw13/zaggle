"use client";

import { useState, useEffect, useCallback } from "react";
import GameRoom from "../(game-components)/GameRoom";
import socket from "@/utils/socket";
import PlayerNameModal from "../../../components/PlayerNameModal";
import ProfileEditor from "../(game-components)/ProfileEditor";
import { IconType } from "@/utils/randomIcon";

export default function RoomCode({ params }: { params: { code: string } }) {
  const [userName, setUserName] = useState<string | null>(null);
  const [userIcon, setUserIcon] = useState<IconType>("dog");
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const roomCode = params.code;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const joinGame = useCallback((name: string, icon: IconType) => {
    socket.emit("join_game", { gameCode: roomCode, playerName: name, playerIcon: icon });
  }, [roomCode]);

  // Fetch userName and userIcon from localStorage on component mount
  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    const storedUserIcon = localStorage.getItem("userIcon") as IconType | null;

    if (storedUserName) {
      setUserName(storedUserName);
      if (storedUserIcon) {
        setUserIcon(storedUserIcon);
      }
    } else {
      setIsModalOpen(true);
    }
  }, []);

  // Join game when userName is set
  useEffect(() => {
    if (userName && roomCode) {
      joinGame(userName, userIcon);
    }
  }, [userName, roomCode, joinGame]);

  // Save the username and icon in localStorage
  const handleSetUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem("userName", name);
  };

  const handleSetUserIcon = (icon: IconType) => {
    setUserIcon(icon);
    localStorage.setItem("userIcon", icon);
    setIsModalOpen(false);
  };

  // Handle profile edit (name and/or icon change)
  const handleProfileSave = (newName: string, newIcon: IconType) => {
    const nameChanged = newName !== userName;
    const iconChanged = newIcon !== userIcon;

    if (!nameChanged && !iconChanged) return;

    // Update local state
    setUserName(newName);
    localStorage.setItem("userName", newName);
    setUserIcon(newIcon);
    localStorage.setItem("userIcon", newIcon);

    // Use update_profile to preserve host status
    socket.emit("update_profile", {
      gameCode: roomCode,
      oldUsername: userName,
      newUsername: newName,
      newIcon: newIcon,
    });
  };

  return (
    <>
      {isModalOpen && !userName ? (
        <PlayerNameModal
          setUserName={handleSetUserName}
          setUserIcon={handleSetUserIcon}
          closeModal={() => setIsModalOpen(false)}
        />
      ) : (
        <>
          {userName && roomCode ? (
            <>
              <GameRoom
                userName={userName}
                gameCode={roomCode}
                userIcon={userIcon}
                onEditProfile={() => setShowProfileEditor(true)}
              />
              {showProfileEditor && (
                <ProfileEditor
                  currentName={userName}
                  currentIcon={userIcon}
                  onSave={handleProfileSave}
                  onClose={() => setShowProfileEditor(false)}
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              Loading...
            </div>
          )}
        </>
      )}
    </>
  );
}
