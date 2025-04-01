import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ButtonStandard from '@/components/ButtonStandard';

const JoinGame: React.FC = () => {
  const navigate = useRouter();
  const [roomCode, setRoomCode] = useState<string>('');

  const handleJoinGame = (): void => {
    if (roomCode) {
      navigate.push(`/room/${roomCode}`); // Navigate to the specified room
    }
  };

  const isDisabled = roomCode.trim().length === 0;

  return (
    <div className="text-center flex flex-col items-center justify-center relative">
      {/* Join Game Button - Disabled if roomCode is empty */}
      <ButtonStandard
        onButtonClick={handleJoinGame}
        buttonName="Join Game"
        className={`px-6 py-3 bg-green-600 text-white rounded-md shadow-md transition-all duration-300 hover:bg-green-700 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isDisabled} // Disable button if roomCode is empty
      />
      
      {/* Input Field positioned just below the button using absolute positioning */}
      <input
        type="text"
        placeholder="Enter Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        className="w-72 p-3 mt-4 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-all duration-300 placeholder-gray-500 text-black absolute top-full mt-3"
      />
    </div>
  );
};

export default JoinGame;
