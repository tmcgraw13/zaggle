#check timer, letters, word, and score word

class Validator:

    def countdown(self, timeleft):
        if timeleft > 0:
            return True
        else:
            return False

    def letter_tracker(self, player_hand, my_word):
       
       #checks if letters input by user are in playable hand
        check = True
        for c in my_word:
            if c not in player_hand:
                check = False
                print ("Letter "+ c + " not available")
                return check
        #checks if user has input letters more times than available in hand
        for c in my_word:
            if my_word.count(c) > player_hand.count(c):
                check = False
                print ("Letter " + c + " used multiple times")
                return check
            
        return check

    def word_search(self, my_word):
        word_list = []
        with open("Collins Scrabble Words (2019).txt","r") as f:
            word_list = f.readlines()[2:]
            word_list = [x.rstrip("\n") for x in word_list]
            word_list = [x for x in word_list if (len(x) >= 3 and len(x) <= 7) ]

        if my_word.isalpha():
            return (my_word.upper() in word_list)
        else:
            print("Word must not contain numbers or special characters!")
            return False

    def score_word(self, word):
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