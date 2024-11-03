# Playerhand
# score
# word history

class Player: 

    def __init__(self,username: str, isLeader = False): 

        self.username = username
        self.score = 0 
        self.word_history= []
        self.hand = []
        self.seq_index = 0
        self.isLeader: bool = isLeader

    def to_dict(self):
        return {
            'username': self.username,
            'score': self.score,
            'hand': self.hand,  # Ensure this is a list for JSON serialization
            'word_history': self.word_history,  # Also should be a list
            'isLeader': self.isLeader
        }

    def get_username(self):
        return self.username
    
    def get_isLeader(self):
        return self.isLeader
    
    def set_hand(self,letters):
        self.hand = letters
    def get_hand(self):
        return self.hand
    
    def set_score(self,score):
        self.score = score
    def get_score(self):
        return self.score
    
    def get_seq_index(self):
        return self.seq_index
    def set_seq_index(self,seq_index):
        self.seq_index = seq_index
    
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
        self.seq_index += len(letters_to_add)

    def add_score(self,score):
        self.score += score

    