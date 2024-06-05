def clean_letter(word, player_hand):
        for c in word:
            player_hand.remove(c)
        return player_hand

def add_letters(player_hand, generated_letters):
    while len(player_hand) < 7:
        player_hand.append(generated_letters.pop(0))
    return player_hand, generated_letters