import { Application, Assets, Container, Sprite } from './pixi.min.mjs';

(async () =>
{
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({ background: '#1099bb', resizeTo: window });
    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    // Create and add containers to the stage
    const container = new Container();
    const playerhand = new Container();

    app.stage.addChild(container);
    app.stage.addChild(playerhand);
    // Load the board texture
    const texture = await Assets.load('images/board-tile.png');
    const boardSize = 9
    const handLength = 7
    // Create a grid of board tiles in the container
    for (let i = 0; i < (boardSize*boardSize); i++)
    {
        const board = new Sprite(texture);

        board.x = (i % boardSize) * 64;
        board.y = Math.floor(i / boardSize) * 64;
        container.addChild(board);
    }
    for (let i = 0; i < handLength ; i++)
    {
        const board = new Sprite(texture);

        board.x = (i % handLength) * 64;
        board.y = Math.floor(i / handLength) * 64;
        playerhand.addChild(board);
    }
    // Move the container to the center
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;
    playerhand.x = app.screen.width / 2;
    playerhand.y = app.screen.height -container.y / 14;
    // Center the sprites in local container coordinates
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;
    playerhand.pivot.x = playerhand.width / 2;
    playerhand.pivot.y = playerhand.height / 2;

    // Listen for animate update
    app.ticker.add((time) =>
    {
        // Continuously rotate the container!
        // * use delta to create frame-independent transform *
        // container.rotation -= 0.01 * time.deltaTime;
    });
})();

window.onload = function() {
    // Wait until the config script is loaded
    if (window.config) {
        const serverUrl = window.config.serverUrl;
        document
        .getElementById("myButton")
        .addEventListener("click", async () => {
          try {
            const response = await fetch(`${serverUrl}/api`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });
            const data = await response.json();
            alert(JSON.stringify(data)); // Display the response data in an alert
          } catch (error) {
            alert("Error: " + error); // Display error in an alert
          }
        });
    }
    }