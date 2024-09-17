#check timer, letters, word, and score word

class Validator:

    def countdown(self, timeleft):
        if timeleft > 0:
            return True
        else:
            return False

    def letter_tracker(self, player_hand, my_word):
       #checks if letters input by user are in playable hand, includes wilds
        check = True
        num_wildcards = player_hand.count("_")
        for c in my_word:
            if c not in player_hand:
                if num_wildcards > 0:
                    num_wildcards -= 1
                    continue
                else:
                    check = False
                    print ("Letter "+ c + " not available")
                    return check
        #checks if user has input letters more times than available in hand, includes wilds
        num_wildcards = player_hand.count("_")
        unique_letters = ''.join(set(my_word))
        print (unique_letters)
        for c in unique_letters:
            if my_word.count(c) > player_hand.count(c):
                wildcards_to_use = my_word.count(c) - player_hand.count(c)
                if num_wildcards - wildcards_to_use >= 0:
                    num_wildcards -= wildcards_to_use
                    continue
                else:
                    check = False
                    print ("Letter " + c + " used multiple times")
                    return check

        return check

    def word_search(self, my_word):
        word_list = []
        with open("backend\Collins Scrabble Words (2019).txt","r") as f:
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