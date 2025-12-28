import * as Phaser from "phaser";
import { GAME_CONFIG } from "./constants";
import { PreloadScene } from "../scenes/PreloadScene";
import { GameplayScene } from "../scenes/platformer/GameplayScene"; // Thêm dòng này

export const createGameConfig = (
  parent: string
): Phaser.Types.Core.GameConfig => {
  return {
    type: Phaser.AUTO,
    width: "100%",
    height: "100%",
    parent: parent,
    backgroundColor: GAME_CONFIG.BACKGROUND_COLOR,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: "100%",
      height: "100%",
      zoom: 1,
    },
    scene: [
      PreloadScene,
      GameplayScene, // Thêm dòng này
    ],
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 800, x: 0 },
        debug: false, // <-- ĐỔI THÀNH TRUE để hiển thị hitbox
        fps: 120,
      },
      matter: {
        gravity: { y: 1.0, x: 0 },
        debug: false,
      } as any,
    },
    render: {
      antialias: true,
      pixelArt: false,
      powerPreference: "high-performance",
      clearBeforeRender: true,
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: false,
      transparent: false,
      roundPixels: true,
    },
  };
};
