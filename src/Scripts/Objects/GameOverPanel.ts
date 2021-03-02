import * as Phaser from "phaser";

export default class GameOverPanel extends Phaser.Physics.Arcade.Image {
  private colorType: string;
  private processed: boolean;
  private removed: boolean;
  constructor(scene: Phaser.Scene) {
    super(scene, scene.scale.width / 2, scene.scale.height / 2, "panel");
    this.scene.add.existing(this);

    let gameOverText = this.scene.add.text(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2 - this.scene.scale.height / 13,
      "Game Over",
      { fontFamily: "Hack",fontSize: "50px", fontStyle: "Bold" }
    );
    gameOverText.setOrigin(0.5, 0.5);

    let tryAgainButton = this.scene.add.image(
      this.scene.scale.width / 2,
      gameOverText.y + this.scene.scale.height / 10,
      "replay"
    );

    tryAgainButton.setInteractive();
    tryAgainButton.on("pointerup", () => {
      this.scene.scene.start("GameScene");
    });
  }
}
