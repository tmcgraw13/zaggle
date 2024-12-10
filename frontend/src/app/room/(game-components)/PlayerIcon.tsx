import { getRandomIcon } from "@/utils/randomIcon";
import React from "react";

// Add your GIFs here or link to external URLs
const iconMapping: { [key: string]: string } = {
  dog: "/characters/dog.gif",    // Replace with the actual paths to your GIFs
  water: "/characters/water.gif",
  fire: "/characters/fire.gif",  // Fixed double slash in the path
  penguin: "/characters/penguin.gif",
  christmas: "/characters/christmas.gif",
  computer: "/characters/computer.gif",
};

interface PlayerIconProps {
  icon?: string;  // One of "dog", "water", "fire", "penguin", or undefined
}

const PlayerIcon: React.FC<PlayerIconProps> = ({ icon }) => {
  // If no icon is passed, use a random icon
  const selectedIcon = icon || getRandomIcon();

  return <img src={iconMapping[selectedIcon]} alt={selectedIcon} style={{ width: 50, height: 50 }} />;
};

export default PlayerIcon;
