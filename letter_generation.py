import random


og_tileset = ['a','a','a','a','a','a','a','a','a','b','b','c','c','d','d','d','d','e','e','e','e','e','e','e','e','e','e','e','e','f','f','g','g','g','h','h','i','i','i','i','i','i','i','i','i','j','k','l','l','l','l','m','m','n','n','n','n','n','n','o','o','o','o','o','o','o','o','p','p','q','r','r','r','r','r','r','s','s','s','s','t','t','t','t','t','t','u','u','u','u','v','v','w','w','x','y','y','z','*','*']

tileset = og_tileset.copy()

letters = []

i = 0
top = 99
while i < 500:
    rand = random.randrange(0,top)
    letters.append(tileset[rand])
    tileset.pop(rand)
    i+=1 
    top -=1
    if top == 0:
        top = 99
        tileset = og_tileset.copy()