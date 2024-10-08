import React from 'react';
import { useRouter } from 'next/navigation'
import ButtonStandard from '@/components/ButtonStandard';
import { generateFourRandomLetters } from '@/utils/randomLetterGenerator';

const CreateGame: React.FC = () => {
  const navigate = useRouter();

  const handleCreateGame = (): void => {
    const roomCode: string = generateFourRandomLetters(); // Generate unique room code
    navigate.push(`/room/${roomCode}`); // Navigate to the new game room
  };
  

  return (
    <div>
      <ButtonStandard onButtonClick={handleCreateGame} buttonName={'Create Game'}/>
    </div>
  );
};

export default CreateGame;
