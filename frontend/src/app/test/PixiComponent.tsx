"use client";

import { useEffect, useRef } from "react";
import { Application, Assets, Container, Sprite } from "pixi.js";

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
        });

        appRef.current = app;

        const container = new Container();

        app.stage.addChild(container);

        // Load the bunny texture
        const texture = await Assets.load(
          "https://pixijs.com/assets/bunny.png"
        );

        // Create a 5x5 grid of bunnies
        for (let i = 0; i < 25; i++) {
          const bunny = new Sprite(texture);

          bunny.anchor.set(0.5);
          bunny.x = (i % 5) * 40;
          bunny.y = Math.floor(i / 5) * 40;
          container.addChild(bunny);
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
          container.rotation -= 0.01 * time.deltaTime;
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