from word_search import word_search

def letter_tracker(abc_array):
    usable = abc_array[:7]
    abc_array = abc_array[7:]
    print(usable)
    my_word = input("enter word: ")
    #if input True in dictionary
    #return usable without letters used plus next sequence
    #remove letters from usable and add next amount of letters equal to input length
    #parse out letters from input, check if all available, remove those letters, add in the next sequence
    #with the same amount of letters removed into the original sequence
    #if input True:
    check = True
    for c in my_word:
        if c not in usable:
            check = False
            print ("Letter "+ c + " not available")
            break

    #check input occurences of letter, compare to usable, input must be less than or equal to usable
    for c in my_word:
        if my_word.count(c) > usable.count(c):
            check = False
            print ("Letter " + c + " used multiple times")
            break

    

    if check:
        for c in my_word:
            usable.remove(c)
            print (usable)

    #for length of input, pop next letter from array into usable
    if check:
        used = len(my_word)
    else:
        used = 0 

    for i in range(0, used):
        usable.append(abc_array.pop(0))
    print (usable)