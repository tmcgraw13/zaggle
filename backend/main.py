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
player = Player()
i = 0 # initial index for hand
socketio = SocketIO(app, cors_allowed_origins="*")
games = []


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
    global i
    generate.gen_n_letters(1000)
    letters = generate.letters_sequence
    player.set_score(0)
    player.set_hand(letters[0:7])
    i = 7  # reset i to 7 after starting the game

    data = request.data
    names = data["names"]
    room_id = data["room_id"]
    start_time = data["start_time"]
    
    #TODO
    # set start time for the new game and initialize a task that should run when the timer expires
    # the task should get the current player scores and word history and publish it to a results page

    players = [Player(uname) for uname in names]
    for p in players:
        p.set_score(0)
        p.set_hand(letters[0:7])
        p.set_seq_index(7)

    new_game = GameData(players,room_id,letters)
    games.append(new_game)  

    
    return jsonify({
        'message': 'Game started',
        'player_hand': player.get_hand(),
        'game_data':new_game
    })

@app.route('/api/play', methods=['POST'])
def play():
    global i
    letters = generate.letters_sequence
    data = request.json
    my_word = data.get('my_word', '').lower()
    player.set_hand(data.get('player_hand', ''))


    if validate.letter_tracker(player.hand,my_word):
        if validate.word_search(my_word):
            score = validate.score_word(my_word)
            player.add_score(score)
            player.clean_hand_after_play(my_word)
            i+=len(my_word)
            player.add_letters_to_hand(letters[i:i+len(my_word)])

            response = {
                'message': 'Valid word',
                'score': player.get_score()
            }
        else:
            response = {'message': 'Invalid word'}
    else:
        response = {'message': 'Letters used not in player hand'}
    print(response)
    

    return jsonify({
        'response': response,
        'player_hand': player.get_hand()
    })

# ------------------------------------------------------ #
#           WebSocket Routes - Flask-SocketIO            #
# ------------------------------------------------------ #

@socketio.on('join_game')
def on_join(data):
    try:
        game_code = data['gameCode']
        player_name = data['playerName']

        # Check if the game code exists; if not, initialize it
        if game_code not in games:
            games[game_code] = {'players': [player_name], 'leader': player_name, 'started': False}
        
        # Prevent player duplicates
        if player_name not in games[game_code]['players']:  
            games[game_code]['players'].append(player_name)

        join_room(game_code)
        emit('player_joined', {'players': games[game_code]['players'], 'started': games[game_code]['started'] }, room=game_code)

    except Exception as e:
        emit('error', {'message': f"Exception: {str(e)}"})

@socketio.on('start_game')
def on_start_game(data):
    print(data)
    print(games)
    game_code = data['gameCode']
    if games[game_code]['leader'] == data['playerName']:
        games[game_code]['started'] = True
        emit('game_started', {'message': 'Game has started'}, room=game_code)
    else:
        emit('error', {'message': 'Only the leader can start the game'})

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
