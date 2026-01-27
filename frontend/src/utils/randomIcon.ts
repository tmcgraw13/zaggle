// utils/randomIcon.ts

export const AVAILABLE_ICONS = ["dog", "water", "fire", "penguin", "christmas", "computer"] as const;
export type IconType = (typeof AVAILABLE_ICONS)[number];

export const getRandomIcon = (): IconType => {
  const randomIndex = Math.floor(Math.random() * AVAILABLE_ICONS.length);
  return AVAILABLE_ICONS[randomIndex];
};

export const getIconLabel = (icon: IconType): string => {
  const labels: Record<IconType, string> = {
    dog: "Dog",
    water: "Water",
    fire: "Fire",
    penguin: "Penguin",
    christmas: "Christmas",
    computer: "Computer",
  };
  return labels[icon] || icon;
};
