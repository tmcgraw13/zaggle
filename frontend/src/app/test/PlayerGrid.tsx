import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

const PlayerGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const canvasTransferred = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && !canvasTransferred.current) {
      canvasTransferred.current = true;

      (async () => {
        // Create a new PIXI application
        const app = new PIXI.Application();
        await app.init({
          canvas: canvas,
          backgroundColor: 0x1099bb,
          resizeTo: window,
        });

        appRef.current = app;

        const container = new PIXI.Container();
        const playerhand = new PIXI.Container();

        app.stage.addChild(container);
        app.stage.addChild(playerhand);

        const baseURL = window.location.origin; // This is fine for now
        const texture = await PIXI.Assets.load(
          `${baseURL}/game-board/board-tile.png`
        );

        const boardSize = 9;
        const handLength = 7;

        for (let i = 0; i < boardSize * boardSize; i++) {
          const board = new PIXI.Sprite(texture);
          board.x = (i % boardSize) * 64;
          board.y = Math.floor(i / boardSize) * 64;
          container.addChild(board);
        }

        for (let i = 0; i < handLength; i++) {
          const board = new PIXI.Sprite(texture);
          board.x = (i % handLength) * 64;
          board.y = Math.floor(i / handLength) * 64;
          playerhand.addChild(board);
        }

        const resize = () => {
          container.x = app.screen.width / 2;
          container.y = app.screen.height / 2;
          playerhand.x = app.screen.width / 2;
          playerhand.y = app.screen.height - container.y / 14;

          container.pivot.x = container.width / 2;
          container.pivot.y = container.height / 2;
          playerhand.pivot.x = playerhand.width / 2;
          playerhand.pivot.y = playerhand.height / 2;
        };

        resize();
        window.addEventListener("resize", resize);

        return () => {
          window.removeEventListener("resize", resize);
          app.destroy(true, true);
        };
      })();
    }
  }, []);

  return <canvas ref={canvasRef} />;
};

export default PlayerGrid;
