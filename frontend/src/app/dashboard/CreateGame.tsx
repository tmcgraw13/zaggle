import React from 'react';
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid';
import ButtonStandard from '@/components/ButtonStandard';

const CreateGame: React.FC = () => {
  const navigate = useRouter();

  const handleCreateGame = (): void => {
    const roomCode: string = uuidv4(); // Generate unique room code
    navigate.push(`/room/${roomCode}`); // Navigate to the new game room
  };
  

  return (
    <div>
      <ButtonStandard onButtonClick={handleCreateGame} buttonName={'Create Game'}/>
    </div>
  );
};

export default CreateGame;
