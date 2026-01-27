import { getRandomIcon, IconType } from "@/utils/randomIcon";
import React from "react";

const iconMapping: Record<IconType, string> = {
  dog: "/characters/dog.gif",
  water: "/characters/water.gif",
  fire: "/characters/fire.gif",
  penguin: "/characters/penguin.gif",
  christmas: "/characters/christmas.gif",
  computer: "/characters/computer.gif",
};

interface PlayerIconProps {
  icon?: string;
  size?: number;
  className?: string;
}

const PlayerIcon: React.FC<PlayerIconProps> = ({ icon, size, className = "" }) => {
  // If no icon is passed or invalid, use a random icon
  const selectedIcon = (icon && icon in iconMapping ? icon : getRandomIcon()) as IconType;

  return (
    <img
      src={iconMapping[selectedIcon]}
      alt={selectedIcon}
      className={`object-contain ${className}`}
      style={size ? { width: size, height: size } : { width: "100%", height: "100%" }}
    />
  );
};

export default PlayerIcon;
