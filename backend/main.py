import sys
from letter_generation import LetterGeneration
from validator import Validator
from timert import Timer
from player import Player

# Importing flask module in the project is mandatory
# An object of Flask class is our WSGI application.
from flask import Flask, jsonify
from flask_cors import CORS


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

# main driver function
if __name__ == '__main__':
    #instance = MainClass()
    #instance.main()

    # run() method of Flask class runs the application 
    # on the local development server.
    #app.run()

    ###########
    # UNCOMMENT BELOW FOR SERVER USAGE
    ##############
    # app.run(debug=True, host='0.0.0.0', port=8081)

    ###############
    # UNCOMMENT BELOW FOR LOCAL TEXT-BASED GAME TESTING
    ##############
    app = MainClass()
    sys.exit(app.main())