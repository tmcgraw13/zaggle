import { useState } from "react";
import PlayerInputField from "./PlayerInputField";
import PlayerWordHistory from "./PlayerWordHistory";
import { playWord } from "@/services/apiService";
import { Player } from "@/models/player";

interface PlayerActionPanelProps {
  player: Player;
  gameCode: string;
}

const PlayerActionPanel: React.FC<PlayerActionPanelProps> = ({ player, gameCode }) => {
  const [submittedInputs, setSubmittedInputs] = useState<string[]>(player.word_history);
  const [message, setMessage] = useState<string>('');
  const [current_player, setPlayer] = useState<Player>(player);
  const [error, setError] = useState<string | null>(null);

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
    <div>
      <PlayerInputField onSubmit={handleInputSubmit} playerHand={current_player.hand} />
      
        <div>
          <p>{message}</p>
          {current_player.score && <p>Score: {current_player.score}</p>}
        </div>
      
      {error && <p className="text-red-500">{error}</p>}
      <PlayerWordHistory inputs={submittedInputs} />
    </div>
  );
};

export default PlayerActionPanel;
