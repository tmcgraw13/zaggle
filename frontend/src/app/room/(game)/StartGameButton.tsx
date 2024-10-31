import { useState } from "react";
import { startGame } from "@/services/apiService";

interface StartGameButtonProps {
  onGameStart: (data:any) => void;
  names: Array<string>;
  roomCode: string;
}

const StartGameButton: React.FC<StartGameButtonProps> = ({
  onGameStart,
  names,
  roomCode
}) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date>();

  const handleClick = async () => {
    try {
      var activateStartTime = new Date()
      handleSetStartTime(activateStartTime);
      const result = await startGame(names, roomCode, activateStartTime);
      setData(result);
      setError(null);
      onGameStart(result);
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

  const handleSetStartTime = (timestamp: Date) => {
    setStartTime(timestamp);
    localStorage.setItem("startTime", timestamp.toString()); 
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
            <p>{data.player_hand}</p>
          </div>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default StartGameButton;
