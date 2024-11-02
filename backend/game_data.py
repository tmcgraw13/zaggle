#Stores game data
#room id, players, start time, letter sequence
from typing import List
from player import Player


class GameData:
    def __init__(self, players: List[Player],room_id: str,letter_seq:list = [], start_time: str = ""):
        self.players = players
        self.room_id = room_id
        self.letter_seq = letter_seq
        self.start_time = start_time

    def to_dict(self):
        return {
            'players': [player.to_dict() for player in self.players],
            'room_id': self.room_id,
            'letter_seq': self.letter_seq,
            'start_time': self.start_time
        }

    def get_players(self):
        return self.players
    def get_players_to_dict(self):
        return {'players' : [player.to_dict() for player in self.players]}
    
    def get_room_id(self):
        return self.room_id
    
    def get_letter_seq(self):
        return self.letter_seq
    
    def get_start_time(self):
        return self.start_time