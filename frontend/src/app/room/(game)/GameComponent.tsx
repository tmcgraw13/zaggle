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
  const [submittedInputs, setSubmittedInputs] = useState<string[]>([]);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputSubmit = async (input: string) => {
    try {
      const result = await playWord(input, player, gameCode);
      setResponse(result.response);
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
      <GameInputField onSubmit={handleInputSubmit} playerHand={player.hand} />
      {response && (
        <div>
          <p>{response.message}</p>
          {response.score && <p>Score: {response.score}</p>}
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
      <GameInputList inputs={submittedInputs} />
    </div>
  );
};

export default GameComponent;
