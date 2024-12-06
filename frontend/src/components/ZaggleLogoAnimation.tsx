"use client";

import { useEffect, useRef } from "react";
import { Application, Color, Container, Text, TextStyle } from "pixi.js";

const ZaggleLogoAnimation = () => {
  const pixiContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create PixiJS application with `init()` as you requested
    (async () => {
      const app = new Application();

      // Initialize PixiJS application with the desired settings
      await app.init({
        backgroundColor: 0xffffff, // White background color (not used with transparency)
        backgroundAlpha: 0, // Transparent background for PixiJS canvas
        antialias: true,        // Enable antialiasing for smoother rendering
      });

      // Attach PixiJS canvas to the container
      if (pixiContainer.current) {
        pixiContainer.current.appendChild(app.canvas);
      }

      const logoContainer = new Container();
      app.stage.addChild(logoContainer);

      // Letters of "ZAGGLE"
      const letters = ["Z", "A", "G", "G", "L", "E"];
      const letterSprites = letters.map((letter, index) => {
        // Define text style
        const style = new TextStyle({
          fontFamily: "Arial",
          fontSize: 64, // Fixed font size
          fontWeight: "bold",
          fill: 0x000000, // Black color for text
          stroke: { color: "#ffffff", width: 4 }, // Stroke color and width
          dropShadow: {
            color: "#000000",
            blur: 4,
            angle: Math.PI / 6,
            distance: 5,
          },
        });

        // Create PixiJS Text object
        const text = new Text({text:letter, style});
        text.anchor.set(0.5); // Center anchor
        text.y = 100; // Default vertical position (will animate later)

        // Add text to the stage
        logoContainer.addChild(text);

        // Animation function
        const animation = () => {
          // Bounce effect for the Y position (sin wave for smooth vertical movement)
          text.y = app.canvas.height / 2 + Math.sin(app.ticker.lastTime / 100 + index) * 18;

          // Color cycling effect (changing RGB values)
          text.tint = new Color([
            Math.abs(Math.sin(app.ticker.lastTime / 1000 + index * 0.5)),
            Math.abs(Math.cos(app.ticker.lastTime / 1000 + index * 0.5)),
            1, // Constant blue component
          ]).toNumber();

          // Slow rotation effect for each letter
          text.rotation = Math.sin(app.ticker.lastTime / 500 + index) * 0.1;
        };

        // Add the animation to Pixi's ticker
        app.ticker.add(animation);

        return text;
      });

      // Calculate the total width of the letters and position them from the left edge of the container
      const letterSpacing = 15; // Space between letters
      let xOffset = 50; // Start positioning from the left side
      letterSprites.forEach((letter) => {
        letter.x = xOffset;
        xOffset += letter.width + letterSpacing; // Move to the next letter
      });

      // Calculate the total width of the logo (letters + spacing)
      const totalWidth = xOffset - letterSpacing; // We subtract the last spacing since there's no letter after the last one

      // Position the logo container at the center horizontally (no centering vertically)
      const positionLogoCenter = () => {
        if (pixiContainer.current) {
          const parentWidth = pixiContainer.current.clientWidth;
          const parentHeight = pixiContainer.current.clientHeight;

          // Set logoContainer x to center it horizontally within the parent container
          logoContainer.x = (parentWidth - totalWidth) / 2;

          // Ensure logoContainer is vertically centered using the updated height
          logoContainer.y = (parentHeight - logoContainer.height) / 2; 
        }
      };

      // Resize logic for PixiJS canvas
      const resizeCanvas = () => {
        if (pixiContainer.current && app.view) {
          const parentWidth = pixiContainer.current.clientWidth;
          const parentHeight = pixiContainer.current.clientHeight;

          // Resize the PixiJS canvas to match the parent container size
          app.renderer.resize(parentWidth, parentHeight);

          positionLogoCenter(); // Reposition logo container after resize
        }
      };

      // Initial resize when the component mounts
      resizeCanvas();

      // Wait for the first render to properly calculate and center the logo
      app.ticker.add(() => {
        // After the first render, call resize to ensure everything is positioned correctly
        positionLogoCenter();
      });

      // Adjust canvas size when the window or container is resized
      window.addEventListener("resize", resizeCanvas);

      // Cleanup PixiJS application on unmount
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
        height: "100%",           // Ensure the container takes full height of the parent
        overflow: "hidden",       // Hide any overflow caused by scaling or animation
      }}
    >
      {/* PixiJS canvas will be appended here dynamically */}
    </div>
  );
};

export default ZaggleLogoAnimation;
