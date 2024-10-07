/**
 * Function to check if a string contains only alphabetic characters.
 * @param inputVal - The input character to validate.
 * @returns boolean - True if the inputVal contains only alphabetic characters, false otherwise.
 */
export function isAlphabetic(inputVal: string): boolean {
    const patt = /^[a-zA-Z]+$/; // Pattern to match only alphabetic characters
    return patt.test(inputVal);
}
