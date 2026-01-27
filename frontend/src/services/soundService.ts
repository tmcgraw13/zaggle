/**
 * Sound effects service for Zaggle.
 *
 * Provides audio feedback for game events.
 * Uses use-sound library which is already installed.
 */

// Sound effect URLs (using free sounds)
// These should be placed in the public folder
export const SOUNDS = {
  validWord: "/sounds/success.mp3",
  invalidWord: "/sounds/error.mp3",
  tilePlace: "/sounds/tile-place.mp3",
  tilePick: "/sounds/tile-pick.mp3",
  gameEnd: "/sounds/game-end.mp3",
  countdown: "/sounds/countdown.mp3",
  buttonClick: "/sounds/click.mp3",
};

// Volume levels
export const VOLUME = {
  effects: 0.5,
  music: 0.3,
};

/**
 * Create a simple audio player for a sound effect.
 * Falls back gracefully if sound file doesn't exist.
 */
export function createSoundPlayer(
  soundUrl: string,
  volume: number = VOLUME.effects
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  let audio: HTMLAudioElement | null = null;

  return () => {
    try {
      if (!audio) {
        audio = new Audio(soundUrl);
        audio.volume = volume;
      }

      // Reset and play
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    } catch {
      // Ignore errors (sound file might not exist)
    }
  };
}

/**
 * Preload sounds for better performance.
 */
export function preloadSounds(): void {
  if (typeof window === "undefined") return;

  Object.values(SOUNDS).forEach((url) => {
    try {
      const audio = new Audio(url);
      audio.preload = "auto";
    } catch {
      // Ignore errors
    }
  });
}

/**
 * Sound effects hook for React components.
 */
export function useSoundEffects() {
  const playValidWord = createSoundPlayer(SOUNDS.validWord);
  const playInvalidWord = createSoundPlayer(SOUNDS.invalidWord);
  const playTilePlace = createSoundPlayer(SOUNDS.tilePlace, 0.3);
  const playTilePick = createSoundPlayer(SOUNDS.tilePick, 0.3);
  const playGameEnd = createSoundPlayer(SOUNDS.gameEnd);
  const playCountdown = createSoundPlayer(SOUNDS.countdown);
  const playClick = createSoundPlayer(SOUNDS.buttonClick, 0.4);

  return {
    playValidWord,
    playInvalidWord,
    playTilePlace,
    playTilePick,
    playGameEnd,
    playCountdown,
    playClick,
  };
}
