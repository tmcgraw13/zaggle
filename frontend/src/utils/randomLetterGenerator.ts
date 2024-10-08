export function generateFourRandomLetters(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // Use uppercase if needed
  let letters = "";
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    letters += alphabet[randomIndex];
  }
  return letters;
}
