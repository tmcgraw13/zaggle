"use client";

import { useEffect, useRef } from "react";
import { Application, Color, Container, Text, TextStyle } from "pixi.js";

const ZaggleLogoAnimation = () => {
  const pixiContainer = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    (async () => {
      const app = new Application();

      await app.init({
        backgroundAlpha: 0,
        antialias: true,
      });

      appRef.current = app; // Store the app reference

      if (pixiContainer.current) {
        pixiContainer.current.appendChild(app.canvas);
      }

      const logoContainer = new Container();
      app.stage.addChild(logoContainer);

      const letters = ["Z", "A", "G", "G", "L", "E"];
      const letterSprites = letters.map((letter, index) => {
        const style = new TextStyle({
          fontFamily: "Arial",
          fontSize: 64,
          fontWeight: "bold",
          fill: 0x000000,
          stroke: { color: "#ffffff", width: 4 },
          dropShadow: {
            color: "#000000",
            blur: 4,
            angle: Math.PI / 6,
            distance: 5,
          },
        });

        const text = new Text({text:letter, style});
        text.anchor.set(0.5);
        text.y = 100;
        logoContainer.addChild(text);

        const animation = () => {
          text.y = app.canvas.height / 2 + Math.sin(app.ticker.lastTime / 100 + index) * 18;
          text.tint = new Color([
            Math.abs(Math.sin(app.ticker.lastTime / 1000 + index * 0.5)),
            Math.abs(Math.cos(app.ticker.lastTime / 1000 + index * 0.5)),
            1,
          ]).toNumber();
          text.rotation = Math.sin(app.ticker.lastTime / 500 + index) * 0.1;
        };

        app.ticker.add(animation);
        return text;
      });

      let xOffset = 50;
      letterSprites.forEach((letter) => {
        letter.x = xOffset;
        xOffset += letter.width + 15;
      });

      const totalWidth = xOffset - 15;

      // Function to resize and reposition the logo based on container size
      const positionLogoCenter = () => {
        if (pixiContainer.current && appRef.current) {
          const parentWidth = pixiContainer.current.clientWidth;
          const parentHeight = pixiContainer.current.clientHeight;

          // Calculate the scaling factor based on the smaller dimension
          const scaleFactor = Math.min(parentWidth / totalWidth, parentHeight / 150); // 150 is the height for reference

          // Scale the logo container
          logoContainer.scale.set(scaleFactor);

          // Center the logo horizontally and vertically
          logoContainer.x = (parentWidth - totalWidth * scaleFactor) / 2;
          logoContainer.y = (parentHeight - logoContainer.height * scaleFactor) / 2;
        }
      };

      // Resize logic
      const resizeCanvas = () => {
        if (pixiContainer.current && appRef.current) {
          const parentWidth = pixiContainer.current.clientWidth;
          const parentHeight = pixiContainer.current.clientHeight;

          // Resize the PixiJS canvas to match the parent container size
          app.renderer.resize(parentWidth, parentHeight);
          positionLogoCenter(); // Reposition and scale the logo after resizing
        }
      };

      resizeCanvas();

      app.ticker.add(() => {
        positionLogoCenter();
      });

      window.addEventListener("resize", resizeCanvas);

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        app.stage.removeChildren();
        app.destroy(true, true);
      };
    })();
  }, []);

  return (
    <div
      ref={pixiContainer}
      style={{
        height: "100%", // Make it fit within the navbar
        width: "100%",
        overflow: "hidden", // Hide overflow
      }}
    />
  );
};

export default ZaggleLogoAnimation;
