import { useState } from "react";

interface PlayerNameModalProps {
  setUserName: (name: string) => void;
  closeModal: () => void;
}

const PlayerNameModal: React.FC<PlayerNameModalProps> = ({ setUserName, closeModal }) => {
  const [name, setName] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      setUserName(name); // Pass name to parent component
      closeModal(); // Close the modal
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl mb-4 text-black">Enter your name to proceed</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="border p-2 mb-4 w-full text-black"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Enter Game
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlayerNameModal;
