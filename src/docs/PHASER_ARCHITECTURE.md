# 🎮 Kiến Trúc Phaser Game Engine

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
3. [Luồng Khởi Tạo](#luồng-khởi-tạo)
4. [Tương Tác React ↔ Phaser](#tương-tác-react--phaser)
5. [Các Thành Phần Chính](#các-thành-phần-chính)
6. [Game Loop & Lifecycle](#game-loop--lifecycle)
7. [Hệ Thống Events](#hệ-thống-events)
8. [Best Practices](#best-practices)

---

## 🎯 Tổng Quan

Phaser là một HTML5 game framework được tích hợp vào ứng dụng Next.js/React để tạo ra các mini-game platformer cho hệ thống quiz. Kiến trúc được thiết kế để:

- **Tách biệt logic**: Game logic (Phaser) và UI logic (React) hoàn toàn độc lập
- **Giao tiếp 2 chiều**: Sử dụng EventBus để React và Phaser có thể gửi/nhận events
- **Quản lý lifecycle**: React component quản lý việc mount/unmount Phaser game
- **Performance**: Game chạy trên canvas riêng, không ảnh hưởng đến React rendering

### Sơ Đồ Tổng Quan

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         QuizGameWrapper Component                       │ │
│  │  - Quản lý game state (PLAYING, COMPLETED)             │ │
│  │  - Hiển thị UI overlay (timer, coins, eggs)            │ │
│  │  - Xử lý quiz logic                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↕ EventBus                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Phaser Game Engine                         │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │  GameplayScene                                    │  │ │
│  │  │  - Procedural map generation                      │  │ │
│  │  │  - Player movement & physics                      │  │ │
│  │  │  - Collision detection                            │  │ │
│  │  │  - Quiz gates & checkpoints                       │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Cấu Trúc Thư Mục

```
phaser/
├── index.ts                    # Entry point - exports tất cả
├── GameEngine.ts               # Khởi tạo Phaser.Game instance
├── EventBus.ts                 # Communication bridge React ↔ Phaser
│
├── config/
│   ├── constants.ts            # Game constants (colors, speeds, etc.)
│   └── gameConfig.ts           # Phaser game configuration
│
├── scenes/
│   ├── PreloadScene.ts         # Scene loading assets
│   ├── index.ts
│   └── platformer/
│       ├── GameplayScene.ts    # Main gameplay scene
│       └── ProceduralMapGenerator.ts  # Map generation logic
│
├── classes/
│   └── platformer/
│       ├── Player.ts           # Player character logic
│       ├── CameraManager.ts    # Camera controls & effects
│       ├── AnimationManager.ts # Character animations
│       └── CharacterFrames.ts  # Animation frame definitions
│
└── utils/
    └── SeededRandom.ts         # Seeded random for procedural generation
```

---

## 🚀 Luồng Khởi Tạo

### 1. React Component Mount

```typescript
// src/components/features/game/QuizGameWrapper.tsx
const startGame = useCallback(
  async (mode: GameMode) => {
    if (!gameInitialized.current) {
      gameInitialized.current = true;

      // Bước 1: Khởi tạo Phaser Game
      globalGameInstance = StartGame("game-container");

      // Bước 2: Đợi Phaser sẵn sàng
      EventBus.once("game-ready", () => {
        // Bước 3: Start gameplay scene với data
        globalGameInstance?.scene.start("GameplayScene", {
          quizData: quizData,
          gameMode: mode,
          user: user,
          savedProgress: savedProgress,
        });
      });
    }
  },
  [quizData, user, savedProgress]
);
```

### 2. Phaser Engine Initialization

```typescript
// phaser/GameEngine.ts
const StartGame = (parent: string): Phaser.Game => {
  const config = createGameConfig(parent);
  return new Phaser.Game(config);
};
```

**Config bao gồm:**

- Canvas parent element ID
- Physics engine (Arcade Physics)
- Scene list (PreloadScene, GameplayScene)
- Render settings
- Scale mode (responsive)

### 3. Scene Lifecycle

```
PreloadScene.create()
    ↓
EventBus.emit("game-ready")
    ↓
React receives event
    ↓
scene.start("GameplayScene", data)
    ↓
GameplayScene.init(data)
    ↓
GameplayScene.preload()
    ↓
GameplayScene.create()
    ↓
GameplayScene.update() [60 FPS loop]
```

---

## 🔄 Tương Tác React ↔ Phaser

### EventBus - Cầu Nối Giao Tiếp

```typescript
// phaser/EventBus.ts
export const EventBus = new Events.EventEmitter();
```

### Phaser → React (Gửi Events)

```typescript
// Trong GameplayScene.ts
EventBus.emit("request-quiz", {
  gateIndex: this.currentGateIndex,
  question: currentQuestion,
});

EventBus.emit("coin-collected", {
  newCoinCount: this.totalCoinValue,
});

EventBus.emit("checkpoint-reached", {
  gateIndex: checkpointGateIndex,
});
```

### React → Phaser (Nhận Events)

```typescript
// Trong QuizGameWrapper.tsx
useEffect(() => {
  const handleRequestQuiz = (data: any) => {
    // Xử lý hiển thị quiz dialog
    setCurrentQuestion(data.question);
    setShowQuizDialog(true);
  };

  EventBus.on("request-quiz", handleRequestQuiz);

  return () => {
    EventBus.off("request-quiz", handleRequestQuiz);
  };
}, [dependencies]);
```

### React → Phaser (Gửi Commands)

```typescript
// Gửi kết quả quiz về Phaser
EventBus.emit("quiz-result", {
  correct: isCorrect,
  timeLeft: quizTimeLeft,
  selectedAnswer: selectedAnswer,
});

// Yêu cầu lưu progress
EventBus.emit("request-save-before-unload");
```

### Các Events Chính

| Event                | Direction      | Mục Đích                                    |
| -------------------- | -------------- | ------------------------------------------- |
| `game-ready`         | Phaser → React | Phaser đã load xong, sẵn sàng start scene   |
| `request-quiz`       | Phaser → React | Player chạm quiz gate, cần hiển thị câu hỏi |
| `quiz-result`        | React → Phaser | Người dùng đã trả lời, gửi kết quả về game  |
| `coin-collected`     | Phaser → React | Player nhặt coin, cập nhật UI               |
| `egg-collected`      | Phaser → React | Player nhặt trứng, cập nhật inventory       |
| `checkpoint-reached` | Phaser → React | Player đạt checkpoint, lưu progress         |
| `game-completed`     | Phaser → React | Hoàn thành game, hiển thị kết quả           |
| `save-progress`      | Phaser → React | Tự động lưu tiến trình                      |
| `time-up`            | React → Phaser | Hết giờ (assessment mode)                   |

---

## 🎮 Các Thành Phần Chính

### 1. GameplayScene

**Trách nhiệm:**

- Quản lý game state (RUNNING, WAITING_FOR_QUIZ, GAME_OVER)
- Tạo procedural map từ câu hỏi
- Spawn player và setup physics
- Xử lý collision detection
- Quản lý quiz gates và checkpoints
- Thu thập coins và eggs

**Lifecycle Methods:**

```typescript
class GameplayScene extends Scene {
  // Nhận data từ React
  init(data: {
    quizData?: QuizDetail;
    gameMode?: GameMode;
    user?: any;
    savedProgress?: GameProgressState;
  }): void;

  // Load assets (tilemaps, sprites, sounds)
  preload(): void;

  // Setup game objects, physics, events
  async create(): Promise<void>;

  // Game loop - chạy 60 FPS
  update(time: number, delta: number): void;
}
```

**Key Features:**

- **Procedural Map Generation**: Tạo map động dựa trên độ khó câu hỏi
- **Quiz Gates**: Checkpoint yêu cầu trả lời câu hỏi
- **Coin System**: Thu thập coins với giá trị khác nhau (easy=1, medium=3, hard=5)
- **Egg System**: Thu thập trứng ngẫu nhiên (common, rare, epic, legendary)
- **Save/Load Progress**: Lưu vị trí, coins, eggs, câu hỏi đã trả lời

### 2. Player Class

**Trách nhiệm:**

- Quản lý sprite và animations
- Xử lý physics (movement, jump, gravity)
- AI auto-run và script execution
- Death và respawn logic

**Key Methods:**

```typescript
class Player {
  // Cập nhật mỗi frame
  update(): void;

  // AI tự động chạy
  resumeAutoRun(): void;
  stopAutoRun(): void;

  // Thực thi script AI
  executeScript(commands: AICommand[]): Promise<void>;

  // Di chuyển đến vị trí
  moveTo(x: number, y: number): Promise<void>;

  // Nhảy với lực tùy chỉnh
  applyCustomJump(forceX: number, forceY: number): void;

  // Death & respawn
  die(onDied?: () => void): void;
  respawn(x: number, y: number): void;
}
```

**AI Command System:**

```typescript
interface AICommand {
  action: "move" | "jump" | "wait";
  direction?: "left" | "right" | "none";
  duration?: number; // milliseconds
  intensity?: "low" | "normal" | "high" | "slow" | "fast";
}

// Ví dụ: Script để player nhảy qua obstacle
const script: AICommand[] = [
  { action: "move", direction: "right", duration: 500, intensity: "fast" },
  { action: "jump", intensity: "high" },
  { action: "move", direction: "right", duration: 300, intensity: "normal" },
];

await player.executeScript(script);
```

### 3. CameraManager

**Trách nhiệm:**

- Follow player với smooth lerp
- Dynamic offset dựa trên player velocity
- Camera effects (shake, flash, fade)
- Bounds để camera không ra ngoài map

**Key Features:**

```typescript
class CameraManager {
  // Follow player
  followTarget(target: GameObject): void;

  // Set camera bounds
  setBounds(x: number, y: number, width: number, height: number): void;

  // Camera effects
  shake(intensity: number, duration: number): void;
  flash(color: number, duration: number): void;
  fade(color: number, duration: number): Promise<void>;

  // Dynamic offset based on player velocity
  update(): void;
}
```

**Dynamic Camera Behavior:**

- Player nhảy cao → Camera nhìn lên
- Player rơi nhanh → Camera nhìn xuống
- Player đứng yên → Camera ở vị trí mặc định

### 4. ProceduralMapGenerator

**Trách nhiệm:**

- Tạo map chunks dựa trên độ khó câu hỏi
- Spawn quiz gates tại vị trí phù hợp
- Spawn coins và eggs
- Tạo interactive zones (jump pads)

**Chunk Selection Logic:**

```typescript
// Dễ → easy_1, easy_2, easy_3, easy_4
// Trung bình → medium_1, medium_2, medium_3
// Khó → hard_1, hard_2, hard_3

const chunkName = this.selectChunkForQuestion(question);
```

**Map Extension:**

- Khi hết câu hỏi gốc, tự động thêm câu hỏi sai để làm lại
- Mở rộng map với chunks mới
- Lưu thông tin extended chunks để restore

---

## ⚙️ Game Loop & Lifecycle

### Update Loop (60 FPS)

```typescript
// GameplayScene.update()
update(time: number, delta: number): void {
  // 1. Update player
  if (this.player && !this.player.getIsDead()) {
    this.player.update();
  }

  // 2. Update camera
  if (this.cameraManager) {
    this.cameraManager.update();
  }

  // 3. Check collisions
  this.checkPlayerCollisions();

  // 4. Check quiz gates
  this.checkQuizGateProximity();

  // 5. Check finish zone
  this.checkFinishZone();
}
```

### Physics System

**Arcade Physics Configuration:**

```typescript
physics: {
  default: "arcade",
  arcade: {
    gravity: { y: 800, x: 0 },  // Gravity
    debug: false,                // Hitbox visualization
    fps: 120                     // Physics update rate
  }
}
```

**Collision Groups:**

- Player ↔ Ground (platforms)
- Player ↔ Quiz Gates (triggers)
- Player ↔ Coins (collectibles)
- Player ↔ Eggs (collectibles)
- Player ↔ Death Zones (respawn)
- Player ↔ Interactive Zones (jump pads)

### State Management

**Game States:**

```typescript
type GameLoopState = "RUNNING" | "WAITING_FOR_QUIZ" | "GAME_OVER";
```

**State Transitions:**

```
RUNNING
  ↓ (player reaches quiz gate)
WAITING_FOR_QUIZ
  ↓ (quiz answered correctly)
RUNNING
  ↓ (quiz answered incorrectly)
RUNNING (respawn at checkpoint)
  ↓ (all questions completed)
GAME_OVER
```

---

## 📡 Hệ Thống Events

### Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Game Event Flow                           │
└─────────────────────────────────────────────────────────────┘

Player Movement
    ↓
Collision Detection
    ↓
Quiz Gate Triggered
    ↓
EventBus.emit("request-quiz")
    ↓
React: Show Quiz Dialog
    ↓
User Answers
    ↓
EventBus.emit("quiz-result")
    ↓
Phaser: Process Result
    ↓
Correct → Continue | Incorrect → Respawn
```

### Event Handling Best Practices

**1. Cleanup Listeners:**

```typescript
useEffect(() => {
  const handler = (data: any) => {
    // Handle event
  };

  EventBus.on("event-name", handler);

  // IMPORTANT: Cleanup
  return () => {
    EventBus.off("event-name", handler);
  };
}, [dependencies]);
```

**2. Avoid Memory Leaks:**

```typescript
// BAD: Listener không được cleanup
EventBus.on("event", () => {
  /* ... */
});

// GOOD: Sử dụng useEffect với cleanup
useEffect(() => {
  const handler = () => {
    /* ... */
  };
  EventBus.on("event", handler);
  return () => EventBus.off("event", handler);
}, []);
```

**3. Use Refs for Mutable State:**

```typescript
// BAD: State trong closure có thể stale
const [gameMode, setGameMode] = useState("practice");
EventBus.on("event", () => {
  console.log(gameMode); // Có thể là giá trị cũ
});

// GOOD: Sử dụng ref
const gameModeRef = useRef("practice");
EventBus.on("event", () => {
  console.log(gameModeRef.current); // Luôn là giá trị mới nhất
});
```

---

## 🎨 Best Practices

### 1. Separation of Concerns

**Phaser (Game Logic):**

- Physics và collision
- Map generation
- Player movement
- Visual effects

**React (UI & Business Logic):**

- Quiz display và validation
- Timer management
- Score calculation
- API calls (save progress, submit results)
- Navigation

### 2. Performance Optimization

**Phaser Side:**

```typescript
// Sử dụng object pooling cho coins/eggs
// Destroy unused objects
coin.destroy();

// Disable physics cho static objects
sprite.body.enable = false;

// Optimize collision checks
this.physics.add.overlap(player, coins, handleCollect, undefined, this);
```

**React Side:**

```typescript
// Memoize expensive calculations
const processedData = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// Use refs để tránh re-render
const gameInstanceRef = useRef<Phaser.Game | null>(null);
```

### 3. Error Handling

```typescript
// Phaser: Graceful degradation
try {
  this.player.executeScript(script);
} catch (error) {
  console.error("Script execution failed:", error);
  this.player.resumeAutoRun(); // Fallback
}

// React: Error boundaries
<ErrorBoundary>
  <QuizGameWrapper />
</ErrorBoundary>;
```

### 4. Debugging

**Enable Physics Debug:**

```typescript
// phaser/config/gameConfig.ts
physics: {
  arcade: {
    debug: true; // Hiển thị hitboxes
  }
}
```

**Console Logging:**

```typescript
// Sử dụng emoji để dễ phân biệt
console.log("🎮 Game started");
console.log("📍 Player position:", x, y);
console.log("⚠️ Warning:", message);
console.log("❌ Error:", error);
```

### 5. Asset Management

**Preload Assets:**

```typescript
preload(): void {
  // Load tất cả assets trước khi game start
  this.load.image("key", "path/to/image.png");
  this.load.audio("key", "path/to/sound.ogg");
  this.load.tilemapTiledJSON("key", "path/to/tilemap.json");
}
```

**Asset Organization:**

```
public/
├── kenney_new-platformer-pack-1.0/
│   ├── Spritesheets/
│   ├── Sprites/
│   └── Sounds/
└── assets/
    └── tilemaps/
        └── chunks/
            ├── easy/
            ├── medium/
            └── hard/
```

### 6. TypeScript Integration

**Type Safety:**

```typescript
// Define interfaces cho data
interface SceneData {
  quizData?: QuizDetail;
  gameMode?: GameMode;
  user?: User;
  savedProgress?: GameProgressState;
}

// Type scene methods
init(data: SceneData): void {
  this.quizData = data.quizData;
}
```

---

## 🔧 Common Patterns

### Pattern 1: Scene Data Passing

```typescript
// React → Phaser
game.scene.start("GameplayScene", {
  quizData: quizData,
  gameMode: "practice",
  user: currentUser
});

// Phaser receives
init(data: SceneData): void {
  this.quizData = data.quizData;
}
```

### Pattern 2: Async Operations

```typescript
// Wait for player to reach position
await this.player.moveTo(x, y);

// Execute AI script
await this.player.executeScript(commands);

// Camera fade
await this.cameraManager.fade(0x000000, 500);
```

### Pattern 3: Collision Callbacks

```typescript
this.physics.add.overlap(
  this.player.getSprite(),
  this.coins,
  (player, coin) => {
    this.handleCoinCollect(coin as Phaser.GameObjects.Sprite);
  },
  undefined,
  this
);
```

### Pattern 4: Tween Animations

```typescript
this.tweens.add({
  targets: sprite,
  y: sprite.y - 50,
  duration: 500,
  ease: "Bounce.easeOut",
  onComplete: () => {
    console.log("Animation complete");
  },
});
```

---

## 📚 Tài Liệu Tham Khảo

- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Phaser Examples](https://phaser.io/examples)
- [Arcade Physics](https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Arcade.html)
- [Scene Lifecycle](https://photonstorm.github.io/phaser3-docs/Phaser.Scene.html)

---

## 🎯 Kết Luận

Kiến trúc Phaser trong dự án này được thiết kế để:

1. **Tách biệt rõ ràng**: Game logic và UI logic hoàn toàn độc lập
2. **Giao tiếp hiệu quả**: EventBus cho phép communication 2 chiều
3. **Dễ mở rộng**: Thêm scenes, classes, features mới dễ dàng
4. **Performance tốt**: Canvas rendering không ảnh hưởng React
5. **Type-safe**: TypeScript đảm bảo code quality

Với kiến trúc này, bạn có thể:

- Thêm game modes mới
- Tạo scenes mới (boss fights, mini-games)
- Tích hợp multiplayer
- Thêm power-ups và items
- Mở rộng AI system
