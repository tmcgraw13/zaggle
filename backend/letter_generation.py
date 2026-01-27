"""
Letter generation for Zaggle with guaranteed playable hands.

This module handles the Scrabble-style letter distribution and ensures
that players always have at least one valid word in their hand.
"""

import random
from typing import List, Optional
from word_checker import can_make_word


class LetterGeneration:
    """Generates letters for the game with guaranteed playable hands."""

    # Scrabble tile distribution (100 tiles + 2 wildcards)
    SCRABBLE_BAG = [
        'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A',  # 9 A's
        'B', 'B',  # 2 B's
        'C', 'C',  # 2 C's
        'D', 'D', 'D', 'D',  # 4 D's
        'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E',  # 12 E's
        'F', 'F',  # 2 F's
        'G', 'G', 'G',  # 3 G's
        'H', 'H',  # 2 H's
        'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I', 'I',  # 9 I's
        'J',  # 1 J
        'K',  # 1 K
        'L', 'L', 'L', 'L',  # 4 L's
        'M', 'M',  # 2 M's
        'N', 'N', 'N', 'N', 'N', 'N',  # 6 N's
        'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O',  # 8 O's
        'P', 'P',  # 2 P's
        'Q',  # 1 Q
        'R', 'R', 'R', 'R', 'R', 'R',  # 6 R's
        'S', 'S', 'S', 'S',  # 4 S's
        'T', 'T', 'T', 'T', 'T', 'T',  # 6 T's
        'U', 'U', 'U', 'U',  # 4 U's
        'V', 'V',  # 2 V's
        'W', 'W',  # 2 W's
        'X',  # 1 X
        'Y', 'Y',  # 2 Y's
        'Z',  # 1 Z
        '_', '_'  # 2 wildcards
    ]

    # Common letters to use when ensuring playable hands
    COMMON_LETTERS = ['E', 'A', 'R', 'T', 'O', 'I', 'N', 'S', 'L', 'U']

    # Maximum attempts before forcing a known good hand
    MAX_PLAYABLE_ATTEMPTS = 50

    def __init__(self):
        self.scrabble_bag = [c.upper() for c in self.SCRABBLE_BAG]
        self.letters_sequence = []

    def gen_n_letters(self, n: int = 500):
        """Generate a sequence of n random letters from the tile bag.

        The bag is refilled when exhausted to allow for longer games.
        """
        self.letters_sequence = []
        tileset = self.scrabble_bag.copy()
        bag_size = len(tileset)

        for _ in range(n):
            if bag_size == 0:
                tileset = self.scrabble_bag.copy()
                bag_size = len(tileset)

            rand_idx = random.randrange(0, bag_size)
            self.letters_sequence.append(tileset[rand_idx])
            tileset.pop(rand_idx)
            bag_size -= 1

    def get_random_letter(self) -> str:
        """Get a single random letter from the bag."""
        return random.choice(self.scrabble_bag)

    def get_random_common_letter(self) -> str:
        """Get a random common letter (vowels and common consonants)."""
        return random.choice(self.COMMON_LETTERS)

    def give_player_letters(
        self,
        current_hand: List[str],
        target_length: int = 7,
        ensure_playable: bool = True
    ) -> List[str]:
        """Fill the player's hand to target_length letters.

        Args:
            current_hand: The player's current hand
            target_length: The desired hand size (default 7)
            ensure_playable: If True, ensure at least one word can be formed

        Returns:
            The updated hand with new letters added
        """
        hand = current_hand.copy()

        # Add letters until hand is full
        while len(hand) < target_length:
            if len(self.letters_sequence) == 0:
                self.gen_n_letters(target_length * 2)
            hand.append(self.letters_sequence.pop(0))

        # Ensure the hand is playable if requested
        if ensure_playable:
            hand = self.ensure_playable_hand(hand)

        return hand

    def ensure_playable_hand(
        self,
        hand: List[str],
        min_word_length: int = 3
    ) -> List[str]:
        """Ensure the hand can form at least one valid word.

        If no word can be formed, replace some letters with more common ones.

        Args:
            hand: The current hand of letters
            min_word_length: Minimum word length to check for

        Returns:
            A hand that can form at least one valid word
        """
        if can_make_word(hand, min_word_length):
            return hand

        # Try replacing random letters with common ones
        attempts = 0
        test_hand = hand.copy()

        while attempts < self.MAX_PLAYABLE_ATTEMPTS:
            if can_make_word(test_hand, min_word_length):
                return test_hand

            # Replace 1-2 random non-common letters
            replace_count = min(2, len(test_hand))
            indices_to_replace = random.sample(range(len(test_hand)), replace_count)

            for idx in indices_to_replace:
                test_hand[idx] = self.get_random_common_letter()

            attempts += 1

        # Fallback: Force a known playable combination
        return self.inject_guaranteed_word(test_hand)

    def inject_guaranteed_word(self, hand: List[str]) -> List[str]:
        """Force a hand to be playable by injecting common letters.

        This is a last resort when random replacement doesn't work.

        Args:
            hand: The current hand

        Returns:
            A hand guaranteed to form at least one word
        """
        result = hand.copy()

        # Replace first 3 letters with a guaranteed word combo
        # "ATE", "THE", "ARE", "EAT" etc. are all common 3-letter words
        guaranteed_combos = [
            ['A', 'T', 'E'],
            ['T', 'H', 'E'],
            ['A', 'R', 'E'],
            ['E', 'A', 'T'],
            ['S', 'E', 'T'],
            ['R', 'A', 'N'],
            ['C', 'A', 'T'],
            ['D', 'O', 'G'],
        ]

        combo = random.choice(guaranteed_combos)
        for i, letter in enumerate(combo):
            if i < len(result):
                result[i] = letter
            else:
                result.append(letter)

        return result

    def replace_random_letters(
        self,
        hand: List[str],
        count: int = 2
    ) -> List[str]:
        """Replace random letters in the hand with new ones from the bag.

        Args:
            hand: The current hand
            count: Number of letters to replace

        Returns:
            The hand with replaced letters
        """
        result = hand.copy()
        count = min(count, len(result))
        indices = random.sample(range(len(result)), count)

        for idx in indices:
            result[idx] = self.get_random_letter()

        return result

    def deal_new_hand(self, hand_size: int = 7, ensure_playable: bool = True) -> List[str]:
        """Deal a completely new hand of letters.

        Args:
            hand_size: Number of letters in the hand
            ensure_playable: If True, ensure at least one word can be formed

        Returns:
            A new hand of letters
        """
        return self.give_player_letters([], hand_size, ensure_playable)


# Convenience function for external use
def deal_guaranteed_playable_hand(hand_size: int = 7) -> List[str]:
    """Create a new hand guaranteed to form at least one word.

    Args:
        hand_size: Number of letters in the hand

    Returns:
        A playable hand
    """
    generator = LetterGeneration()
    return generator.deal_new_hand(hand_size, ensure_playable=True)


if __name__ == "__main__":
    import time

    print("Testing Letter Generation with Guaranteed Playable Hands")
    print("=" * 60)

    generator = LetterGeneration()

    # Test generating multiple hands
    print("\nGenerating 10 hands and checking playability:")
    for i in range(10):
        hand = generator.deal_new_hand(7, ensure_playable=True)
        is_playable = can_make_word(hand)
        from word_checker import find_words
        words = find_words(hand, max_results=5)
        print(f"  Hand {i+1}: {hand} -> Playable: {is_playable}, Words: {words[:3]}")

    # Test edge case: all consonants (should still become playable)
    print("\nEdge case - starting with all consonants:")
    bad_hand = ['B', 'C', 'D', 'F', 'G', 'H', 'J']
    fixed_hand = generator.ensure_playable_hand(bad_hand)
    is_playable = can_make_word(fixed_hand)
    words = find_words(fixed_hand, max_results=5)
    print(f"  Original: {bad_hand}")
    print(f"  Fixed:    {fixed_hand} -> Playable: {is_playable}, Words: {words[:3]}")

    # Performance test
    print("\nPerformance test - dealing 100 guaranteed hands:")
    start = time.time()
    for _ in range(100):
        generator.deal_new_hand(7, ensure_playable=True)
    elapsed = time.time() - start
    print(f"  100 hands dealt in {elapsed:.3f}s ({elapsed*10:.1f}ms per hand)")
