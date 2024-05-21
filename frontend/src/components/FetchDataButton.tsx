import { useState } from "react";
import { fetchData } from "@/services/apiService";

const FetchDataButton: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      const result = await fetchData();
      setData(result);
      setError(null);
      alert(JSON.stringify(result)); // Display the response data in an alert
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        alert("Error: " + err.message); // Display error in an alert
      } else {
        setError("An unknown error occurred");
        alert("An unknown error occurred"); // Display error in an alert
      }
    }
  };

  return (
    <div>
      <button
        id="myButton"
        onClick={handleClick}
        className="p-2 bg-blue-500 text-white rounded"
      >
        Fetch Data
      </button>
      {data && (
        <div>
          <h2>Response Data:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default FetchDataButton;
