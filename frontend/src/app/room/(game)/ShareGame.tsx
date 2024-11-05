import { useEffect, useState } from "react";
import ButtonStandard from "@/components/ButtonStandard";

interface ShareGameProps {
  gameCode: string;
}

const ShareGame: React.FC<ShareGameProps> = ({ gameCode }) => {
    const [roomLink, setRoomLink] = useState<string>("");
    const [copySuccess, setCopySuccess] = useState<string | null>(null);

    useEffect(() => {
        // Ensure this runs only in the client environment
        if (typeof window !== "undefined") {
          const link = `${window.location.origin}/room/${gameCode}`; // Generate shareable link
          setRoomLink(link);
        }
      }, [gameCode]);


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
    <div>
       <div>
            <b style={{ color: "red" }}>Room Code: </b>
            {gameCode}
            <ButtonStandard
              onButtonClick={() => handleCopy(gameCode)}
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
    </div>
  );
};

export default ShareGame;
