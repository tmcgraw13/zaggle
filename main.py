from word_search import word_search
from Letters import letter_tracker
from letter_generation import LetterGeneration

class MainClass:
    #-----------------------------------------------------------#
    #                   INITIALIZATION                          #
    #-----------------------------------------------------------#
    def __init__(self):
        self.generate = LetterGeneration()
        

    def main(self):
        
        letters = self.generate.gen_n_letters(1000)
        my_word = input("enter word: ")
        word_search(my_word)
        letter_tracker(letters)

if __name__ == "__main__":
    instance = MainClass()
    instance.main()

