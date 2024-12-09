"use client";

import { useEffect, useRef } from "react";

const AntComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasTransferred = useRef(false);

  //Draw grid function
  const drawGrid = (ctx:CanvasRenderingContext2D, grid:any, squareSize:number)=>{
    grid.forEach((row,i) =>{
      row.forEach( (cell,j) =>{
        //cell contains the actual grid value
   
        //TODO fill each cell as white or black depending on cell value
        
        
      })
    })
   
  };

  //Draw ant function
  const drawAnt = (ctx:CanvasRenderingContext2D, antPos:any,squareSize:number)=>{
    
    ctx.fillStyle = "red"
    //TODO draw ant as a red square
     
  };

  //Draw grid function
  const render = (ctx:CanvasRenderingContext2D,ant:any,squareSize:number)=>{
    
    ctx.clearRect(0,0,1000,1000);
    ant.update();
    drawGrid(ctx,ant.grid,squareSize);
    drawAnt(ctx,ant, squareSize);
     
  };

  class AntObj{

     x:number;
     y:number;
     direction:number;
     grid:any
    constructor(grid:any,x:number,y:number){

      this.x = x;
      this.y = y;
      this.direction = 0;
      this.grid = grid;
    }

    private rotateCW(){

      //TODO rotate ant clockwise
      return;

    }

    private rotateCCW(){

      //TODO Rotate ant counter-clockwise
      return;

    }

    public update(){

      
      if (this.x<0 || this.y <0 || this.x>= this.grid[0].length || this.y >= this.grid[0][0].length){
        //outside grid, do nothing
        return;
      }

      let currSquare = this.grid[this.x][this.y]


      //TODO Flip square and rotate ant based on square color

      //TODO Move forward based on ant's direction


      
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    

    if (canvas && !canvasTransferred.current) {
      canvasTransferred.current = true;
      const ctx = canvas.getContext("2d")
      if (ctx != null){
        

        // set some dimensions
        canvas.width = 1000;
        canvas.height = 1000;

        let gridWidth = 100;
        let gridHeight = 100;
        
        //initialize a grid of 0's
        let grid = new Array(gridWidth).fill(0);
        grid.forEach((row,index)=>{
          grid[index] = new Array(gridHeight).fill(0)
        });

        //initialize an Ant
        let myAnt = new AntObj(grid,10,50);


        //begin drawing stuff
        ctx.globalAlpha = 1.0;
        const squareSize = 10;

        setInterval(render,1,ctx,myAnt,squareSize);
        
      }
    }
  });

  return <canvas ref={canvasRef} />;
};

export default AntComponent;
