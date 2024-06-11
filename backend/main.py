from letter_generation import LetterGeneration
from validator import Validator


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
        

    def main(self):
        
        letters = self.generate.gen_n_letters(1000)
        my_word = input("enter word: ")
        self.validate.word_search(my_word)
        self.validate.letter_tracker(letters)   
    



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
    app.run(debug=True, host='0.0.0.0', port=8081)
