import { useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import PlayerInputField from "./PlayerInputField";
import PlayerWordHistory from "./PlayerWordHistory";
import { playWord } from "@/services/apiService";
import { Player } from "@/models/player";
import CountdownTimer from "@/components/CountdownTimer";
import PlayerHand from "./PlayerHand";

interface PlayerActionPanelProps {
  player: Player;
  gameCode: string;
  startTime: string;
}

const PlayerActionPanel: React.FC<PlayerActionPanelProps> = ({
  player,
  gameCode,
  startTime,
}) => {
  const [submittedInputs, setSubmittedInputs] = useState<string[]>(
    player.word_history
  );
  const [message, setMessage] = useState<string>("");
  const [current_player, setPlayer] = useState<Player>(player);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleInputSubmit = async (input: string) => {
    try {
      const result = await playWord(input, player, gameCode);
      setMessage(result.message);
      setPlayer(result.player);
      setSubmittedInputs((prevInputs) => [...prevInputs, input]);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-16 h-16">
        <CountdownTimer startTime={startTime} />
      </div>

      <PlayerInputField
        onSubmit={handleInputSubmit}
        playerHand={current_player.hand}
      />
      <div>
        <p>{message}</p>
        {current_player.score && <p>Score: {current_player.score}</p>}
      </div>
      {error && <p className="text-red-500">{error}</p>}

      {/* Popup modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full relative">
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowHistory(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Word History</h2>
            <PlayerWordHistory inputs={submittedInputs} />
          </div>
        </div>
      )}

      {/* Player hand and info icon */}
<div className="relative flex items-center justify-center mt-4">
  <PlayerHand current_player={current_player} />

  <button
    type="button"
    className="absolute right-0 -mr-12 rounded-full"
    onClick={() => setShowHistory(true)}
    aria-label="Show word history"
  >
    <AiOutlineInfoCircle size={28} />
  </button>
</div>



    </div>
  );
};

export default PlayerActionPanel;
