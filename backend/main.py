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
    data = request.json
    room_id : str = data["room_id"]
    if room_id not in games:
        return jsonify({'message': 'Game not found'}), 404
    current_players: List[Player] = games[room_id].players
    start_time = data["start_time"]

    #TODO
    # set start time for the new game and initialize a task that should run when the timer expires
    # the task should get the current player scores and word history and publish it to a results page

    # Deal initial hands with guaranteed playable hands
    for p in current_players:
        p.set_score(0)
        # Use guaranteed playable hand for initial deal
        initial_hand = generate.deal_new_hand(7, ensure_playable=True)
        p.set_hand(initial_hand)
        p.set_seq_index(7)
    game_obj = GameData(current_players,room_id,letters,start_time)

    games[room_id] = game_obj
    all_game_data.append(game_obj)

    return jsonify({
        'message': 'Game started: websocket event triggered'
    })

@app.route('/api/word-count', methods=['POST'])
def word_count():
    """Get the count of possible words for a given hand."""
    from word_checker import find_words
    data = request.json
    hand = data.get('hand', [])

    # Find all possible words (limit to reasonable number for performance)
    words = find_words(hand, min_length=3, max_results=500)

    return jsonify({
        'count': len(words),
        'sample_words': words[:5]  # Return a few sample words for debugging
    })

@app.route('/api/shuffle', methods=['POST'])
def shuffle_hand():
    """Shuffle some letters in the player's hand to guarantee playable words."""
    SHUFFLE_PENALTY = 5

    data = request.json
    game_code = data.get('game_code')
    username = data.get('username')
    apply_penalty = data.get('apply_penalty', False)

    if game_code not in games:
        return jsonify({'message': 'Game not found'}), 404

    game_data: GameData = games[game_code]
    player = next((p for p in game_data.players if p.username == username), None)

    if not player:
        return jsonify({'message': 'Player not found'}), 404

    # Replace 3 random letters and ensure the hand is playable
    current_hand = player.hand
    new_hand = generate.ensure_playable_hand(
        generate.replace_random_letters(current_hand, count=3)
    )
    player.set_hand(new_hand)

    # Apply penalty if manual shuffle
    if apply_penalty:
        player.set_score(max(0, player.get_score() - SHUFFLE_PENALTY))
        message = f'Hand shuffled (-{SHUFFLE_PENALTY} pts)'
    else:
        message = 'Hand auto-shuffled (no penalty)'

    return jsonify({
        'message': message,
        'player': player.to_dict(),
        'penalty_applied': apply_penalty,
        'penalty_amount': SHUFFLE_PENALTY if apply_penalty else 0
    })

@app.route('/api/play', methods=['POST'])
def play():
    data = request.json
    game_code = data.get("game_code")
    if game_code not in games:
        return jsonify({'message': 'Game not found'}), 404
    game_data: GameData = games[game_code]
    username = Player.from_dict(data["player"]).username
    player = next((p for p in game_data.players if p.username == username), None)
    copy_letter_seq = game_data.letter_seq

    if not player:
        return jsonify({'message': 'Player not found'})
    my_word = data.get('my_word', '').lower()
    difficulty_bonus = data.get('difficulty_bonus', 0)  # Bonus for limited word options
    i = player.seq_index
    player_hand = player.hand

    if validate.letter_tracker(player_hand,my_word):
        if validate.word_search(my_word):
            score = validate.score_word(my_word)
            # Add difficulty bonus if applicable
            total_score = score + difficulty_bonus
            player.add_score(total_score)
            if difficulty_bonus > 0:
                print(f"Word '{my_word}' scored {score} + {difficulty_bonus} difficulty bonus = {total_score}")
            player.clean_hand_after_play(my_word)
            i+=len(my_word)
            player.set_seq_index(i)
            # Refill hand and ensure it's playable
            remaining_hand = player.hand
            print(f"Remaining hand after play: {remaining_hand}")
            new_hand = generate.give_player_letters(remaining_hand, 7, ensure_playable=True)
            print(f"New hand after refill: {new_hand}")
            player.set_hand(new_hand)
            message = 'Valid word'
        else:
            message = 'Invalid word'
    else:
        message = 'Letters used not in player hand'
    print(message)


    return jsonify({
        'message': message,
        'player': player.to_dict()
    })

# ------------------------------------------------------ #
#           WebSocket Routes - Flask-SocketIO            #
# ------------------------------------------------------ #

AVAILABLE_ICONS = ["dog", "water", "fire", "penguin", "christmas", "computer"]

def get_available_icon(game_data):
    """Get an icon that isn't already taken by another player."""
    used_icons = {p.icon for p in game_data.players}
    for icon in AVAILABLE_ICONS:
        if icon not in used_icons:
            return icon
    # If all icons are taken, cycle through them
    return AVAILABLE_ICONS[len(game_data.players) % len(AVAILABLE_ICONS)]

@socketio.on('join_game')
def on_join(data):
    try:
        game_code: str = data['gameCode']
        player_name: str = data['playerName']
        player_icon: str = data.get('playerIcon', None)

        # Check if the game code exists; if not, initialize it
        if game_code not in games:
            icon = player_icon or AVAILABLE_ICONS[0]
            player: Player = Player(player_name, True, icon)
            game_data: GameData = GameData([player], game_code)
            games[game_code] = game_data
        game_lookup: GameData = games[game_code]

        # Prevent player duplicates
        found_player = next((x for x in game_lookup.players if x.username == player_name), None)
        if found_player is None:
            # Assign icon - use selected if available and not taken, otherwise auto-assign
            if player_icon:
                used_icons = {p.icon for p in game_lookup.players}
                if player_icon in used_icons:
                    icon = get_available_icon(game_lookup)
                else:
                    icon = player_icon
            else:
                icon = get_available_icon(game_lookup)
            new_player: Player = Player(player_name, False, icon)
            game_lookup.players.append(new_player)
        else:
            # Update existing player's icon if they're rejoining with a new one
            if player_icon and found_player.icon != player_icon:
                used_icons = {p.icon for p in game_lookup.players if p.username != player_name}
                if player_icon not in used_icons:
                    found_player.icon = player_icon

        join_room(game_code)
        emit('player_joined', game_lookup.to_dict(), room=game_code)

    except Exception as e:
        emit('error', {'message': f"Exception: {str(e)}"})

@socketio.on('start_game')
def on_start_game(data):
    print(data)
    game_code = data['gameCode']
    if game_code not in games:
        print(f"Game {game_code} not found")
        return
    game_lookup: GameData = games[game_code]
    print(games[game_code])
    emit('game_started',game_lookup.to_dict(), room=game_code)

@socketio.on('end_game')
def on_end_game(gamecode:str):
    print(gamecode)
    if gamecode not in games:
        print(f"Game {gamecode} not found")
        return
    game_lookup: GameData = games[gamecode]
    print(game_lookup)
    emit('game_ended',game_lookup.to_dict(), room=gamecode)

@socketio.on('reset_to_lobby')
def on_reset_to_lobby(gamecode:str):
    print(f"Resetting game {gamecode} to lobby")
    if gamecode in games:
        game_lookup: GameData = games[gamecode]
        # Reset start_time to go back to lobby state
        game_lookup.set_start_time("")
        # Reset player scores and hands
        for player in game_lookup.players:
            player.set_score(0)
            player.set_hand([])
            player.word_history = []
        emit('lobby_reset', game_lookup.to_dict(), room=gamecode)

@socketio.on('leave_game')
def on_leave_game(data):
    gamecode = data.get('gameCode')
    username = data.get('username')
    print(f"Player {username} leaving game {gamecode}")
    if gamecode in games:
        game_lookup: GameData = games[gamecode]
        # Remove player from game
        game_lookup.players = [p for p in game_lookup.players if p.username != username]
        emit('player_left', game_lookup.to_dict(), room=gamecode)

@socketio.on('score_update')
def on_score_update(data):
    gamecode = data.get('gameCode')
    if gamecode in games:
        game_lookup: GameData = games[gamecode]
        # Broadcast updated player list to all players
        emit('scores_updated', game_lookup.to_dict(), room=gamecode)

@socketio.on('update_profile')
def on_update_profile(data):
    """Update a player's name and/or icon while preserving host status."""
    gamecode = data.get('gameCode')
    old_username = data.get('oldUsername')
    new_username = data.get('newUsername')
    new_icon = data.get('newIcon')

    print(f"Updating profile: {old_username} -> {new_username}, icon: {new_icon}")

    if gamecode not in games:
        print(f"Game {gamecode} not found")
        emit('error', {'message': 'Game not found'})
        return

    game_lookup: GameData = games[gamecode]

    # Find the player
    player = next((p for p in game_lookup.players if p.username == old_username), None)
    if not player:
        print(f"Player {old_username} not found")
        emit('error', {'message': 'Player not found'})
        return

    # Check if new username is already taken by another player
    if new_username != old_username:
        existing = next((p for p in game_lookup.players if p.username == new_username), None)
        if existing:
            print(f"Username {new_username} already taken")
            emit('error', {'message': 'Username already taken'})
            return

    # Update player info (preserves isLeader, score, hand, etc.)
    if new_username:
        player.username = new_username
    if new_icon:
        # Check if icon is taken, assign different one if needed
        used_icons = {p.icon for p in game_lookup.players if p.username != player.username}
        if new_icon in used_icons:
            new_icon = get_available_icon(game_lookup)
        player.icon = new_icon

    # Broadcast updated player list to all players
    emit('player_updated', game_lookup.to_dict(), room=gamecode)


# main driver function
if __name__ == '__main__':
    ###########
    # UNCOMMENT BELOW FOR SERVER USAGE
    ##############
    socketio.run(app, debug=True, host='0.0.0.0', port=8081, allow_unsafe_werkzeug=True)

    ###############
    # UNCOMMENT BELOW FOR LOCAL TEXT-BASED GAME TESTING
    ##############
    #app = MainClass()
    # sys.exit(app.main())
