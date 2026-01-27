"""
Tiered Word Checker for Zaggle

Uses a tiered dictionary structure organized by:
1. Word length (3-7 letters)
2. Commonality (common first, then rare)

This allows faster lookups since most played words are common.
"""

import json
from pathlib import Path
from collections import Counter
from typing import Optional, List, Set, Dict

# Get the backend directory
BACKEND_DIR = Path(__file__).parent
TIERED_DICT_JSON = BACKEND_DIR / "tiered_dictionary.json"
FLAT_DICT_JSON = BACKEND_DIR / "curated_dictionary.json"


class TieredWordChecker:
    """Fast word checker using tiered dictionary structure."""

    def __init__(self):
        self.common: Dict[str, Set[str]] = {}  # length -> set of words
        self.rare: Dict[str, Set[str]] = {}    # length -> set of words
        self.all_words: Set[str] = set()       # for quick contains check
        self._load_dictionary()

    def _load_dictionary(self):
        """Load the tiered dictionary."""
        if TIERED_DICT_JSON.exists():
            with open(TIERED_DICT_JSON, 'r', encoding='utf-8') as f:
                data = json.load(f)

            for length in ["3", "4", "5", "6", "7"]:
                self.common[length] = set(data.get("common", {}).get(length, []))
                self.rare[length] = set(data.get("rare", {}).get(length, []))
                self.all_words.update(self.common[length])
                self.all_words.update(self.rare[length])

            print(f"Loaded tiered dictionary: {len(self.all_words):,} words")
        elif FLAT_DICT_JSON.exists():
            # Fallback to flat dictionary
            with open(FLAT_DICT_JSON, 'r', encoding='utf-8') as f:
                words = json.load(f)
            self.all_words = set(w.upper() for w in words)

            # Build tiered structure from flat list
            for word in self.all_words:
                length = str(len(word))
                if length not in self.common:
                    self.common[length] = set()
                    self.rare[length] = set()
                # Put everything in rare since we don't have tier info
                self.rare[length].add(word)

            print(f"Loaded flat dictionary: {len(self.all_words):,} words")
        else:
            raise FileNotFoundError(
                "Dictionary not found. Run build_tiered_dictionary.py first."
            )

    def contains(self, word: str) -> bool:
        """Check if a word exists in the dictionary. O(1) lookup."""
        return word.upper() in self.all_words

    def can_make_word(self, letters: List[str], min_length: int = 3) -> bool:
        """Check if any valid word can be made from the given letters.

        Checks common words first for speed, then rare words.

        Args:
            letters: List of available letters (may include '_' wildcards)
            min_length: Minimum word length to consider

        Returns:
            True if at least one valid word can be formed
        """
        letter_counts = Counter(c.upper() for c in letters)
        wildcards = letter_counts.get('_', 0)

        # Check each length from min to max (7)
        for length in range(min_length, 8):
            str_length = str(length)

            # Check common words first (most likely to find a match)
            for word in self.common.get(str_length, set()):
                if self._can_form_word(word, letter_counts, wildcards):
                    return True

            # Then check rare words
            for word in self.rare.get(str_length, set()):
                if self._can_form_word(word, letter_counts, wildcards):
                    return True

        return False

    def _can_form_word(self, word: str, letter_counts: Counter, wildcards: int) -> bool:
        """Check if a specific word can be formed from available letters."""
        word_counts = Counter(word)
        wildcards_needed = 0

        for letter, count in word_counts.items():
            available = letter_counts.get(letter, 0)
            if count > available:
                wildcards_needed += count - available
                if wildcards_needed > wildcards:
                    return False

        return True

    def find_words(
        self,
        letters: List[str],
        min_length: int = 3,
        max_results: int = 100,
        common_only: bool = False
    ) -> List[str]:
        """Find valid words that can be made from the given letters.

        Returns common words first, then rare words.

        Args:
            letters: List of available letters
            min_length: Minimum word length
            max_results: Maximum number of words to return
            common_only: If True, only search common words

        Returns:
            List of valid words, sorted by commonality then length
        """
        results = []
        letter_counts = Counter(c.upper() for c in letters)
        wildcards = letter_counts.get('_', 0)

        # Search common words first
        for length in range(min_length, 8):
            if len(results) >= max_results:
                break
            str_length = str(length)
            for word in sorted(self.common.get(str_length, set())):
                if len(results) >= max_results:
                    break
                if self._can_form_word(word, letter_counts, wildcards):
                    results.append(word)

        # Then search rare words if needed
        if not common_only and len(results) < max_results:
            for length in range(min_length, 8):
                if len(results) >= max_results:
                    break
                str_length = str(length)
                for word in sorted(self.rare.get(str_length, set())):
                    if len(results) >= max_results:
                        break
                    if self._can_form_word(word, letter_counts, wildcards):
                        results.append(word)

        return results

    def find_best_word(self, letters: List[str], min_length: int = 3) -> Optional[str]:
        """Find the highest-scoring word from the given letters.

        Args:
            letters: List of available letters
            min_length: Minimum word length

        Returns:
            The highest-scoring valid word, or None
        """
        from scoring import calculate_points

        words = self.find_words(letters, min_length, max_results=200)
        if not words:
            return None

        return max(words, key=calculate_points)

    def count_possible_words(
        self,
        letters: List[str],
        min_length: int = 3,
        common_only: bool = False
    ) -> int:
        """Count how many words can be formed from the given letters.

        Args:
            letters: List of available letters
            min_length: Minimum word length
            common_only: If True, only count common words

        Returns:
            Number of possible words
        """
        letter_counts = Counter(c.upper() for c in letters)
        wildcards = letter_counts.get('_', 0)
        count = 0

        # Count common words
        for length in range(min_length, 8):
            str_length = str(length)
            for word in self.common.get(str_length, set()):
                if self._can_form_word(word, letter_counts, wildcards):
                    count += 1

        # Count rare words if needed
        if not common_only:
            for length in range(min_length, 8):
                str_length = str(length)
                for word in self.rare.get(str_length, set()):
                    if self._can_form_word(word, letter_counts, wildcards):
                        count += 1

        return count


# Global instance
_checker: Optional[TieredWordChecker] = None


def get_word_checker() -> TieredWordChecker:
    """Get or create the global word checker instance."""
    global _checker
    if _checker is None:
        _checker = TieredWordChecker()
    return _checker


# Convenience functions
def is_valid_word(word: str) -> bool:
    """Check if a word is in the dictionary."""
    return get_word_checker().contains(word)


def can_make_word(letters: List[str], min_length: int = 3) -> bool:
    """Check if any valid word can be made from the given letters."""
    return get_word_checker().can_make_word(letters, min_length)


def find_words(letters: List[str], min_length: int = 3, max_results: int = 100) -> List[str]:
    """Find all valid words that can be made from the given letters."""
    return get_word_checker().find_words(letters, min_length, max_results)


def find_best_word(letters: List[str], min_length: int = 3) -> Optional[str]:
    """Find the highest-scoring word from the given letters."""
    return get_word_checker().find_best_word(letters, min_length)


def count_possible_words(letters: List[str], min_length: int = 3) -> int:
    """Count how many words can be formed from the given letters."""
    return get_word_checker().count_possible_words(letters, min_length)


# Backwards compatibility - alias for get_word_checker
def get_word_trie() -> TieredWordChecker:
    """Backwards compatible alias for get_word_checker."""
    return get_word_checker()


if __name__ == "__main__":
    import time

    print("Testing Tiered Word Checker")
    print("=" * 60)

    checker = get_word_checker()

    # Test hands
    test_hands = [
        ['C', 'A', 'T', 'D', 'O', 'G', 'S'],
        ['F', 'I', 'X', 'E', 'D', 'U', 'P'],
        ['Q', 'U', 'I', 'Z', 'X', 'Y', 'Z'],
        ['A', 'E', 'I', 'O', 'U', 'R', 'T'],
        ['_', 'A', 'T', 'Z', 'Z', 'Z', 'Z'],  # With wildcard
    ]

    for hand in test_hands:
        print(f"\nHand: {hand}")

        # Time the can_make_word check
        start = time.time()
        can_make = can_make_word(hand)
        elapsed = (time.time() - start) * 1000

        print(f"  Can make word: {can_make} ({elapsed:.2f}ms)")

        if can_make:
            # Time finding words
            start = time.time()
            words = find_words(hand, max_results=10)
            elapsed = (time.time() - start) * 1000
            print(f"  Sample words ({elapsed:.2f}ms): {words[:5]}")

            # Count total
            start = time.time()
            count = count_possible_words(hand)
            elapsed = (time.time() - start) * 1000
            print(f"  Total possible: {count} words ({elapsed:.2f}ms)")

    # Performance test
    print("\n" + "=" * 60)
    print("Performance test - 100 can_make_word checks:")
    hand = ['C', 'A', 'T', 'D', 'O', 'G', 'S']
    start = time.time()
    for _ in range(100):
        can_make_word(hand)
    elapsed = time.time() - start
    print(f"  100 checks in {elapsed*1000:.1f}ms ({elapsed*10:.2f}ms each)")

    # Test specific words
    print("\n" + "=" * 60)
    print("Testing specific words:")
    test_words = ["FIX", "CAT", "DOG", "QUIZ", "JAZZ", "XYZZY", "ASDFG"]
    for word in test_words:
        valid = is_valid_word(word)
        print(f"  {word}: {'✓ valid' if valid else '✗ invalid'}")
