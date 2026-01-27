"""
Scrabble-style scoring system for Zaggle.

Letter values are based on Scrabble tile values, with length bonuses
to reward longer words.
"""

# Base letter values (Scrabble-inspired)
LETTER_VALUES = {
    'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4,
    'I': 1, 'J': 8, 'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3,
    'Q': 10, 'R': 1, 'S': 1, 'T': 1, 'U': 1, 'V': 4, 'W': 4, 'X': 8,
    'Y': 4, 'Z': 10, '_': 0  # Wildcard worth 0
}

# Length bonuses reward longer words
LENGTH_BONUSES = {
    3: 0,   # 3-letter word: no bonus
    4: 1,   # 4-letter word: +1
    5: 3,   # 5-letter word: +3
    6: 6,   # 6-letter word: +6
    7: 10   # 7-letter word: +10 (all tiles used!)
}


def get_letter_value(letter: str) -> int:
    """Get the point value for a single letter.

    Args:
        letter: A single character (letter or wildcard)

    Returns:
        Point value for the letter
    """
    return LETTER_VALUES.get(letter.upper(), 0)


def get_length_bonus(word_length: int) -> int:
    """Get the length bonus for a word of given length.

    Args:
        word_length: Number of letters in the word

    Returns:
        Bonus points for the word length
    """
    return LENGTH_BONUSES.get(word_length, 0)


def calculate_points(word: str) -> int:
    """Calculate total points for a word.

    Points = sum of letter values + length bonus

    Args:
        word: The word to score

    Returns:
        Total points for the word

    Example:
        >>> calculate_points("CAT")
        5  # C(3) + A(1) + T(1) + bonus(0) = 5

        >>> calculate_points("QUIZ")
        23  # Q(10) + U(1) + I(1) + Z(10) + bonus(1) = 23

        >>> calculate_points("EXAMPLE")
        28  # E(1) + X(8) + A(1) + M(3) + P(3) + L(1) + E(1) + bonus(10) = 28
    """
    if not word:
        return 0

    word = word.upper()

    # Calculate base score from letter values
    base_score = sum(get_letter_value(c) for c in word)

    # Add length bonus
    length_bonus = get_length_bonus(len(word))

    return base_score + length_bonus


def calculate_points_breakdown(word: str) -> dict:
    """Calculate points with detailed breakdown.

    Args:
        word: The word to score

    Returns:
        Dictionary with letter_values (list), length_bonus, and total
    """
    if not word:
        return {'letter_values': [], 'base_score': 0, 'length_bonus': 0, 'total': 0}

    word = word.upper()

    # Use list of tuples to preserve each letter occurrence
    letter_values = [(c, get_letter_value(c)) for c in word]
    base_score = sum(v for _, v in letter_values)
    length_bonus = get_length_bonus(len(word))

    return {
        'letter_values': letter_values,
        'base_score': base_score,
        'length_bonus': length_bonus,
        'total': base_score + length_bonus
    }


# Convenience exports for common use cases
def score_word(word: str) -> int:
    """Alias for calculate_points for backwards compatibility."""
    return calculate_points(word)


if __name__ == "__main__":
    # Test the scoring system
    test_words = ["CAT", "QUIZ", "DOG", "EXAMPLE", "HI", "JAZZ", "FREEZE"]

    print("Zaggle Scoring Test")
    print("=" * 50)

    for word in test_words:
        breakdown = calculate_points_breakdown(word)
        letters_str = " + ".join(f"{c}({v})" for c, v in breakdown['letter_values'])
        print(f"\n{word}:")
        print(f"  Letters: {letters_str}")
        print(f"  Base: {breakdown['base_score']}, Bonus: {breakdown['length_bonus']}")
        print(f"  Total: {breakdown['total']} points")
