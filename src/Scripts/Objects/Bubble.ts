import * as Phaser from "phaser";
import GameScene from "../Scenes/GameScene";
import AlignTool from "../Utils/AlignTools";
import { colors } from "../Utils/ColorConstant";

export default class Bubble extends Phaser.Physics.Arcade.Sprite {
  private colorType: string;
  private processed: boolean;
  private removed: boolean;
  constructor(scene: Phaser.Scene, pos: number[]) {
    super(scene, pos[0], pos[1], "bubblesprite");

    this.scene.add.existing(this);

    scene.physics.add.existing(this);

    this.setBounce(1);

    this.setCollideWorldBounds(true);

    AlignTool.scaleToScreenWidth(scene, this, 3 / 16);

    this.setColor();

    this.body.setCircle(60, 30, 30);

    this.processed = false;
    this.removed = false;

    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("bubblesprite", {
        start: 0,
        end: 0,
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.anims.create({
      key: "pop",
      frames: this.anims.generateFrameNumbers("bubblesprite", {
        start: 0,
        end: 5,
      }),
      frameRate: 12,
      repeat: 0,
    });

    this.play('idle');
  }

  pop(): void {
    (this.scene as GameScene).getBlopSound().play();
    (this.scene as GameScene).getScore().incrementScore();
    (this.scene as GameScene).getBubbleGroup().remove(this);
    this.play("pop");
    this.on("animationcomplete", () => {
      //remove from bubble group;
      this.setVelocityY(0);
      this.setActive(false);
      this.setVisible(false);
    });

  }

  getType(): string {
    return this.colorType;
  }

  setProcessed(processed: boolean): void {
    this.processed = processed;
  }
  getProcessed(): boolean {
    return this.processed;
  }

  setRemoved(removed: boolean): void {
    this.removed = removed;
  }
  getRemoved(): boolean {
    return this.removed;
  }

  setColor(): void {
    let keys = Object.keys(colors);
    this.colorType = keys[(keys.length * Math.random()) << 0];
    let color = colors[this.colorType];
    this.setTint(color);
  }

  switchColor(type: string): void{
    this.colorType = type;
    let color = colors[this.colorType];
    this.setTint(color);
  }
}
