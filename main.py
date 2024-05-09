from word_search import WordSearch
from letter_generation import LetterGeneration

class MainClass:
    #-----------------------------------------------------------#
    #                   INITIALIZATION                          #
    #-----------------------------------------------------------#
    def __init__(self):
        self.generate = LetterGeneration()
        self.search = WordSearch()

    def main(self):
        print(self.generate.gen_letters())
        self.search.word_search()

if __name__ == "__main__":
    instance = MainClass()
    instance.main()

