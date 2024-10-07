import { useState } from "react";
import { startGame } from "@/services/apiService";

interface StartGameButtonProps {
  onGameStart: () => void;
  initialPlayerHand: string;
  setPlayerHand: (hand: string) => void;
}

const StartGameButton: React.FC<StartGameButtonProps> = ({
  onGameStart,
  initialPlayerHand,
  setPlayerHand,
}) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerHand, setInternalPlayerHand] =
    useState<string>(initialPlayerHand);

  const handleClick = async () => {
    try {
      const result = await startGame();
      setData(result);
      setError(null);
      setInternalPlayerHand(result.player_hand); // Assuming the API returns the player hand
      setPlayerHand(result.player_hand); // Update the player hand in the parent component
      onGameStart();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        alert("Error: " + err.message); // Display error in an alert
      } else {
        setError("An unknown error occurred");
        alert("An unknown error occurred"); // Display error in an alert
      }
    }
  };

  return (
    <div>
      <button
        id="myButton"
        onClick={handleClick}
        className="p-2 bg-blue-500 text-white rounded"
      >
        Start Game
      </button>
      {data && (
        <div>
          <h2>Response Data:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          <div>
            <h3>Player Hand:</h3>
            <p>{playerHand}</p>
          </div>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default StartGameButton;
