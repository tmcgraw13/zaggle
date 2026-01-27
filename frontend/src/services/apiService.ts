import { Player } from "@/models/player";
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
        "ngrok-skip-browser-warning": "true",
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
 * @param {Array<string>} names the players playing the game at start time
 * @param {string} roomId - The current player's hand.
 * @param {string} startTime - The current player's hand.
 * @returns {Promise<any>} The response data from the API.
 */
export const startGame = async ( roomCode: string, startTime: Date): Promise<any> => {
  try {
    const response = await fetch(`${serverUrl}/api/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ room_id: roomCode, start_time: startTime }),
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
export const playWord = async (word: string, player: Player, gameCode: string, difficultyBonus: number = 0): Promise<any> => {
  try {
    const response = await fetch(`${serverUrl}/api/play`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ my_word: word, player: player, game_code: gameCode, difficulty_bonus: difficultyBonus }),
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

/**
 * Get the count of possible words for a given hand.
 * @param {string[]} hand - The player's current hand of letters.
 * @returns {Promise<{count: number, sample_words: string[]}>} The word count and sample words.
 */
export const getWordCount = async (hand: string[]): Promise<{count: number, sample_words: string[]}> => {
  try {
    const response = await fetch(`${serverUrl}/api/word-count`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ hand }),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Getting word count failed: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};

/**
 * Shuffle some letters in the player's hand to guarantee playable words.
 * @param {string} gameCode - The game code.
 * @param {string} username - The player's username.
 * @param {boolean} applyPenalty - Whether to apply a point penalty (manual shuffle).
 * @returns {Promise<{message: string, player: Player, penalty_applied: boolean, penalty_amount: number}>} The updated player data.
 */
export const shuffleHand = async (
  gameCode: string,
  username: string,
  applyPenalty: boolean = false
): Promise<{message: string, player: any, penalty_applied: boolean, penalty_amount: number}> => {
  try {
    const response = await fetch(`${serverUrl}/api/shuffle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({ game_code: gameCode, username, apply_penalty: applyPenalty }),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Shuffling hand failed: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};
