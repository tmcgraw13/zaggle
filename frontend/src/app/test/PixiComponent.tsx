"use client";

import { useEffect, useRef } from "react";
import { Application, Assets, Container, Graphics, Sprite } from "pixi.js";

const PixiComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const canvasTransferred = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && !canvasTransferred.current) {
      canvasTransferred.current = true;

      (async () => {
        // Create a new application
        const app = new Application();

        await app.init({
          canvas: canvas,
          background: "#1099bb",
          resizeTo: window,
          antialias: true
        });

        appRef.current = app;

        const container = new Container();
        const letter_container = new Container();

        app.stage.addChild(container);
        app.stage.addChild(letter_container);

        app.stage.eventMode = 'static';
        app.stage.hitArea = app.screen;
    
        const graphics = new Graphics();
    
        app.stage.addChild(graphics);
    
        
    
    
        // // Just click on the stage to draw random lines
        // app.stage.on('pointerdown', () =>
        // {
        //     graphics.moveTo(Math.random() * 800, Math.random() * 600);
        //     graphics.bezierCurveTo(
        //         Math.random() * 800,
        //         Math.random() * 600,
        //         Math.random() * 800,
        //         Math.random() * 600,
        //         Math.random() * 800,
        //         Math.random() * 600,
        //     );
        //     graphics.stroke({ width: Math.random() * 30, color: Math.random() * 0xffffff });
        // });

        // Load the bunny texture
        const texture = await Assets.load(
          "https://pixijs.com/assets/bunny.png"
        );

        var alphabet = "abcdefghijklmnopqrstuvwxyz"
        var letter_aliases = []

        for (const letter of alphabet){
          let letter_alias = letter + "_tile"
          Assets.add({alias:letter_alias,src:"/game-board/"+letter+"-tile.png"})
          letter_aliases.push(letter_alias)
        }
        const texturesPromise = Assets.load(letter_aliases)

        texturesPromise.then((textures)=>{

          console.log("Textures Loaded!")

          let player_input: any = []

          addEventListener("keydown", (event) => {

            let key_pressed = event.key.toLowerCase()
            if(alphabet.includes(key_pressed)){
              let tile = textures[key_pressed + "_tile"]

              const letter_sprite = new Sprite(tile)
              
              player_input.push(letter_sprite)  
    
              letter_container.addChild(letter_sprite)            
            }
            else if (key_pressed == "backspace"){
              letter_container.removeChild(player_input.pop())
            }

            let index = 0
            for (const letter_sprite of player_input){
              letter_sprite.x = index * 65;
              index ++
            }

          });


          


        })
        // Create a 5x5 grid of bunnies
        for (let i = 0; i < 25; i++) {
          const bunny = new Sprite(texture);

          bunny.anchor.set(0.5);
          bunny.x = (i % 5) * 40;
          bunny.y = Math.floor(i / 5) * 40;
          container.addChild(bunny);

          // Let's create a moving shape
          const thing = new Graphics();
      
          container.addChild(thing);
          thing.x =  (i % 10) * 40;
          thing.y = Math.floor(i / 10) * 50;

          let count = 0;

         // Animate the moving shape
         app.ticker.add(() =>
          {
              count += 0.1;
      
              thing.clear();
      
              thing
                  .moveTo(-120 + Math.sin(count) * 20, -100 + Math.cos(count) * 20)
                  .lineTo(120 + Math.cos(count) * 20, -100 + Math.sin(count) * 20)
                  .lineTo(120 + Math.sin(count) * 20, 100 + Math.cos(count) * 20)
                  .lineTo(-120 + Math.cos(count) * 20, 100 + Math.sin(count) * 20)
                  .lineTo(-120 + Math.sin(count) * 20, -100 + Math.cos(count) * 20)
                  .fill({ color: 0xffff00, alpha: 0.5 })
                  .stroke({ width: 10, color: 0xff0000 });
      
              thing.rotation = count * 0.1;
          });
        }

        

        // Set initial position and center container
        const resize = () => {
          
          container.x = app.screen.width / 2;
          container.y = app.screen.height / 2;

          container.pivot.x = container.width / 2;
          container.pivot.y = container.height / 2;
        };

        window.addEventListener("resize", resize);
        resize(); // Initial call

        // Listen for animate update
        app.ticker.add((time) => {
          // Rotate the container!
          // * use delta to create frame-independent transform *
          container.rotation -= 0.1 * time.deltaTime;
        });


   
        return () => {
          window.removeEventListener("resize", resize);
          app.destroy(true, true);
        };
      })();
    }
  }, []);

  return <canvas ref={canvasRef} />;
};

export default PixiComponent;
