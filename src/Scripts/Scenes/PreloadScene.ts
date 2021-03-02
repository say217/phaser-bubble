import * as Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
    this.load.path = "src/Assets/PuzzleBobble/";
    this.load.spritesheet("bubblesprite", "bubblesprite.png", {
      frameWidth: 180,
      frameHeight: 180,
    });
    this.load.image("arrow", "arrow.png");
    this.load.image("panel", "Panel.png");
    this.load.image("replay", "Replay.png");
    this.load.audio("blop", "Audio/Blop.mp3");
  }

  create(): void {
    this.scene.start("GameScene");
  }
}
