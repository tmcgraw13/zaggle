/**
 * Scrabble-style scoring system for Zaggle (client-side).
 *
 * This mirrors the backend scoring logic for instant point preview
 * as users drag tiles to form words.
 */

// Base letter values (Scrabble-inspired)
export const LETTER_VALUES: Record<string, number> = {
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
  _: 0, // Wildcard worth 0
};

// Length bonuses reward longer words
export const LENGTH_BONUSES: Record<number, number> = {
  3: 0, // 3-letter word: no bonus
  4: 1, // 4-letter word: +1
  5: 3, // 5-letter word: +3
  6: 6, // 6-letter word: +6
  7: 10, // 7-letter word: +10 (all tiles used!)
};

/**
 * Get the point value for a single letter.
 */
export function getLetterValue(letter: string): number {
  return LETTER_VALUES[letter.toUpperCase()] ?? 0;
}

/**
 * Get the length bonus for a word of given length.
 */
export function getLengthBonus(wordLength: number): number {
  return LENGTH_BONUSES[wordLength] ?? 0;
}

/**
 * Calculate total points for a word.
 *
 * Points = sum of letter values + length bonus
 *
 * @example
 * calculatePoints("CAT") // 5 (C:3 + A:1 + T:1 + bonus:0)
 * calculatePoints("QUIZ") // 23 (Q:10 + U:1 + I:1 + Z:10 + bonus:1)
 * calculatePoints("EXAMPLE") // 28 (E:1 + X:8 + A:1 + M:3 + P:3 + L:1 + E:1 + bonus:10)
 */
export function calculatePoints(word: string): number {
  if (!word) return 0;

  const upperWord = word.toUpperCase();

  // Calculate base score from letter values
  const baseScore = upperWord.split('').reduce(
    (sum, char) => sum + getLetterValue(char),
    0
  );

  // Add length bonus
  const lengthBonus = getLengthBonus(upperWord.length);

  return baseScore + lengthBonus;
}

/**
 * Calculate points with detailed breakdown.
 */
export function calculatePointsBreakdown(word: string): {
  letterValues: Array<{ letter: string; value: number }>;
  baseScore: number;
  lengthBonus: number;
  total: number;
} {
  if (!word) {
    return { letterValues: [], baseScore: 0, lengthBonus: 0, total: 0 };
  }

  const upperWord = word.toUpperCase();

  const letterValues = upperWord.split('').map((letter) => ({
    letter,
    value: getLetterValue(letter),
  }));

  const baseScore = letterValues.reduce((sum, { value }) => sum + value, 0);
  const lengthBonus = getLengthBonus(upperWord.length);

  return {
    letterValues,
    baseScore,
    lengthBonus,
    total: baseScore + lengthBonus,
  };
}

/**
 * Format points for display.
 *
 * @example
 * formatPoints(5) // "5 pts"
 * formatPoints(1) // "1 pt"
 */
export function formatPoints(points: number): string {
  return `${points} pt${points !== 1 ? "s" : ""}`;
}

/**
 * Get a description of how points were calculated.
 *
 * @example
 * getPointsDescription("CAT") // "C(3) + A(1) + T(1) = 5 pts"
 */
export function getPointsDescription(word: string): string {
  const breakdown = calculatePointsBreakdown(word);

  if (breakdown.letterValues.length === 0) return "";

  const letterPart = breakdown.letterValues
    .map(({ letter, value }) => `${letter}(${value})`)
    .join(" + ");

  const bonusPart =
    breakdown.lengthBonus > 0 ? ` + bonus(${breakdown.lengthBonus})` : "";

  return `${letterPart}${bonusPart} = ${formatPoints(breakdown.total)}`;
}
