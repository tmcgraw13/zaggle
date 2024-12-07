import { useState } from "react";
import { startGame } from "@/services/apiService";
import socket from "@/utils/socket";
import ButtonStandard from "@/components/ButtonStandard"; // Assuming ButtonStandard is available

interface StartGameButtonProps {
  roomCode: string;
}

const StartGameButton: React.FC<StartGameButtonProps> = ({ roomCode }) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const startGameWebSocket = () => {
    socket.emit("start_game", { gameCode: roomCode });
  };

  const handleClick = async () => {
    try {
      const activateStartTime = new Date();
      const result = await startGame(roomCode, activateStartTime);
      setData(result);
      startGameWebSocket();
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
    <div className="text-center p-4">
      <h2 className="text-2xl font-semibold mb-4">Ready to Start the Game?</h2>
      
      {/* Start Game Button */}
      <ButtonStandard
        onButtonClick={handleClick}
        buttonName="Start Game"
        className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-all duration-300"
      />

      {/* Response Data */}
      {data && (
        <div className="mt-6 p-4 border-t border-gray-300">
          <h3 className="text-xl font-semibold text-green-600 mb-2">Game Started!</h3>
          <div>
            <h4 className="font-medium text-lg">Response Data:</h4>
            <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
            <div className="mt-4">
              <h5 className="font-medium">Player Hand:</h5>
              <p>{data.player_hand}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 text-red-500 font-medium">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
};

export default StartGameButton;
