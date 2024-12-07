import { useEffect, useState } from "react";
import ButtonStandard from "@/components/ButtonStandard"; // Assuming this component is correctly set up

interface ShareGameProps {
  gameCode: string;
}

const ShareGame: React.FC<ShareGameProps> = ({ gameCode }) => {
  const [roomLink, setRoomLink] = useState<string>("");
  const [copyCodeSuccess, setCopyCodeSuccess] = useState<boolean>(false); // Track copy success for Code
  const [copyLinkSuccess, setCopyLinkSuccess] = useState<boolean>(false); // Track copy success for Link

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRoomLink(`${window.location.origin}/room/${gameCode}`);
    }
  }, [gameCode]);

  const handleCopy = (textToCopy: string, type: "code" | "link") => {
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        if (type === "code") {
          setCopyCodeSuccess(true);
          setTimeout(() => setCopyCodeSuccess(false), 2000); // Reset after 2 seconds
        } else {
          setCopyLinkSuccess(true);
          setTimeout(() => setCopyLinkSuccess(false), 2000); // Reset after 2 seconds
        }

      })
      .catch(() => {
        // Handle the error if needed
        alert("Failed to copy");
      });
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>Share Your Game Room</h3>

      <div style={styles.item}>
        <b style={styles.label}>Room Code:</b>
        <span style={styles.code}>{gameCode}</span>
        <ButtonStandard
          onButtonClick={() => handleCopy(gameCode, "code")}
          buttonName={copyCodeSuccess ? "Copied!" : "Copy Code"}
          className={`px-6 py-3 ${copyCodeSuccess ? 'bg-green-600' : 'bg-blue-600'} text-white rounded-md shadow-md transition-all duration-300 hover:${copyCodeSuccess ? 'bg-green-700' : 'bg-blue-700'} `}
        />
      </div>

      <div style={styles.item}>
        <b style={styles.label}>Shareable Link:</b>
        <span style={styles.link}>{roomLink}</span>
        <ButtonStandard
          onButtonClick={() => handleCopy(roomLink, "link")}
          buttonName={copyLinkSuccess ? "Copied!" : "Copy Link"}
          className={`px-6 py-3 ${copyLinkSuccess ? 'bg-green-600' : 'bg-blue-600'} text-white rounded-md shadow-md transition-all duration-300 hover:${copyLinkSuccess ? 'bg-green-700' : 'bg-blue-700'} `}
        />
      </div>
    </div>
  );
};

// Inline Styles
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px",
    margin: "20px auto",
    textAlign: "center" as const,
    color: "black",
  },
  header: {
    fontSize: "1.5rem",
    marginBottom: "20px",
    color: "black",
  },
  item: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center" as const,
  },
  label: {
    fontSize: "1rem",
    color: "black",
  },
  code: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    margin: "5px 0",
    color: "black",
  },
  link: {
    fontSize: "1rem",
    color: "black",
    wordWrap: "break-word" as const,
  },
};

export default ShareGame;
