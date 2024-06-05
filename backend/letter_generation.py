import random

class LetterGeneration:
    # Methods - generates original tileset. 
    #         - gives player new letters_sequence.
    # Fields - 

    def __init__(self):
        self.scrabble_bag = ['a','a','a','a','a','a','a','a','a','b','b','c','c','d','d','d','d','e','e','e','e','e','e','e','e','e','e','e','e','f','f','g','g','g','h','h','i','i','i','i','i','i','i','i','i','j','k','l','l','l','l','m','m','n','n','n','n','n','n','o','o','o','o','o','o','o','o','p','p','q','r','r','r','r','r','r','s','s','s','s','t','t','t','t','t','t','u','u','u','u','v','v','w','w','x','y','y','z','*','?']

    def gen_n_letters(self,hand_length):
        
        tileset = self.scrabble_bag.copy()

        letters = []

        i = 0
        bag_size = 100
        while i < hand_length:
            rand = random.randrange(0,bag_size)
            letters.append(tileset[rand])
            tileset.pop(rand)
            i+=1 
            bag_size -=1

            #reset bag
            if bag_size == 0:
                bag_size = 100
                tileset = self.scrabble_bag.copy()
        return letters

    def clean_letter(self, word, player_hand):
            for character in word:
                player_hand.remove(character)
            return player_hand

    def add_letters(player_hand, current_tileset):
        while len(player_hand) < 7:
            player_hand.append(current_tileset.pop(0))
        return player_hand, current_tileset
    
    def give_player_letters(self,used_hand, hand_length,):

        while len(used_hand) < hand_length: 
            if len(self.letter_sequence) == 0:
                self.gen_n_letters(hand_length)
            used_hand.append(self.letters_sequence.pop(0))
        return used_hand