import time
import datetime

class Timer:
    # Methods - countdown.
    # Fields - gameover

    def __init__(self, gametime = 30):
        self.gameover = False
        self.start_time = datetime.datetime.now()
        self.gametime = gametime
        self.time_left = 0
    
    def countdown(self):
        current_time = datetime.datetime.now()
        print("Start: " + str(self.start_time))
        print("Current: " + str(current_time))
        self.time_left = self.gametime - (current_time - self.start_time).total_seconds()

        if self.time_left <= 0:
            self.gameover = True
            print("BZZT! The coundown is at zero seconds!")
            return self.gameover
