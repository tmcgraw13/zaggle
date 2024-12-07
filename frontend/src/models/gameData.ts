import { Player } from "./player";

export interface GameData {
    players: Player[];
    room_id: string;
    letter_seq: string[];
    start_time: string;
  }