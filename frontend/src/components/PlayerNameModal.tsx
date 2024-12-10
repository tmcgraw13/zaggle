import { useState } from "react";
import ButtonStandard from "./ButtonStandard";

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
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column'}}>
          <input
            type="text"
            className="w-72 p-3 mt-4 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 placeholder-gray-500 text-black top-full mt-3"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <ButtonStandard type="submit" buttonName={'Enter Game Room'}/>
        </form>
      </div>
    </div>
  );
};

export default PlayerNameModal;
