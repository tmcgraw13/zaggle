#Stores game data
#room id, players, start time, letter sequence
class GameData:

    def init(self, players,room_id,letter_seq):
        self.players = players
        self.room_id = room_id
        self.letter_seq = letter_seq

    def get_players(self):
        return self.players
    
    def get_room_id(self):
        return self.room_id
    
    def get_letter_seq(self):
        return self.letter_seq