interface ButtonProps {
  onButtonClick: () => void;
  buttonName: string;
  className?: string;  // Added className as an optional property
  disabled?: boolean;
}

const ButtonStandard: React.FC<ButtonProps> = ({
  onButtonClick,
  buttonName,
  className = "",  // Default to an empty string if no className is provided
  disabled = false // Defaut to NOT disabled
}) => {
  return (
    <button
      id="myButton"
      onClick={onButtonClick}
      className={`px-8 py-4 text-xl font-semibold bg-blue-600 text-white rounded-lg shadow-lg transition-all duration-300 hover:bg-blue-700 hover:scale-105 transform ${className}`} // Made button bigger and added hover effects
      disabled = {disabled}
    >
      {buttonName}
    </button>
  );
};

export default ButtonStandard;
