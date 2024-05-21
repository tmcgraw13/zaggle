import { useState } from "react";
import GameInputField from "./GameInputField";
import GameInputList from "./GameInputList";

const GameComponent = () => {
  const [submittedInputs, setSubmittedInputs] = useState<string[]>([]);

  const handleInputSubmit = (input: string) => {
    setSubmittedInputs((prevInputs) => [...prevInputs, input]);
  };

  return (
    <div>
      <GameInputField onSubmit={handleInputSubmit} />
      <GameInputList inputs={submittedInputs} />
    </div>
  );
};

export default GameComponent;
