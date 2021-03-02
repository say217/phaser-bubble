import * as Phaser from "phaser";
import GameScene from "../Scenes/GameScene";
export default class Score extends Phaser.GameObjects.Text {
  private score: number;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "SCORE: 0", {
      color: "white",
      fontSize: "36px",
    });

    scene.add.existing(this);

    //Score Logic
    this.score = 0;
  }

  getScore():number{
    return this.score;
  }

  incrementScore():void{
    this.score += 100;
    this.setText("SCORE: " + this.score);
  }
}
