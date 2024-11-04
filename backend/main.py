from typing import List
from letter_generation import LetterGeneration
from validator import Validator
from timert import Timer
from player import Player
from game_data import GameData
# Importing flask module in the project is mandatory
# An object of Flask class is our WSGI application.
from flask import Flask, jsonify, request
from flask_cors import CORS

from flask_socketio import SocketIO, join_room, emit 


class MainClass:
    #-----------------------------------------------------------#
    #                   INITIALIZATION                          #
    #-----------------------------------------------------------#
    def __init__(self):
        self.generate = LetterGeneration()
        self.validate = Validator()
        self.player = Player()
        self.timer = Timer()
        
    def main(self):
        self.generate.gen_n_letters(1000)
        letters = self.generate.letters_sequence
        self.player.hand = letters[0:7]
        i =7

        self.timer.countdown()
        while not self.timer.gameover:
            
            print("Player Hand: " + str(self.player.hand))
            my_word = input("enter word: ").lower()
            self.timer.countdown()
            if not self.timer.gameover:

                if self.validate.letter_tracker(self.player.hand,my_word):
                    if self.validate.word_search(my_word):
                        score = self.validate.score_word(my_word)
                        self.player.add_score(score)
                        self.player.clean_hand_after_play(my_word)
                        i+=len(my_word)
                        self.player.add_letters_to_hand(letters[i:i+len(my_word)])

                    else: 
                        print("Invalid word")
                        continue
                else:
                    print("Letters used not in player hand.")
                    continue
                self.timer.countdown()
            
            # Clean player hand and get new letters from sequence here
            # just wiping hand for now, will break when we run out of letters
        print("FINAL SCORE: %d" % self.player.score)  


# Flask constructor takes the name of 
# current module (__name__) as argument.
app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes
generate = LetterGeneration()
validate = Validator()
socketio = SocketIO(app, cors_allowed_origins="*")
games = {}
all_game_data = []


# The route() function of the Flask class is a decorator, 
# which tells the application which URL should call 
# the associated function.
@app.route('/')
# ‘/’ URL is bound with hello_world() function.
def hello_world():
    return 'Hello World'

@app.route('/api', methods=['GET'])
def api():
    response = {
        'message': 'Hello from the Python backend!'
    }
    return jsonify(response)

@app.route('/api/start', methods=['POST'])
def start_game():
    generate.gen_n_letters(1000)
    letters = generate.letters_sequence
    initial_hand = letters[0:7]
    data = request.json
    room_id : str = data["room_id"]
    current_players: List[Player] = games[room_id].players
    start_time = data["start_time"]

    #TODO
    # set start time for the new game and initialize a task that should run when the timer expires
    # the task should get the current player scores and word history and publish it to a results page

    #players = [Player(uname) for uname in current_game_lookup.players]
    for p in current_players:
        p.set_score(0)
        p.set_hand(initial_hand)
        p.set_seq_index(7)
    game_obj = GameData(current_players,room_id,letters,start_time)

    games[room_id] = game_obj
    all_game_data.append(game_obj)  
    
    return jsonify({
        'message': 'Game started: websocket event triggered'
    })

@app.route('/api/play', methods=['POST'])
def play():
    data = request.json
    game_data: GameData = games[data["game_code"]]
    player = Player.from_dict(data["player"])
    my_word = data.get('my_word', '').lower()
    i = player.seq_index
    player_hand = player.hand

    if validate.letter_tracker(player_hand,my_word):
        if validate.word_search(my_word):
            score = validate.score_word(my_word)
            player.add_score(score)
            player.clean_hand_after_play(my_word)
            i+=len(my_word)
            player.set_seq_index(i)
            player.add_letters_to_hand(game_data.letter_seq[i:i+len(my_word)])

            message = 'Valid word'
        else:
            message = 'Invalid word'
    else:
        message = 'Letters used not in player hand'
    print(message)
    

    return jsonify({
        'message': message,
        'player': player
    })

# ------------------------------------------------------ #
#           WebSocket Routes - Flask-SocketIO            #
# ------------------------------------------------------ #

@socketio.on('join_game')
def on_join(data):
    try:
        game_code: str = data['gameCode']
        player_name: str = data['playerName']
        
        # Check if the game code exists; if not, initialize it
        if game_code not in games:
            player: Player  = Player(player_name, True) 
            game_data: GameData = GameData([player], game_code)
            games[game_code] = game_data
        game_lookup: GameData = games[game_code]
        # Prevent player duplicates
        found_player = next((x for x in game_lookup.players if x.username == player_name), None)
        if found_player == None:  
            new_player: Player = Player(player_name)
            game_lookup.players.append(new_player)

        join_room(game_code)
        emit('player_joined', game_lookup.to_dict(), room=game_code)

    except Exception as e:
        emit('error', {'message': f"Exception: {str(e)}"})

@socketio.on('start_game')
def on_start_game(data):
    print(data)
    game_code = data['gameCode']
    game_lookup: GameData = games[game_code]
    print(games[game_code])
    emit('game_started',game_lookup.to_dict(), room=game_code)


# main driver function
if __name__ == '__main__':
    ###########
    # UNCOMMENT BELOW FOR SERVER USAGE
    ##############
    socketio.run(app,debug=True, host='0.0.0.0', port=8081)

    ###############
    # UNCOMMENT BELOW FOR LOCAL TEXT-BASED GAME TESTING
    ##############
    #app = MainClass()
    # sys.exit(app.main())
