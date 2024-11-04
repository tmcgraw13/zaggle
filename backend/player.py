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

    @classmethod
    def from_dict(cls, data):
        """
        Creates a Player instance from a dictionary.
        """
        player = cls(data['username'], data.get('isLeader', False))
        player.score = data.get('score', 0)
        player.word_history = data.get('word_history', [])
        player.hand = data.get('hand', [])
        player.seq_index = data.get('seq_index', 0)
        return player

    def to_dict(self):
        """
        Converts the Player instance to a dictionary for JSON serialization.
        """
        return {
            'username': self.username,
            'score': self.score,
            'hand': self.hand,
            'word_history': self.word_history,
            'seq_index': self.seq_index,
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
    
    def clean_hand_after_play(self, word_played):
        # Removes letters from the player's hand based on the letters in word_played,
        # ensuring that it only removes each letter once and in the correct order.
        self.word_history.append(word_played)
        print("Before cleaning hand:", self.hand)
        
        temp_hand = self.hand[:]  # Copy of the hand for ordered removal
        
        for letter in word_played:
            if letter in temp_hand:
                temp_hand.remove(letter)  # Remove the exact letter
            elif "_" in temp_hand:
                temp_hand.remove("_")  # Remove a wildcard if letter isn't found

        self.hand = temp_hand  # Update the hand with removed letters
        print("After cleaning hand:", self.hand)


    def add_letters_to_hand(self,letters_to_add):
        self.hand+= letters_to_add
        self.seq_index += len(letters_to_add)

    def add_score(self,score):
        self.score += score

    