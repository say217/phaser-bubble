import { LogLevel } from "ts-loader/dist/logger";
import { parseConfigFileTextToJson } from "typescript";
import { javascript } from "webpack";
import Bubble from "../Objects/Bubble";
import GameScene from "../Scenes/GameScene";

export default class GameManager {
  private scene: GameScene;
  private tileSize: number;
  private rowHeight: number;
  private maxRow: number;
  private maxColumn: number;
  private neighborsOffsets: number[][][];

  constructor(scene: GameScene) {
    this.scene = scene;
    this.tileSize = this.scene.scale.width / 8;
    this.rowHeight = (this.tileSize / 2) * Math.pow(3, 0.5);

    this.maxRow = 14;
    this.maxColumn = 8;
    this.neighborsOffsets = [
      [
        [1, 0],
        [0, 1],
        [-1, 1],
        [-1, 0],
        [-1, -1],
        [0, -1],
      ], // Even row tiles
      [
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 0],
        [0, -1],
        [1, -1],
      ],
    ]; // Odd row tiles
  }

  collisionEvent(): void {
    // BubbleXBubble Collision
    this.scene.physics.collide(
      this.scene.getLoadedBubble(),
      this.scene.getBubbleGroup(),
      (incomingBubble: Bubble) => {
        this.scene.time.delayedCall(
          10,
          () => {
            this.snapBubble(incomingBubble);
          },
          null,
          this
        );
      },
      null,
      this
    );
  }

  snapBubble(incomingBubble: Bubble): void {
    let gridPos = this.getGridPosition(incomingBubble.x, incomingBubble.y);
    let newPos = this.getScenePosition(gridPos[0], gridPos[1]);
    incomingBubble.setPosition(newPos[0], newPos[1]);
    this.scene.getBubbles()[gridPos[1]][gridPos[0]] = incomingBubble;
    this.scene.getBubbleGroup().add(incomingBubble);
    this.scene.getBlopSound().play();
    let foundClusters = this.findClusters(
      gridPos[0],
      gridPos[1],
      true,
      true,
      false
    );
    if (foundClusters.length >= 3) {
      this.removeBubbles(foundClusters);
      this.scene.decrementIncrement(foundClusters.length);
    } else if (foundClusters.length < 3 && gridPos[1] >= 13) {
      this.scene.gameOver();
    }
    else{
      this.scene.incrementIncrement();
    }
    this.scene.setLoadedEmpty();
  }

  findClusters(
    x: number,
    y: number,
    matchtype: boolean,
    reset: boolean,
    skipremoved: boolean
  ) {
    if (reset) {
      this.resetProcessed();
    }

    let targetTile: Bubble = this.scene.getBubbles()[y][x];

    targetTile.setProcessed(true);
    let topProcess: Bubble[] = [targetTile];
    let foundClusters: Bubble[] = [];

    while (topProcess.length > 0) {
      let currentTile: Bubble = topProcess.pop();

      if (skipremoved && currentTile.getRemoved()) {
        continue;
      }

      if (!matchtype || currentTile.getType() == targetTile.getType()) {
        foundClusters.push(currentTile);

        let neighbors: Bubble[] = this.getNeighbors(currentTile);

        for (let i = 0; i < neighbors.length; i++) {
          if (!neighbors[i].getProcessed()) {
            topProcess.push(neighbors[i]);
            neighbors[i].setProcessed(true);
          }
        }
      }
    }
    return foundClusters;
  }

  findFloatingClusters() {
    this.resetProcessed();

    let floatingClusters: Bubble[] = [];
    let bubbles: Bubble[][] = this.scene.getBubbles();

    for (let i = 0; i < this.maxRow; i++) {
      for (let j = 0; j < this.maxColumn; j++) {
        let tile = bubbles[i][j];
        if (tile != null && !tile.getProcessed()) {
          // check for clusters
          let foundClusters: Bubble[] = this.findClusters(
            j,
            i,
            false,
            false,
            true
          );

          let floating: boolean = true;
          if (foundClusters.length > 0) {
            //check if floating
            for (let k = 0; k < foundClusters.length; k++) {
              let gridPos = this.getGridPosition(
                foundClusters[k].x,
                foundClusters[k].y
              );
              if (gridPos[1] == 0) {
                floating = false;
                break;
              }
            }
          }
          if (floating) {
            floatingClusters = floatingClusters.concat(foundClusters);
          }
        }
      }
    }
    return floatingClusters;
  }

  resetProcessed() {
    let bubbles = this.scene.getBubbles();
    for (let i = 0; i < this.maxRow; i++) {
      for (let j = 0; j < this.maxColumn; j++) {
        if (bubbles[i][j] != null) {
          bubbles[i][j].setProcessed(false);
        }
      }
    }
  }

  getNeighbors(currentTile: Bubble): Bubble[] {
    let gridPos = this.getGridPosition(currentTile.x, currentTile.y);
    let tileRow = 0
    if(this.scene.getStartEven()){
      tileRow = gridPos[1] % 2;
    }
    else{
      tileRow = (gridPos[1]+1) % 2; 
    }
    let neighbors = [];

    let n = this.neighborsOffsets[tileRow];

    let bubbles = this.scene.getBubbles();

    for (let i = 0; i < n.length; i++) {
      let nx = gridPos[0] + n[i][0];
      let ny = gridPos[1] + n[i][1];
      if (
        nx >= 0 &&
        nx < this.maxColumn &&
        ny < this.maxRow &&
        ny >= 0 &&
        bubbles[ny][nx] != null
      ) {
        neighbors.push(bubbles[ny][nx]);
      }
    }
    return neighbors;
  }

  removeBubbles(cluster: Bubble[]): void {
    if(cluster.length==0){
      return;
    }

    cluster.reverse();
    let bubbles: Bubble[][] = this.scene.getBubbles();
    
    let bubble = cluster.pop();
    let gridPos: number[] = this.getGridPosition(bubble.x, bubble.y);
    bubbles[gridPos[1]][gridPos[0]] = null;

    this.scene.time.delayedCall(
      100,
      () => {
        bubble.pop();
        if(cluster.length == 0){
          //remove floating clusters
          let floatingClusters = this.findFloatingClusters();
          if (floatingClusters.length > 0) {
            this.removeFloating(floatingClusters);
          }
        }
        else{
          this.removeBubbles(cluster);
        }
      },
      null,
      this
    );
  }

  removeFloating(cluster: Bubble[]): void {
    if(cluster.length==0){
      return;
    }

    let bubbleGroup: Phaser.GameObjects.Group = this.scene.getBubbleGroup();
    let bubbles: Bubble[][] = this.scene.getBubbles();
    let bubble = cluster.pop();
    let gridPos: number[] = this.getGridPosition(bubble.x, bubble.y);
    bubbles[gridPos[1]][gridPos[0]] = null;
    bubble.setVelocityY(200);

    this.scene.time.delayedCall(
      100,
      () => {
        bubble.pop();
        if(cluster.length == 0){
          //remove floating clusters
          return;
        }
        else{
          this.removeFloating(cluster);
        }
      },
      null,
      this
    );
  }

  getScenePosition(x: number, y: number): number[] {
    let result: number[] = [x, y];
    result[0] = this.tileSize * result[0] + this.tileSize / 2;
    if(this.scene.getStartEven()){
      if (y % 2) {
        result[0] += this.tileSize / 2;
      }
    }
    else{
      if (!(result[1] % 2)) {
        result[0] += this.tileSize / 2;
      }
    }

    result[1] = this.rowHeight * result[1] + this.tileSize / 2;
    return result;
  }

  getGridPosition(x: number, y: number): number[] {
    let result: number[] = [x, y];
    result[1] = Math.floor(result[1] / this.rowHeight);

    if(this.scene.getStartEven()){
      if((result[1] % 2)){
        result[0] -= this.tileSize / 2;
      }
    }
    else{
      if(!(result[1] % 2)) {
        result[0] -= this.tileSize / 2;
      }
    } 
    result[0] = Math.floor(result[0] / this.tileSize);
    if(this.scene.getStartEven() && result[0] >= 7){
      if (result[1] % 2) {
        result[0] = 6;
      }
    }
    else if(!(result[1] % 2) && result[0] >= 7){
      result[0] = 6;
    }
    return result;
  }

  getTileSize(): number {
    return this.tileSize;
  }

  getRowHeight(): number{
    return this.rowHeight;
  }

  getMaxRow(): number {
    return this.maxRow;
  }

  getMaxColumn(): number {
    return this.maxColumn;
  }
}
