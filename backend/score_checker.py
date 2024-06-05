# Coded for checking the length of the inputed word and scoring it
def lengthChecker(self,m):
    score = 0

    if len(m) >= 8:
        score = 0
    elif len(m) <= 2:
        score = 0
    else: 
        score = len(m) - 2
    
    scoreMessage = "This is worth %d point%s"
    print(scoreMessage % (score, "s" if score != 1 else ""))
    return score
