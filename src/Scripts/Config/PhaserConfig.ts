import PreloadScene from "../Scenes/PreloadScene";
import TitleScene from "../Scenes/TitleScene";
import GameScene from "../Scenes/GameScene";
import { getResolution } from "../Utils/Util";

export type PhaserConfig = Phaser.Types.Core.GameConfig;

export const config: PhaserConfig = {
  title: "PhaserGame",
  type: Phaser.AUTO,
  scale: {
    parent: "game",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: getResolution().width,
    height: getResolution().height,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  backgroundColor: "#5DACD8",
  scene: [PreloadScene, TitleScene, GameScene],
};
