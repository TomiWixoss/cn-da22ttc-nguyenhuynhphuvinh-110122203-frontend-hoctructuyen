// frontend/phaser/scenes/PreloadScene.ts
import { Scene } from "phaser";
import { EventBus } from "../EventBus";

export class PreloadScene extends Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  create(): void {
    console.log("✅ Phaser Engine Ready.");
    // Gửi tín hiệu để báo cho React biết có thể bắt đầu game
    EventBus.emit("game-ready");
  }
}
