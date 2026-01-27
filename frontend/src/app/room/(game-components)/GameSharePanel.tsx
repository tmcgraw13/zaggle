"use client";

import { useEffect, useState } from "react";
import { FiCopy, FiCheck, FiShare2 } from "react-icons/fi";

interface GameSharePanelProps {
  gameCode: string;
}

// Fallback copy function for non-HTTPS contexts
const copyToClipboard = async (text: string): Promise<boolean> => {
  // Try modern clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback for HTTP or older browsers
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textArea);
    return success;
  } catch {
    return false;
  }
};

const GameSharePanel: React.FC<GameSharePanelProps> = ({ gameCode }) => {
  const [roomLink, setRoomLink] = useState<string>("");
  const [copyLinkSuccess, setCopyLinkSuccess] = useState<boolean>(false);
  const [canShare, setCanShare] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRoomLink(`${window.location.origin}/room/${gameCode}`);
      // Check if Web Share API is available (requires HTTPS on mobile)
      setCanShare(!!navigator.share && window.isSecureContext);
    }
  }, [gameCode]);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(roomLink);
    if (success) {
      setCopyLinkSuccess(true);
      setTimeout(() => setCopyLinkSuccess(false), 2000);
    } else {
      alert("Failed to copy. Please copy manually: " + roomLink);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Zaggle game!",
          text: `Join my word game with code: ${gameCode}`,
          url: roomLink,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 max-w-sm mx-auto">
      {/* Room Code */}
      <div className="text-center mb-4">
        <label className="text-slate-400 text-xs font-medium block mb-2">
          Room Code
        </label>
        <span className="text-3xl font-bold text-white tracking-widest">
          {gameCode}
        </span>
      </div>

      {/* Copy Link and Share buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCopyLink}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
            copyLinkSuccess
              ? "bg-emerald-600 text-white"
              : "bg-slate-700 text-white active:bg-slate-600"
          }`}
        >
          {copyLinkSuccess ? (
            <>
              <FiCheck size={18} />
              Copied!
            </>
          ) : (
            <>
              <FiCopy size={18} />
              Copy Link
            </>
          )}
        </button>

        {canShare && (
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all bg-indigo-600 text-white active:bg-indigo-500"
          >
            <FiShare2 size={18} />
            Share
          </button>
        )}
      </div>

      {/* Show link for easy manual copying on non-secure contexts */}
      {!canShare && (
        <p className="text-slate-500 text-xs text-center mt-3 break-all select-all">
          {roomLink}
        </p>
      )}
    </div>
  );
};

export default GameSharePanel;
