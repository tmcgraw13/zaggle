import { useState } from "react";
import GameInputField from "./GameInputField";
import GameInputList from "./GameInputList";
import { playWord } from "@/services/apiService";
import { Player } from "@/models/player";

interface GameComponentProps {
  player: Player;
  gameCode: string;
}

const GameComponent: React.FC<GameComponentProps> = ({ player, gameCode }) => {
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
      <GameInputField onSubmit={handleInputSubmit} playerHand={current_player.hand} />
      
        <div>
          <p>{message}</p>
          {current_player.score && <p>Score: {current_player.score}</p>}
        </div>
      
      {error && <p className="text-red-500">{error}</p>}
      <GameInputList inputs={submittedInputs} />
    </div>
  );
};

export default GameComponent;
