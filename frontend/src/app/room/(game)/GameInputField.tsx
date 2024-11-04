import { isAlphabetic } from "@/utils/isAlphabetic";
import { useState } from "react";

interface GameInputFieldProps {
  playerHand: string[];
  onSubmit: (input: string) => void;
}

const GameInputField: React.FC<GameInputFieldProps> = ({ playerHand, onSubmit }) => {
  const [input, setInput] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Validate the last character entered
    if (value.length === 0 || isAlphabetic(value)) {
      setInput(value);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() !== "") {
      onSubmit(input);
      setInput(""); // Clear the input field after submission
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="game-input-field flex items-center space-x-2"
    >
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Enter your input"
        className="p-2 border rounded text-black"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
      >
        Submit
      </button>
      <div>
        <h3>Player Hand:</h3>
        <p>{playerHand}</p>
      </div>
    </form>
  );
};

export default GameInputField;
