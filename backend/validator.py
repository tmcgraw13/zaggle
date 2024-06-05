#check timer, letters, word, and score word
from timert import countdown
from Letters import letter_tracker
from word_search import word_search
from score_checker import lengthChecker


def validator(timeleft, current_letters, valid_word):

    countdown(timeleft)
    letter_tracker(current_letters)
    word_search(valid_word)
    lengthChecker(valid_word)