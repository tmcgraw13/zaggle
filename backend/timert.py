import time
import datetime

class Timer:
    # Methods - countdown.
    # Fields - gameover

    def __init__(self):
        self.gameover = False
        self.start_time = datetime.datetime.now()
    
    def countdown(self, gametime=30):
        current_time = datetime.datetime.now()
        print("Start: " + str(self.start_time))
        print("Current: " + str(current_time))
        
        if gametime - (current_time - self.start_time).total_seconds() <= 0:
            self.gameover = True
            print("BZZT! The coundown is at zero seconds!")
