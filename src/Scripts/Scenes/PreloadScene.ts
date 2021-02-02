import * as Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
    this.load.path = "src/Assets/Kenny Simplified Platformer/PNG/";
    this.load.spritesheet(
      "player",
      "../Tilesheet/platformerPack_character.png",
      { frameWidth: 96, frameHeight: 96 }
    );
    this.load.image("mountains-back", "../../mountains-back.png");
    this.load.image("mountains-mid1", "../../mountains-mid1.png");
    this.load.image("mountains-mid2", "../../mountains-mid2.png");
    this.load.image("tileUpper", "Tiles/platformPack_tile001.png");
    this.load.image("tileUnder", "Tiles/platformPack_tile004.png");
    this.load.image("tileSeaUp", "Tiles/platformPack_tile005.png");
    this.load.image("tileSeaIn", "Tiles/platformPack_tile017.png");
    this.load.image("tileObstacleDuck", "Tiles/platformPack_tile011.png");
    this.load.image("tileObstacleJump", "Tiles/platformPack_tile043.png");
    this.load.image("coin", "Items/platformPack_item008.png");
    this.load.audio("jump", "../../Sound/Jump.wav");
    this.load.audio("coin", "../../Sound/Coin.wav");
    this.load.audio("stab", "../../Sound/Stab.wav");
  }

  create(): void {
    this.scene.start("GameScene");
  }
}
