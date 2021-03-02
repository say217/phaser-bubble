import * as Phaser from "phaser";
import Bubble from "../Objects/Bubble";
import Score from "../Objects/Score"
import GameOverPanel from "../Objects/GameOverPanel";
import GameManager from "../Utils/GameManager";

export default class GameScene extends Phaser.Scene {
  //Bubbles
  private bubbles: Bubble[][];
  private bubbleGroup: Phaser.GameObjects.Group;
  private bubbleSub: Phaser.GameObjects.Group;
  private loadedBubble: Bubble;
  private subBubble: Bubble;

  //Game Manager
  private gameManager: GameManager;
  //Sounds
  private blopSound: Phaser.Sound.BaseSound;
  //FirstRow State
  private startEven: boolean;

  private score: Score;

  private isPlaying: boolean;

  private isDragging: boolean;

  private base: Phaser.GameObjects.Rectangle;

  private incrementCounter: number;

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    console.log("Game Started");

    this.subBubble = null;
    this.isPlaying = true;
    this.startEven = true;
    this.incrementCounter = 0;

    //Game Manager
    this.gameManager = new GameManager(this);

    //Base
    this.base = this.add.rectangle(
      this.scale.width / 2,
      this.gameManager.getTileSize() * 11.5,
      this.scale.width,
      10,
      0xffffff
    );
    
    //score
    this.score = new Score(this, this.gameManager.getTileSize()*0.5, this.gameManager.getTileSize()*13.5);

    //Audio Stuff
    this.blopSound = this.sound.add("blop");

    //Bubble Group/ Array
    this.bubbles = [];
    this.bubbleGroup = this.physics.add.group({
      maxSize: this.gameManager.getMaxRow() * this.gameManager.getMaxColumn(),
      immovable: true,
      removeCallback: (bubble: Bubble) => {
        this.bubbleSub.add(bubble);
      },
    });
    this.bubbleSub = this.add.group({
      maxSize: this.gameManager.getMaxRow() * this.gameManager.getMaxColumn(),
      removeCallback: (bubble: Bubble) => {
        bubble.setColor();
        bubble.setActive(true);
        bubble.setVisible(true);
        bubble.setBounce(1);
      },
    });

    //Roof
    this.bubbleGroup.add(this.add.rectangle(
      this.scale.width/2-1,
      0,
      this.scale.width,
      1,
    ))
    

    this.initBubbles();

    //Input
    this.input.on("pointerdown", () => {
      if(this.isPlaying && this.input.y<this.base.y){
        this.isDragging = true;
      }
      if(this.input.y>=this.base.y && this.isPlaying){
        this.switchBubble();
      }
    });

    this.input.on("pointerup", () => {
      if (this.isPlaying && this.isDragging) {
        if (
          !(
            this.loadedBubble == null ||
            this.loadedBubble.body.velocity.length() != 0
          )
        ) {
          //shoot the Bubble;
          this.isDragging = false;
          this.physics.moveTo(
            this.loadedBubble,
            this.input.x,
            this.input.y,
            1500
          );
        }
      }
    });

    this.input.keyboard.on("keydown-F", () => {
      if(this.isPlaying){
        this.switchBubble();
      }
    });

    //Increment Counter
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.isPlaying) {
          this.incrementIncrement();
          console.log(this.incrementCounter);
        }
      },
    });
  }

  update(): void {
    if (this.isPlaying) {
      if (this.loadedBubble == null) {
        this.reloadBubble();
      }
      this.gameManager.collisionEvent();
    }
  }

  initBubbles(): void {
    // Init Bubbles
    for (let i = 0; i < this.gameManager.getMaxRow(); i++) {
      this.bubbles[i] = [];
      if (i < 5) {
        for (let j = 0; j < 8; j++) {
          if (!(i % 2)) {
            this.renderBubble(j,i);
          } else {
            if (j > 6) {
              break;
            }
            this.renderBubble(j,i);
          }
        }
      }
    }
  }

  reloadBubble(): void {
    if (this.subBubble == null) {
      this.subBubble = new Bubble(this, [
        this.scale.width / 2 + this.gameManager.getTileSize() * 3,
        this.gameManager.getTileSize() * 13,
      ]);
      this.loadedBubble = new Bubble(this, [
        this.scale.width / 2,
        this.gameManager.getTileSize() * 13,
      ]);
    } else {
      this.loadedBubble = this.subBubble;
      this.loadedBubble.setPosition(
        this.scale.width / 2,
        this.gameManager.getTileSize() * 13
      );
      this.subBubble = this.renderBubbleScenePos(
        this.scale.width / 2 + this.gameManager.getTileSize() * 3,
        this.gameManager.getTileSize() * 13);
    }
  }
  

  checkLose():void{
    this.bubbles[this.gameManager.getMaxRow()-1].forEach((bubble: Bubble)=>{
      if(bubble != null){
        this.gameOver();
      }
    });
  }

  gameOver(): void {
    this.physics.pause();
    this.isPlaying = false;
    let gameOverPanel = new GameOverPanel(this);
  }

  switchBubble(): void {
    //switch loaded bubble with sub
    let tempType = this.subBubble.getType();
    this.subBubble.switchColor(this.loadedBubble.getType());
    this.loadedBubble.switchColor(tempType);
  }

  incrementIncrement(): void{
    this.incrementCounter += 1;
    if(this.incrementCounter>20){
      this.incrementCounter = 0;
      this.incrementBubbles();
    }
  }

  decrementIncrement(total: number): void{
    this.incrementCounter -= total;
    if (this.incrementCounter<0){
      this.incrementCounter = 0;
    }
  }

  incrementBubbles(): void {
    if(
      this.loadedBubble != null &&
      this.loadedBubble.body.velocity.length() != 0
    ){
      this.bubbleGroup.add(this.loadedBubble);
      this.loadedBubble.pop();
      this.setLoadedEmpty();
    }
    this.startEven = !this.startEven;
    for(let i: number = this.gameManager.getMaxRow()-2;i>=0;i--){
      for(let j: number = 0; j<this.gameManager.getMaxColumn();j++){
        let bubble: Bubble = this.bubbles[i][j];
        this.bubbles[i+1][j] = bubble;
        if(bubble != null){
          bubble.setPosition(bubble.x, bubble.y+this.gameManager.getRowHeight());
        }
      }
      this.bubbles[i] = [];
    }
    for (let j = 0; j < 8; j++) { 
      let scenePosition: number[] = this.gameManager.getScenePosition(j, 0);
      if (this.startEven) {
        this.renderBubble(j,0);
      } else {
        if (j > 6) {
          break;
        }
        this.renderBubble(j,0);
      }
    }
    this.checkLose();
  }

  renderBubble(x: number, y: number): void{
    let gridPos : number[] = this.gameManager.getScenePosition(x, y);
    let bubble : Bubble = this.bubbleSub.getFirst();
    if(bubble == null){
      bubble = new Bubble(this,[gridPos[0],gridPos[1]]);
      this.bubbleGroup.add(bubble);
    }
    else{
      bubble.setPosition(gridPos[0], gridPos[1]);
      this.reuseBubble(bubble)
      // Needs to be enabled again for some reason and can't be enabled from callback(?)
      bubble.setCollideWorldBounds();
    }
    bubble.play('idle');
    this.bubbles[y][x] = bubble;
  }

  renderBubbleScenePos(x: number, y: number): Bubble{
    let bubble : Bubble = this.bubbleSub.getFirst();
    if(bubble == null){
      bubble = new Bubble(this,[x,y]);
    }
    else{
      bubble.setPosition(x, y);
      this.bubbleSub.remove(bubble);
      // Needs to be enabled again for some reason and can't be enabled from callback(?)
      bubble.setCollideWorldBounds();
    }
    bubble.play('idle');
    return bubble;
  }

  reuseBubble(bubble: Bubble): void{
    this.bubbleSub.remove(bubble);
    this.bubbleGroup.add(bubble);
  }

  //Getter
  getLoadedBubble(): Bubble {
    return this.loadedBubble;
  }

  setLoadedEmpty(): void {
    this.loadedBubble = null;
  }

  getBubbleGroup(): Phaser.GameObjects.Group {
    return this.bubbleGroup;
  }

  getBubbles(): Bubble[][] {
    return this.bubbles;
  }

  getBlopSound(): Phaser.Sound.BaseSound {
    return this.blopSound;
  }

  getScore(): Score{
    return this.score;
  }

  getStartEven(): boolean{
    return this.startEven;
  }
}
