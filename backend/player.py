# Playerhand
# score
# word history

class Player: 

    

    def __init__(self): 
        self.score = 0 
        self.word_history= []
        self.hand = []

    def set_hand(self,letters):
        self.hand = letters
    def get_hand(self):
        return self.hand
    
    def set_score(self,score):
        self.score = score
    def get_score(self):
        return self.score
    
    
    def clear_hand(self):
        self.hand = []
    
    def clean_hand_after_play(self,word_played):
        self.word_history.append(word_played)
        print(self.hand)
        for letter in word_played:
            if letter in self.hand:
                self.hand.remove(letter)
            else:
                self.hand.remove("_")

    def add_letters_to_hand(self,letters_to_add):
        self.hand+= letters_to_add

    def add_score(self,score):
        self.score += score

    