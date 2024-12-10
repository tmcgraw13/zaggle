// utils/randomIcon.ts

export const getRandomIcon = () => {
    const icons = ["dog", "water", "fire", "penguin", "christmas", "computer"];
    const randomIndex = Math.floor(Math.random() * icons.length);
    return icons[randomIndex];
  };
  