"""
Validator for Zaggle game.

Handles word validation, letter checking, and scoring.
Uses the curated dictionary for faster lookups and better word quality.
"""

import os
from typing import List, Set, Optional
from scoring import calculate_points
from word_checker import is_valid_word, get_word_trie


class Validator:
    """Validates words and scores them for the Zaggle game."""

    def __init__(self):
        """Initialize the validator and load the dictionary."""
        # Load dictionary on initialization for fast lookups
        self._word_trie = get_word_trie()

    def countdown(self, timeleft: float) -> bool:
        """Check if game time is remaining.

        Args:
            timeleft: Seconds remaining in the game

        Returns:
            True if time remains, False if game is over
        """
        return timeleft > 0

    def letter_tracker(self, player_hand: List[str], my_word: str) -> bool:
        """Check if the word can be formed from the player's hand.

        Validates that all letters in the word are available in the hand,
        including support for wildcard tiles ('_').

        Args:
            player_hand: List of letters available to the player
            my_word: The word the player wants to play

        Returns:
            True if the word can be formed, False otherwise
        """
        my_word = my_word.upper()
        hand = [c.upper() for c in player_hand]

        # Count available wildcards
        num_wildcards = hand.count("_")

        # First pass: check if all letters are available (using wildcards as needed)
        for c in my_word:
            if c not in hand:
                if num_wildcards > 0:
                    num_wildcards -= 1
                    continue
                else:
                    print(f"Letter {c} not available")
                    return False

        # Second pass: check letter counts (player can't use a letter more times than they have)
        num_wildcards = hand.count("_")
        unique_letters = set(my_word)

        for c in unique_letters:
            word_count = my_word.count(c)
            hand_count = hand.count(c)

            if word_count > hand_count:
                wildcards_needed = word_count - hand_count
                if num_wildcards >= wildcards_needed:
                    num_wildcards -= wildcards_needed
                else:
                    print(f"Letter {c} used more times than available")
                    return False

        return True

    def word_search(self, my_word: str) -> bool:
        """Check if a word is in the curated dictionary.

        Supports wildcard tiles ('_') which can represent any letter.

        Args:
            my_word: The word to validate (may contain '_' wildcards)

        Returns:
            True if the word is valid, False otherwise
        """
        if not my_word:
            print("Word is empty!")
            return False

        word = my_word.upper()

        # Check that word contains only letters and wildcards
        for c in word:
            if not c.isalpha() and c != '_':
                print(f"Invalid character in word: {c}")
                return False

        # Check length constraints (3-7 letters)
        if len(word) < 3:
            print("Word must be at least 3 letters!")
            return False

        if len(word) > 7:
            print("Word must be at most 7 letters!")
            return False

        # If word has wildcards, try all possible letter combinations
        if '_' in word:
            return self._check_wildcard_word(word)

        # Check against curated dictionary
        return is_valid_word(word)

    def _check_wildcard_word(self, word: str) -> bool:
        """Check if a word with wildcards matches any dictionary word.

        Args:
            word: Word containing '_' wildcards

        Returns:
            True if any letter substitution produces a valid word
        """
        import string

        # Find all wildcard positions
        wildcard_positions = [i for i, c in enumerate(word) if c == '_']

        if not wildcard_positions:
            return is_valid_word(word)

        # Try all combinations
        chars = list(word)

        def try_combinations(pos_index: int) -> bool:
            if pos_index >= len(wildcard_positions):
                candidate = ''.join(chars)
                return is_valid_word(candidate)

            wildcard_pos = wildcard_positions[pos_index]
            for letter in string.ascii_uppercase:
                chars[wildcard_pos] = letter
                if try_combinations(pos_index + 1):
                    return True
            chars[wildcard_pos] = '_'
            return False

        return try_combinations(0)

    def score_word(self, word: str) -> int:
        """Calculate points for a word using Scrabble-style scoring.

        Points = sum of letter values + length bonus

        Args:
            word: The word to score

        Returns:
            Point value of the word (0 if invalid length)
        """
        if not word:
            return 0

        word = word.upper()
        length = len(word)

        # Validate length
        if length < 3 or length > 7:
            return 0

        score = calculate_points(word)
        print(f"Word '{word}' is worth {score} point{'s' if score != 1 else ''}")
        return score

    def validate_word(self, player_hand: List[str], word: str) -> tuple:
        """Full validation: check letters, dictionary, and calculate score.

        Args:
            player_hand: List of letters available to the player
            word: The word the player wants to play

        Returns:
            Tuple of (is_valid: bool, score: int, message: str)
        """
        word = word.upper()

        # Check if word can be formed from hand
        if not self.letter_tracker(player_hand, word):
            return (False, 0, "Cannot form word from available letters")

        # Check if word is in dictionary
        if not self.word_search(word):
            return (False, 0, f"'{word}' is not a valid word")

        # Calculate score
        score = self.score_word(word)
        return (True, score, f"'{word}' accepted for {score} points!")


# Legacy function support for backwards compatibility
_validator_instance: Optional[Validator] = None


def get_validator() -> Validator:
    """Get or create a singleton validator instance."""
    global _validator_instance
    if _validator_instance is None:
        _validator_instance = Validator()
    return _validator_instance


if __name__ == "__main__":
    import time

    print("Testing Validator")
    print("=" * 50)

    validator = Validator()

    # Test words
    test_cases = [
        (['C', 'A', 'T', 'D', 'O', 'G', 'S'], "CAT"),
        (['C', 'A', 'T', 'D', 'O', 'G', 'S'], "CATS"),
        (['C', 'A', 'T', 'D', 'O', 'G', 'S'], "DOGS"),
        (['C', 'A', 'T', 'D', 'O', 'G', 'S'], "COD"),
        (['C', 'A', 'T', 'D', 'O', 'G', 'S'], "XYZ"),  # Not available
        (['C', 'A', 'T', 'D', 'O', 'G', 'S'], "ZZZZ"),  # Invalid word
        (['Q', 'U', 'I', 'Z', 'X', 'Y', 'A'], "QUIZ"),
        (['_', 'A', 'T', 'D', 'O', 'G', 'S'], "CAT"),  # Using wildcard
        (['E', 'X', 'A', 'M', 'P', 'L', 'E'], "EXAMPLE"),
    ]

    print("\nValidation tests:")
    for hand, word in test_cases:
        is_valid, score, message = validator.validate_word(hand, word)
        status = "VALID" if is_valid else "INVALID"
        print(f"  {hand} -> '{word}': {status} ({score} pts) - {message}")

    # Performance test
    print("\nPerformance test - 1000 validations:")
    hand = ['C', 'A', 'T', 'D', 'O', 'G', 'S']
    start = time.time()
    for _ in range(1000):
        validator.validate_word(hand, "CATS")
    elapsed = time.time() - start
    print(f"  1000 validations in {elapsed:.3f}s ({elapsed*1000:.1f}ms total, {elapsed:.3f}ms each)")
