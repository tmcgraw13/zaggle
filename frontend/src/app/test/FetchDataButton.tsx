import { useState } from "react";
import { fetchData } from "@/services/apiService";
import useSound from "use-sound";

const FetchDataButton: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWiggling, setIsWiggling] = useState(false);

  // Initialize sound with a shared `play` and `stop`
  const [play, { stop }] = useSound("/bunny.mp3", { volume: 0.8 });

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

  // Helper to stop existing sound and start new one
  const playNewSound = (options?: any) => {
    stop(); // Stop any currently playing sound
    play(options); // Play new sound
  };

  // Play sound with random playback rate
  const playFunnySound = () => {
    const playbackRate = Math.random() * 0.7 + 0.8; // Between 0.8 and 1.5
    playNewSound({ playbackRate });
    console.log(`Played sound with playbackRate: ${playbackRate.toFixed(2)}`);
  };

  // Play sound multiple times at increasing speeds
  const playFunnyLoop = () => {
    let playbackRate = 0.5; // Start slow
    const interval = setInterval(() => {
      playNewSound({ playbackRate });
      playbackRate += 0.1; // Increase speed
      if (playbackRate > 2) clearInterval(interval); // Stop when too fast
    }, 500); // Play every 500ms
  };

  // Play sound with a random delay
  const playWithDelay = () => {
    const delay = Math.random() * 2000; // Delay between 0 and 2 seconds
    setTimeout(() => playNewSound(), delay);
  };

  // Mimic a broken sound button with erratic intervals
  const playBrokenSound = () => {
    for (let i = 0; i < 5; i++) {
      const randomDelay = Math.random() * 500; // Random delay up to 500ms
      setTimeout(() => playNewSound(), randomDelay);
    }
  };

  // Play sound and move the button randomly
  const playAndMoveButton = () => {
    playNewSound();
    const button = document.getElementById("funnyButton");
    if (button) {
      const randomX = Math.random() * window.innerWidth * 0.8;
      const randomY = Math.random() * window.innerHeight * 0.8;
      button.style.position = "absolute";
      button.style.left = `${randomX}px`;
      button.style.top = `${randomY}px`;
    }
  };

  // Play sound and animate the button
  const playWithWiggle = () => {
    setIsWiggling(true);
    playNewSound();
    setTimeout(() => setIsWiggling(false), 500); // Stop wiggling after 500ms
  };

  return (
    <div>
      {/* Play funny sound */}
      <button
        onClick={playFunnySound}
        className="p-2 bg-green-500 text-white rounded"
      >
        Play Funny Sound
      </button>

      {/* Play sound loop */}
      <button
        onClick={playFunnyLoop}
        className="p-2 bg-yellow-500 text-white rounded ml-2"
      >
        Play Funny Loop
      </button>

      {/* Play sound with delay */}
      <button
        onClick={playWithDelay}
        className="p-2 bg-purple-500 text-white rounded ml-2"
      >
        Play With Delay
      </button>

      {/* Play broken sound */}
      <button
        onClick={playBrokenSound}
        className="p-2 bg-red-500 text-white rounded ml-2"
      >
        Play Broken Sound
      </button>

      {/* Move button and play */}
      <button
        id="funnyButton"
        onClick={playAndMoveButton}
        className="p-2 bg-blue-500 text-white rounded ml-2"
      >
        Move & Play Sound
      </button>

      {/* Wiggle button */}
      <button
        onClick={playWithWiggle}
        className={`p-2 bg-teal-500 text-white rounded ml-2 ${
          isWiggling ? "animate-wiggle" : ""
        }`}
      >
        Wiggle & Play
      </button>

      {/* Fetch data */}
      <button
        id="myButton"
        onClick={handleClick}
        className="p-2 bg-gray-500 text-white rounded ml-2"
      >
        Fetch Data
      </button>

      {/* Display response data */}
      {data && (
        <div>
          <h2>Response Data:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}

      {/* Display error */}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default FetchDataButton;

// Add wiggle animation in your CSS file
// @keyframes wiggle {
//   0%, 100% { transform: rotate(-5deg); }
//   50% { transform: rotate(5deg); }
// }
// .animate-wiggle {
//   animation: wiggle 0.2s infinite;
// }
