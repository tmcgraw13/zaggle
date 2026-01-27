"use client";

import { useEffect, useRef } from "react";
import {
  Application,
  Container,
  Graphics,
  Text,
  TextStyle,
} from "pixi.js";

// Scrabble-style letter point values
const LETTER_POINTS: Record<string, number> = {
  Z: 10, A: 1, G: 2, L: 1, E: 1,
};

const ZaggleLogoAnimation = () => {
  const pixiContainer = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    let destroyed = false;

    (async () => {
      const app = new Application();

      await app.init({
        backgroundAlpha: 0,
        antialias: true,
      });

      if (destroyed) {
        app.destroy(true, true);
        return;
      }

      appRef.current = app;

      if (pixiContainer.current) {
        pixiContainer.current.appendChild(app.canvas);
      }

      const logoContainer = new Container();
      app.stage.addChild(logoContainer);

      const letters = ["Z", "A", "G", "G", "L", "E"];
      const tileSize = 52;
      const tileGap = 4;
      const tiles: Container[] = [];

      letters.forEach((letter, index) => {
        const tileContainer = new Container();

        // Tile background (cream colored, Scrabble style)
        const tile = new Graphics();
        tile.roundRect(0, 0, tileSize, tileSize, 6);
        tile.fill({ color: 0xFAF3E0 }); // Cream/ivory color
        tile.stroke({ width: 2, color: 0xD4A574 }); // Warm brown border
        tileContainer.addChild(tile);

        // Inner shadow/highlight for depth
        const innerHighlight = new Graphics();
        innerHighlight.roundRect(2, 2, tileSize - 4, tileSize - 4, 4);
        innerHighlight.stroke({ width: 1, color: 0xFFFFFF, alpha: 0.5 });
        tileContainer.addChild(innerHighlight);

        // Letter text (dark brown, bold)
        const letterStyle = new TextStyle({
          fontFamily: "Georgia, serif",
          fontSize: 32,
          fontWeight: "bold",
          fill: 0x3D2914, // Dark brown
        });
        const letterText = new Text({ text: letter, style: letterStyle });
        letterText.anchor.set(0.5);
        letterText.x = tileSize / 2;
        letterText.y = tileSize / 2 - 2;
        tileContainer.addChild(letterText);

        // Point value subscript (bottom right)
        const pointStyle = new TextStyle({
          fontFamily: "Arial, sans-serif",
          fontSize: 11,
          fontWeight: "bold",
          fill: 0x5D4E37, // Medium brown
        });
        const pointText = new Text({
          text: String(LETTER_POINTS[letter] || 1),
          style: pointStyle,
        });
        pointText.anchor.set(1, 1);
        pointText.x = tileSize - 5;
        pointText.y = tileSize - 3;
        tileContainer.addChild(pointText);

        // Position tile
        tileContainer.x = index * (tileSize + tileGap);
        tileContainer.y = 0;

        // Store original position for animation
        (tileContainer as any).baseY = 0;
        (tileContainer as any).index = index;

        logoContainer.addChild(tileContainer);
        tiles.push(tileContainer);
      });

      const totalWidth = letters.length * (tileSize + tileGap) - tileGap;
      const totalHeight = tileSize;

      // Subtle wave animation
      const animate = () => {
        tiles.forEach((tile, i) => {
          const time = app.ticker.lastTime / 800;
          tile.y = (tile as any).baseY + Math.sin(time + i * 0.5) * 3;
          tile.rotation = Math.sin(time + i * 0.5) * 0.02;
        });
      };

      app.ticker.add(animate);

      // Resize and center
      const resizeCanvas = () => {
        if (pixiContainer.current && appRef.current) {
          const parentWidth = pixiContainer.current.clientWidth;
          const parentHeight = pixiContainer.current.clientHeight;

          app.renderer.resize(parentWidth, parentHeight);

          const scaleFactor = Math.min(
            parentWidth / totalWidth,
            parentHeight / totalHeight
          ) * 0.9;

          logoContainer.scale.set(scaleFactor);
          logoContainer.x = (parentWidth - totalWidth * scaleFactor) / 2;
          logoContainer.y = (parentHeight - totalHeight * scaleFactor) / 2;
        }
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    })();

    return () => {
      destroyed = true;
      if (appRef.current) {
        appRef.current.stage.removeChildren();
        appRef.current.destroy(true, true);
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        padding: 0,
        margin: 0,
        height: "56px",
        width: "220px",
      }}
    >
      <div
        ref={pixiContainer}
        style={{
          height: "100%",
          width: "100%",
          overflow: "hidden",
        }}
      />
    </div>
  );
};

export default ZaggleLogoAnimation;
