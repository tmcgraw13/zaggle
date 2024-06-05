import random

class LetterGeneration:
    # Methods - generates original tileset. 
    #         - gives player new letters_sequence.
    # Fields - 
    letters_sequence = []

    def __init__(self):
        self.scrabble_bag = ['a','a','a','a','a','a','a','a','a','b','b','c','c','d','d','d','d','e','e','e','e','e','e','e','e','e','e','e','e','f','f','g','g','g','h','h','i','i','i','i','i','i','i','i','i','j','k','l','l','l','l','m','m','n','n','n','n','n','n','o','o','o','o','o','o','o','o','p','p','q','r','r','r','r','r','r','s','s','s','s','t','t','t','t','t','t','u','u','u','u','v','v','w','w','x','y','y','z','*','?']

    def gen_n_letters(self,n=500):
        
        tileset = self.scrabble_bag.copy()

        i = 0
        bag_size = 100
        while i < n:
            rand = random.randrange(0,bag_size)
            self.letters_sequence.append(tileset[rand])
            tileset.pop(rand)
            i+=1 
            bag_size -=1

            #reset bag
            if bag_size == 0:
                bag_size = 100
                tileset = self.scrabble_bag.copy()

    def remove_used_letters(self, word, player_hand):
            for character in word:
                player_hand.remove(character)
            return player_hand

    def give_player_letters(self,used_hand, hand_length):
        while len(used_hand) < hand_length: 
            if len(self.letters_sequence) == 0:
                self.gen_n_letters(hand_length)
            used_hand.append(self.letters_sequence.pop(0))
        return used_hand