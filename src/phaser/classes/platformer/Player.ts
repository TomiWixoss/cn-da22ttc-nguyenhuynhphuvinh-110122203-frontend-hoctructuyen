import { Scene } from "phaser";
import { AnimationManager, AnimationState } from "./AnimationManager";
import { CameraManager } from "./CameraManager";
import { CharacterAnimations, DEFAULT_CHARACTER } from "./CharacterFrames";
// NetworkManager đã được xóa do không còn sử dụng Colyseus
// TextUtils và GameSettingsManager đã được xóa do không cần name-tag

// Thêm interface này ở đầu file để định nghĩa các lệnh của AI
export interface AICommand {
  action: "move" | "jump" | "wait";
  direction?: "left" | "right" | "none";
  duration?: number; // ms
  intensity?: "low" | "normal" | "high" | "slow" | "fast"; // THÊM MỚI
}

export interface PlayerConfig {
  x: number;
  y: number;
  texture: string;
  username: string;
  characterData?: CharacterAnimations;
  isPracticeMode?: boolean; // <-- THÊM THUỘC TÍNH NÀY
  physics?: {
    speed: number;
    jumpPower: number;
    gravity: number;
    bounce: number;
  };
}

export class Player {
  // Thêm các hằng số cho tốc độ và sức nhảy
  private readonly RUN_SPEEDS = {
    slow: 150,
    normal: 250,
    fast: 400,
  };

  private readonly JUMP_POWERS = {
    low: -450,
    normal: -600,
    high: -750,
  };

  private readonly AUTO_RUN_SPEED: number = 250; // Tốc độ chạy tự động, có thể điều chỉnh
  private scene: Scene;
  private sprite!: Phaser.Physics.Arcade.Sprite;
  // nameTag đã được xóa
  private animationManager!: AnimationManager;

  private cameraManager: CameraManager;
  private config: PlayerConfig;
  // NetworkManager đã được xóa

  private isDead: boolean = false;

  private isAutoRunning: boolean = false;
  // nameTagSettingsUnsubscribe đã được xóa

  // AI properties
  private aiCommandQueue: AICommand[] = [];
  private currentAICommand: AICommand | null = null;
  private commandTimer: number = 0;
  private _isExecutingAI: boolean = false;

  constructor(
    scene: Scene,
    config: PlayerConfig,
    cameraManager: CameraManager
  ) {
    this.scene = scene;
    this.cameraManager = cameraManager;
    // NetworkManager đã được xóa
    this.config = {
      x: config.x,
      y: config.y,
      texture: config.texture,
      username: config.username,
      characterData: config.characterData || DEFAULT_CHARACTER,
      isPracticeMode: config.isPracticeMode ?? false, // Mặc định là false
      physics: config.physics || {
        speed: 200,
        jumpPower: 400,
        gravity: 800,
        bounce: 0.2,
      },
    };

    this.setupFrames();
    this.createSprite();

    // nameTag logic đã được xóa hoàn toàn

    if (!this.sprite) {
      console.error(
        `❌ Player sprite creation failed, aborting initialization`
      );
      return;
    }

    this.setupPhysics();
    this.setupAnimations();
    this.setupCamera();
  }

  private setupFrames(): void {
    const texture = this.scene.textures.get(this.config.texture);
    if (!this.config.characterData) return;
    Object.entries(this.config.characterData).forEach(([, frames]) => {
      (frames as any[]).forEach((frame: any, index: number) => {
        const frameKey = `char_${frame.x}_${frame.y}_${index}`;
        if (!texture.has(frameKey)) {
          texture.add(frameKey, 0, frame.x, frame.y, frame.width, frame.height);
        }
      });
    });
  }

  private createSprite(): void {
    if (!this.config.characterData) {
      console.error(`❌ CharacterData is null, using DEFAULT_CHARACTER`);
      this.config.characterData = DEFAULT_CHARACTER;
    }

    if (!this.scene) {
      console.error(`❌ Scene is null in Player.createSprite()`);
      return;
    }

    if (!this.scene.textures.exists(this.config.texture)) {
      console.error(`❌ Texture ${this.config.texture} not loaded yet`);
      return;
    }

    const firstFrame = this.config.characterData.idle[0];
    const frameKey = `char_${firstFrame.x}_${firstFrame.y}_0`;

    if (!this.scene || !this.scene.physics) {
      console.error(
        `❌ Scene or physics system not available for sprite creation`
      );
      return;
    }

    this.sprite = this.scene.physics.add.sprite(
      this.config.x,
      this.config.y,
      this.config.texture,
      frameKey
    );

    if (!this.sprite) {
      console.error(`❌ Failed to create sprite`);
      return;
    }

    this.sprite.setDisplaySize(96, 96);
  }

  // createNameTag method đã được xóa

  // setupNameTagSettingsListener method đã được xóa

  private setupPhysics(): void {
    if (!this.sprite) {
      console.error(`❌ Cannot setup physics: sprite is null`);
      return;
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const physics = this.config.physics || {
      speed: 200,
      jumpPower: 400,
      gravity: 800,
      bounce: 0.2,
    };
    body.setBounce(physics.bounce);
    body.setCollideWorldBounds(true);
    body.setGravityY(physics.gravity);
    body.setSize(48, 80);
    body.setOffset(40, 48);
    body.pushable = false;
  }

  private setupAnimations(): void {
    this.animationManager = new AnimationManager(
      this.scene,
      this.sprite,
      this.config.characterData
    );
  }

  private setupCamera(): void {
    this.cameraManager.followTarget(this.sprite);
  }

  public update(): void {
    if (!this.sprite || !this.sprite.body || this.isDead) return;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const isOnGround = body.blocked.down || body.touching.down;

    // Xử lý hàng đợi lệnh của AI
    if (this._isExecutingAI) {
      this.executeAI(isOnGround);
    } else if (this.isAutoRunning) {
      // Khi không có kịch bản, AI sẽ tự chạy về phía trước
      body.setVelocityX(this.RUN_SPEEDS.normal); // Tốc độ chạy mặc định
    }

    // Animation vẫn giữ nguyên, dựa trên velocity  
    this.animationManager.updateAnimation(body.velocity, isOnGround);
    // sendNetworkUpdate và updateNameTag đã được xóa
  }

  // THÊM MỚI: Phương thức để áp dụng lực nhảy tùy chỉnh
  public applyCustomJump(forceX: number, forceY: number): void {
    if (!this.sprite || !this.sprite.body || this.isDead) return;

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(forceX, forceY);

    // Phát âm thanh nhảy
    this.scene.sound.play("jump");
  }

  private executeAI(isOnGround: boolean): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    // Nếu không có lệnh hiện tại, lấy lệnh tiếp theo từ hàng đợi
    if (!this.currentAICommand && this.aiCommandQueue.length > 0) {
      this.currentAICommand = this.aiCommandQueue.shift()!;
      this.commandTimer = this.currentAICommand.duration || 0;
    }

    // Nếu vẫn còn lệnh để thực thi
    if (this.currentAICommand) {
      const command = this.currentAICommand;

      // Thực thi lệnh
      switch (command.action) {
        case "move":
          // --- SỬA ĐỔI Ở ĐÂY ---
          const speedIntensity =
            (command.intensity as "slow" | "normal" | "fast") || "normal";
          const targetSpeed = this.RUN_SPEEDS[speedIntensity];
          const finalSpeed =
            command.direction === "left" ? -targetSpeed : targetSpeed;
          body.setVelocityX(finalSpeed);
          break;
        case "jump":
          if (isOnGround) {
            // --- SỬA ĐỔI Ở ĐÂY ---
            const jumpIntensity =
              (command.intensity as "low" | "normal" | "high") || "normal";
            const targetJumpPower = this.JUMP_POWERS[jumpIntensity];

            body.setVelocityY(targetJumpPower);

            // Khi nhảy, vẫn giữ tốc độ chạy tới ở mức bình thường
            body.setVelocityX(this.RUN_SPEEDS.normal);

            this.scene.sound.play("jump");
          }
          // Lệnh nhảy là hành động tức thời, không cần timer
          this.currentAICommand = null;
          return; // Chuyển sang lệnh tiếp theo ngay
        case "wait":
          body.setVelocityX(0);
          break;
      }

      // Đếm ngược thời gian thực thi lệnh
      if (command.duration) {
        this.commandTimer -= this.scene.game.loop.delta;
        if (this.commandTimer <= 0) {
          this.currentAICommand = null; // Lệnh đã hoàn thành
        }
      } else {
        this.currentAICommand = null; // Lệnh không có duration là lệnh tức thời
      }
    } else {
      // Hàng đợi lệnh đã hết
      this._isExecutingAI = false;
      // Quay lại trạng thái chạy tự động (sẽ được xử lý ở frame tiếp theo)
    }
  }

  // Các hàm helper để GameplayScene có thể điều khiển AI
  public executeScript(commands: AICommand[]): Promise<void> {
    return new Promise<void>((resolve) => {
      this.aiCommandQueue = [...commands];
      this.currentAICommand = null;
      this._isExecutingAI = true;

      // Hàm kiểm tra hoàn thành script
      const checkCompletion = () => {
        if (
          !this._isExecutingAI ||
          (this.aiCommandQueue.length === 0 && !this.currentAICommand)
        ) {
          resolve();
        } else {
          requestAnimationFrame(checkCompletion);
        }
      };

      // Bắt đầu kiểm tra
      checkCompletion();
    });
  }

  public stopAI(): void {
    this._isExecutingAI = false;
    this.aiCommandQueue = [];
    this.currentAICommand = null;
  }

  public isExecutingAI(): boolean {
    return this._isExecutingAI;
  }

  public resumeAutoRun(): void {
    this.isAutoRunning = true;
  }

  public stopAutoRun(): void {
    this.isAutoRunning = false;
    if (this.sprite && this.sprite.body) {
      (this.sprite.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
    }
  }

  public moveTo(x: number, y: number): Promise<void> {
    this.isAutoRunning = false;

    // Tính toán vị trí đích dựa trên kích thước và offset của sprite
    // Sprite có kích thước 48x80 và offset 40x48 (từ setupPhysics)
    // Điều chỉnh y để chân của nhân vật đứng trên mặt đất
    // Chân của nhân vật = y + 80/2 (nửa chiều cao của body)
    const targetY = y - 40; // Điều chỉnh để chân nhân vật đứng trên mặt đất

    console.log(`🚶 Di chuyển nhân vật đến điểm chờ: (${x}, ${targetY})`);

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.sprite,
        x: x,
        y: targetY,
        duration: 200, // Thời gian di chuyển, có thể điều chỉnh
        ease: "Power2",
        onComplete: () => {
          resolve();
        },
      });
    });
  }

  public getIsDead(): boolean {
    return this.isDead;
  }

  public die(onDied?: () => void): void {
    if (this.isDead) return; // Tránh gọi nhiều lần

    this.isDead = true;
    this.stopAutoRun();
    this.stopAI();

    // Thêm animation chết, ví dụ: chớp đỏ rồi mờ dần
    this.sprite.setTint(0xff0000);
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: 500,
      ease: "Power2",
      onComplete: () => {
        // Sau khi animation chết hoàn thành, gọi callback
        if (onDied) onDied();
      },
    });
  }

  // sendNetworkUpdate đã được xóa do không còn dùng Colyseus
  // updateNameTag method đã được xóa

  public getSprite(): Phaser.Physics.Arcade.Sprite {
    return this.sprite;
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  public respawn(x: number, y: number): void {
    this.isDead = false;

    // Đặt lại vị trí và trạng thái vật lý
    this.sprite.setPosition(x, y);
    this.sprite.setVelocity(0, 0);

    // Reset lại hình ảnh
    this.sprite.clearTint();
    this.sprite.setAlpha(1);
    this.sprite.setVisible(true);

    // Có thể thêm hiệu ứng hồi sinh ở đây, ví dụ: fade in
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 0, to: 1 },
      duration: 300,
    });
  }

  // Phương thức respawn với tham số đã được định nghĩa ở trên

  public destroy(): void {
    // nameTag cleanup đã được xóa
    this.animationManager?.destroy();
    this.sprite?.destroy();
  }
}
