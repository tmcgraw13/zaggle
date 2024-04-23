# Coded for checking the length of the inputed word and scoring it

def lengthChecker(m):
    score = 0

    if len(m) >= 8:
        score = 0
    elif len(m) <= 2:
        score = 0
    else: 
        score = len(m) - 2
        
    return score

m = input("Check the length of this word: ")
score = lengthChecker(m)

scoreMessage = "This is worth %d point%s"
print(scoreMessage % (score, "s" if score != 1 else ""))
