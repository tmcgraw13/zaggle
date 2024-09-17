from letter_generation import LetterGeneration
from validator import Validator
from timert import Timer


# Importing flask module in the project is mandatory
# An object of Flask class is our WSGI application.
from flask import Flask, jsonify, request
from flask_cors import CORS


class MainClass:
    #-----------------------------------------------------------#
    #                   INITIALIZATION                          #
    #-----------------------------------------------------------#
    def __init__(self):
        self.generate = LetterGeneration()
        self.validate = Validator()
        self.timer = Timer()
        
    def main(self):
        self.generate.gen_n_letters(1000)
        letters = self.generate.letters_sequence
        player_hand = letters[0:7]
        i =0

        self.timer.countdown()
        while not self.timer.gameover:
            
            print("Player Hand: " + str(player_hand))
            my_word = input("enter word: ").lower()
            self.timer.countdown()
            if not self.timer.gameover:

                if self.validate.letter_tracker(player_hand,my_word):
                    if self.validate.word_search(my_word):
                        self.validate.score_word(my_word)
                    else: 
                        print("Invalid word")
                        continue
                else:
                    print("Letters used not in player hand.")
                    continue
                self.timer.countdown()
            
            # Clean player hand and get new letters from sequence here
            # just wiping hand for now, will break when we run out of letters
            i+=7
            player_hand = letters[i:i+7]


# Flask constructor takes the name of 
# current module (__name__) as argument.
app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes
generate = LetterGeneration()
validate = Validator()
i = 0 # initial index for hand

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

@app.route('/api/start', methods=['GET'])
def start_game():
    global i
    generate.gen_n_letters(1000)
    letters = generate.letters_sequence
    player_hand = letters[0:7]
    i = 7  # reset i to 7 after starting the game
    return jsonify({
        'message': 'Game started',
        'player_hand': player_hand
    })

@app.route('/api/play', methods=['POST'])
def play():
    global i
    letters = generate.letters_sequence
    data = request.json
    my_word = data.get('my_word', '').lower()
    player_hand = data.get('player_hand', '')

    if validate.letter_tracker(player_hand, my_word):
        if validate.word_search(my_word):
            score = validate.score_word(my_word)
            response = {
                'message': 'Valid word',
                'score': score
            }
        else:
            response = {'message': 'Invalid word'}
    else:
        response = {'message': 'Letters used not in player hand'}
    print(response)
    # Update player hand
    i += 7
    player_hand = letters[i:i+7]

    return jsonify({
        'response': response,
        'player_hand': player_hand
    })

# main driver function
if __name__ == '__main__':
    ###########
    # UNCOMMENT BELOW FOR SERVER USAGE
    ##############
    app.run(debug=True, host='0.0.0.0', port=8081)

    ###############
    # UNCOMMENT BELOW FOR LOCAL TEXT-BASED GAME TESTING
    ##############
    # app = MainClass()
    # sys.exit(app.main())
