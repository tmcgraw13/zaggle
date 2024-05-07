import random

def word_search():
        word_list = []
        with open("Collins Scrabble Words (2019).txt","r") as f:
            word_list = f.readlines()[2:]
            word_list = [x.rstrip("\n") for x in word_list]
            word_list = [x for x in word_list if (len(x) >= 3 and len(x) <= 7) ]

        print(len(word_list))

        while True:
            my_word = input("Enter a word: ").upper()
            if my_word.isalpha():
                print(my_word in word_list)
            else:
                print("Word must not contain numbers or special characters!")
        return 
   
def letter_gen():

    tileset = ['a','a','a','a','a','a','a','a','a','b','b','c','c','d','d','d','d','e','e','e','e','e','e','e','e','e','e','e','e','f','f','g','g','g','h','h','i','i','i','i','i','i','i','i','i','j','k','l','l','l','l','m','m','n','n','n','n','n','n','o','o','o','o','o','o','o','o','p','p','q','r','r','r','r','r','r','s','s','s','s','t','t','t','t','t','t','u','u','u','u','v','v','w','w','x','y','y','z','*','*']

    print(len(tileset))
    letters = []

    i = 0 
    while i < 500:
        letters.append(tileset[random.randrange(0,100)])
        i+=1 
        print(letters)
    return letters
    
def score_checker(m):
    score = 0
    m = input("Check the length of this word: ")
    score = score_checker(m)

    scoreMessage = "This is worth %d point%s"
    print(scoreMessage % (score, "s" if score != 1 else ""))

    if len(m) >= 8:
        score = 0
    elif len(m) <= 2:
        score = 0
    else: 
        score = len(m) - 2
            
    return score








