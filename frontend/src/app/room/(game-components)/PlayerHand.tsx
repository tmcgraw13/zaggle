import { Player } from "@/models/player";
import React from "react";



interface PlayerHandProps {
    current_player: Player;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ current_player }) => {
    return (
        <div className="flex gap-2">
            {current_player.hand.map((letter, idx) => (
                <span
                    key={idx}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 border border-gray-300 text-lg font-semibold text-gray-700 shadow"
                >
                    {letter}
                </span>
            ))}
        </div>
    );
};

export default PlayerHand;