interface InputListProps {
    inputs: string[];
  }
  
  const PlayerWordHistory: React.FC<InputListProps> = ({ inputs }) => {
    return (
      <ul className="mt-4">
        {inputs.map((input, index) => (
          <li key={index} className="p-2 border-b">
            {input}
          </li>
        ))}
      </ul>
    );
  };
  
  export default PlayerWordHistory;
  