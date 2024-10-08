import React, { useState } from 'react';
import { useRouter } from 'next/navigation'
import ButtonStandard from '@/components/ButtonStandard';


const JoinGame: React.FC = () => {
  const navigate = useRouter();
  const [roomCode, setRoomCode] = useState<string>('');

  const handleJoinGame = (): void => {
    if (roomCode) {
      navigate.push(`/room/${roomCode}`); // Navigate to the specified room
    }
  };

  return (
    <div className='text-center'>
      <h2>Join a Game</h2>
      <input
        type="text"
        placeholder="Enter Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />
      <ButtonStandard onButtonClick={handleJoinGame} buttonName={'Join Game'}/>
    </div>
  );
};

export default JoinGame;
