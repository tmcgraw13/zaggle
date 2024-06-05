import time
import datetime

GameStarted = True 

def countdown(seconds):
    while seconds > 0: 
        timer = seconds
        print(timer)
        time.sleep(1)
        seconds -= 1

    print("BZZT! The coundown is at zero seconds!")

while GameStarted == True: 
    GameStarted = False 
    countdown(45)

