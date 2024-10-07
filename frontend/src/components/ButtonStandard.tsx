import { useState } from "react";
import { startGame } from "@/services/apiService";

interface ButtonProps {
  onButtonClick: () => void;
  buttonName: string;
}

const ButtonStandard: React.FC<ButtonProps> = ({
  onButtonClick,
  buttonName,
}) => {
  return (
  
      <button
        id="myButton"
        onClick={onButtonClick}
        className="p-2 bg-blue-500 text-white rounded"
      >
        {buttonName}
      </button>
 
  );
};

export default ButtonStandard;
