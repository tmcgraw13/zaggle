import serverUrl from "@/utils/config";

/**
 * Fetch data from the backend API.
 * @returns {Promise<any>} The response data from the API.
 */
export const fetchData = async (): Promise<any> => {
  try {
    const response = await fetch(`${serverUrl}/api`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Fetching data failed: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};

/**
 * Fetch data from the backend API.
 * @returns {Promise<any>} The response data from the API.
 */
export const startGame = async (): Promise<any> => {
  try {
    const response = await fetch(`${serverUrl}/api/start`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Fetching data failed: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};

/**
 * Submit a word to the backend API for validation and scoring.
 * @param {string} word - The word to be validated and scored.
 * @param {string} playerHand - The current player's hand.
 * @returns {Promise<any>} The response data from the API.
 */
export const playWord = async (word: string, playerHand: string): Promise<any> => {
  try {
    const response = await fetch(`${serverUrl}/api/play`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ my_word: word, player_hand: playerHand }),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Submitting word failed: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};
