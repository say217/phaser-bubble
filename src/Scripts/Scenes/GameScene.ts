import * as Phaser from "phaser";
import MC from "../Objects/MC";
import FpsText from "../Objects/FpsText";
import Ground from "../Objects/Ground";
import Score from "../Objects/Score";
import Interactable from "../Objects/Interactable";
import Coin from "../Objects/Coin";
import Spike from "../Objects/Spike";
import { parseConfigFileTextToJson } from "typescript";

export default class GameScene extends Phaser.Scene {
  private fpsText: FpsText;
  private mc: MC;
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  private jumping: boolean;
  private mountainsBack: Phaser.GameObjects.TileSprite;
  private mountainsMid1: Phaser.GameObjects.TileSprite;
  private mountainsMid2: Phaser.GameObjects.TileSprite;
  private scoreText: Score;
  private groundLimit: number;
  private groundGroup: Phaser.GameObjects.Group;
  private interactableGroup: Phaser.GameObjects.Group;
  private interactablePool: Phaser.GameObjects.Group;
  private isPlaying: boolean;
  private jumpSound: Phaser.Sound.BaseSound;
  private coinSound: Phaser.Sound.BaseSound;
  private stabSound: Phaser.Sound.BaseSound;

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    console.log("Game Started");

    //Audio Stuff
    this.jumpSound = this.sound.add('jump')
    this.coinSound = this.sound.add('coin')
    this.stabSound = this.sound.add('stab')

    //BG Stuff
    this.mountainsBack = this.add.tileSprite(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      "mountains-back"
    );
    this.mountainsMid1 = this.add.tileSprite(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      "mountains-mid1"
    );
    this.mountainsMid2 = this.add.tileSprite(
      this.cameras.main.width / 2,
      this.cameras.main.height,
      this.cameras.main.width,
      this.cameras.main.height,
      "mountains-mid2"
    );

    //Ground Stuff
    this.groundLimit = this.cameras.main.width / 64 + 1;
    this.groundGroup = this.add.group();
    this.addGrounds();

    //Interactable Stuff
    this.interactableGroup = this.add.group({
      maxSize: 5,
      removeCallback: function (interactable: Interactable) {
        (interactable.scene as GameScene).interactablePool.add(interactable);
      },
    });

    this.interactablePool = this.add.group({
      maxSize: 5,
      removeCallback: function (interactable: Interactable) {
        (interactable.scene as GameScene).interactableGroup.add(interactable);
      },
    });

    this.addInteractable();

    //Player Stuff
    this.mc = new MC(this, 200, 300);
    this.cursorKeys = this.input.keyboard.createCursorKeys();

    //GUI Stuff
    this.fpsText = new FpsText(this);
    this.scoreText = new Score(this, this.cameras.main.width / 2, 50);

    //Playing State
    this.isPlaying = true;

    //Reset Button
    this.input.keyboard.on(
      "keydown-R",
      function (event: any) {
        if(!(this as GameScene).isPlaying){
          this.unhookListener();
          this.scene.start("GameScene");
        }
      },
      this
    );
    
    this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => {
        if(this.isPlaying){
          this.addInteractable();
        }
      },
    });
  }

  update(): void {
    if (this.isPlaying) {
      //enable jump
      this.physics.collide(
        this.mc,
        this.groundGroup,
        function (mc, ground) {
          if (this.jumping) {
            this.jumping = false;
            this.mc.play("walk");
          }
        },
        null,
        this
      );

      //obstacle or coin collision
      this.physics.overlap(
        this.mc,
        this.interactableGroup,
        function (mc, interactable: Interactable) {
          console.log("masuk 1");
          console.log(interactable.IsObstacle());
          switch (interactable.IsObstacle()) {
            case false:
              //is a Coin
              console.log("masuk coin");
              this.coinSound.play();
              this.scoreText.incrementScore();
              this.interactableGroup.killAndHide(interactable);
              this.interactableGroup.remove(interactable);
              break;
            case true:
              //is an Obstacle
              console.log("masuk obstacle");
              this.stabSound.play();
              (interactable.scene as GameScene).pauseAll();
              break;
          }
        },
        null,
        this
      );

      this.mountainsBack.tilePositionX += 0.05;
      this.mountainsMid1.tilePositionX += 0.3;
      this.mountainsMid2.tilePositionX += 0.75;

      this.movePlayer();

      this.fpsText.update();
      this.mc.update();
    }
  }

  movePlayer(): void {
    //Jumping
    if (this.cursorKeys.up.isDown) {
      if (!this.jumping) {
        this.mc.setVelocityY(-600);
        this.jumping = true;
        this.jumpSound.play();
        this.mc.play("jump");
      }
    }
  }

  addGrounds(): void {
    for (let i = 0; i < this.groundLimit; i++) {
      this.groundGroup.add(
        new Ground(this, i * 64 + 32, this.cameras.main.height - 32)
      );
    }
  }

  getGroundLimit(): number {
    return this.groundLimit;
  }

  addInteractable(): void {
    let interactable: Interactable;
    if (this.interactablePool.getLength()) {
      interactable = this.interactablePool.getFirstNth(
        Phaser.Math.Between(0, this.interactablePool.getLength() - 1)
      );
      interactable.x = this.groundLimit * 64 - 32;
      interactable.setActive(true);
      interactable.setVisible(true);
      this.interactablePool.remove(interactable);
    } else {
      this.interactablePool.add(
        new Coin(this, 0, this.cameras.main.height - 256)
      );
      this.interactablePool.add(
        new Coin(this, 0, this.cameras.main.height - 256)
      );
      this.interactablePool.add(
        new Spike(this, 0, this.cameras.main.height - 96)
      );
      this.interactablePool.add(
        new Spike(this, 0, this.cameras.main.height - 96)
      );
      this.addInteractable();
    }
  }

  pauseAll(): void {
    this.mc.play("idle");
    this.physics.pause();
    this.isPlaying = false;
    let gameOverText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "Game Over",
      { fontSize: "44px", fontStyle: "Bold" }
    );
    gameOverText.setOrigin(0.5, 0.5);

    let restartText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100,
      "Press 'R' to restart",
      { fontSize: "44px", fontStyle: "Bold" }
    );
    restartText.setOrigin(0.5, 0.5);
  }

  getInteractableGroup(): Phaser.GameObjects.Group{
    return this.interactableGroup;
  }

  getPlayState(): boolean{
    return this.isPlaying;
  }

  unhookListener(): void{
    this.groundGroup.getChildren().forEach((item: Ground, index)=>{
      console.log(item.x);
      item.removeUpdateListener();
    });
    this.interactableGroup.getChildren().forEach((item: Ground, index)=>{
      console.log(item.x);
      item.removeUpdateListener();

    });
    this.interactablePool.getChildren().forEach((item: Ground, index)=>{
      console.log(item.x);
      item.removeUpdateListener();
    });
  }
}
