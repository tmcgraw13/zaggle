from score_checker import WordScore

def word_search(self):
    word_list = []
    with open("Collins Scrabble Words (2019).txt","r") as f:
        word_list = f.readlines()[2:]
        word_list = [x.rstrip("\n") for x in word_list]
        word_list = [x for x in word_list if (len(x) >= 3 and len(x) <= 7) ]

    print(len(word_list))

    while True:
        my_word = input("Enter a word: ").upper()
        if my_word.isalpha():
            print(my_word in word_list)
            self.score.lengthChecker(my_word)
            return my_word
        else:
            print("Word must not contain numbers or special characters!")