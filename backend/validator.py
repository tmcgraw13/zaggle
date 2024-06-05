#check timer, letters, word, and score word

class Validator:

    def countdown(self, timeleft):
        if timeleft > 0:
            return True
        else:
            return False

    def letter_tracker(self, abc_array):
        usable = abc_array[:7]
        abc_array = abc_array[7:]
        print(usable)
        my_word = input("enter word: ")
        #if input True in dictionary
        #return usable without letters used plus next sequence
        #remove letters from usable and add next amount of letters equal to input length
        #parse out letters from input, check if all available, remove those letters, add in the next sequence
        #with the same amount of letters removed into the original sequence
        #if input True:
        check = True
        for c in my_word:
            if c not in usable:
                check = False
                print ("Letter "+ c + " not available")
                break
        #check input occurences of letter, compare to usable, input must be less than or equal to usable
        for c in my_word:
            if my_word.count(c) > usable.count(c):
                check = False
                print ("Letter " + c + " used multiple times")
                break
        if check:
            for c in my_word:
                usable.remove(c)
                print (usable)
        #for length of input, pop next letter from array into usable
        if check:
            used = len(my_word)
        else:
            used = 0 

        for i in range(0, used):
            usable.append(abc_array.pop(0))
        print (usable)

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
                self.length_checker(my_word)
                return my_word
            else:
                print("Word must not contain numbers or special characters!")

    def length_checker(self, word):
        score = 0
        if len(word) >= 8:
            score = 0
        elif len(word) <= 2:
            score = 0
        else: 
            score = len(word) - 2
        scoreMessage = "This is worth %d point%s"
        print(scoreMessage % (score, "s" if score != 1 else ""))
        return score