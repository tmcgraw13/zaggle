export interface Player {
    username: string;
    score: number;
    hand: string[]; // Assuming hand is an array of strings
    word_history: string[]; // Assuming word_history is an array of strings
    isLeader: boolean;
  }