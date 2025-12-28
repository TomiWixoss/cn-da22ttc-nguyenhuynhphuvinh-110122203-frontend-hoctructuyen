# 🎮 Phaser Game Mechanics - Chi Tiết Hoạt Động

## 📋 Mục Lục
1. [Procedural Map Generation](#procedural-map-generation)
2. [Player Movement & Physics](#player-movement--physics)
3. [Quiz Gate System](#quiz-gate-system)
4. [Collectibles System](#collectibles-system)
5. [Checkpoint & Respawn](#checkpoint--respawn)
6. [AI Auto-run System](#ai-auto-run-system)
7. [Camera System](#camera-system)
8. [Save/Load Progress](#saveload-progress)

---

## 🗺️ Procedural Map Generation

### Concept

Map được tạo động dựa trên:
- Số lượng câu hỏi
- Độ khó của từng câu hỏi (Dễ, Trung bình, Khó)
- Seeded random để đảm bảo consistency

### Chunk System

Mỗi câu hỏi = 1 chunk (đoạn map):

```
[Start] → [Chunk 1: Dễ] → [Chunk 2: Dễ] → [Chunk 3: TB] → [Chunk 4: Khó] → [Finish]
           ↓                ↓                ↓               ↓
        Quiz Gate 1      Quiz Gate 2      Quiz Gate 3     Quiz Gate 4
```

### Chunk Selection Logic

```typescript
// ProceduralMapGenerator.ts
private selectChunkForQuestion(question: Question): string {
  const difficulty = question.level.name;
  
  // Map độ khó → chunk pool
  const chunkPools = {
    "Dễ": ["easy_1", "easy_2", "easy_3", "easy_4"],
    "Trung bình": ["medium_1", "medium_2", "medium_3"],
    "Khó": ["hard_1", "hard_2", "hard_3"]
  };
  
  const pool = chunkPools[difficulty] || chunkPools["Dễ"];
  
  // Seeded random để chọn chunk
  const index = this.seededRandom.nextInt(0, pool.length - 1);
  return pool[index];
}
```

### Chunk Structure (Tiled Format)

Mỗi chunk là một Tiled tilemap JSON:

```json
{
  "layers": [
    {
      "name": "Ground",
      "type": "tilelayer",
      "data": [1, 1, 1, 0, 0, 1, 1, 1]
    },
    {
      "name": "Platforms",
      "type": "tilelayer",
      "data": [0, 0, 2, 2, 0, 0, 0, 0]
    },
    {
      "name": "Objects",
      "type": "objectgroup",
      "objects": [
        {
          "name": "coin",
          "x": 100,
          "y": 200,
          "properties": [
            { "name": "value", "value": 3 }
          ]
        },
        {
          "name": "jump_pad",
          "x": 300,
          "y": 400,
          "properties": [
            { "name": "forceX", "value": 200 },
            { "name": "forceY", "value": -600 }
          ]
        }
      ]
    }
  ]
}
```

### Map Generation Process

```typescript
async create(): Promise<void> {
  // 1. Tạo sequence chunks từ câu hỏi
  const chunkSequence = this.createChunkSequence(this.activeQuestions);
  // ["easy_1", "easy_2", "medium_1", "hard_1"]
  
  // 2. Render từng chunk
  let currentX = 0;
  for (let i = 0; i < chunkSequence.length; i++) {
    const chunkName = chunkSequence[i];
    const question = this.activeQuestions[i];
    
    // Load tilemap
    const tilemap = this.make.tilemap({ key: chunkName });
    
    // Render chunk tại vị trí currentX
    const chunkWidth = this.renderChunk(tilemap, currentX);
    
    // Spawn quiz gate ở cuối chunk
    this.spawnQuizGate(currentX + chunkWidth - 100, question);
    
    // Spawn coins và eggs trong chunk
    this.spawnCollectibles(tilemap, currentX);
    
    // Di chuyển đến vị trí chunk tiếp theo
    currentX += chunkWidth;
  }
  
  // 3. Tạo finish zone
  this.createFinishZone(currentX);
}
```

### Seeded Random

Đảm bảo cùng một quiz luôn tạo ra cùng một map:

```typescript
// SeededRandom.ts
export class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    // Linear Congruential Generator
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

// Usage
const seed = quizId + userId; // Unique per user per quiz
const random = new SeededRandom(seed);
```

### Map Extension (Review Round)

Khi hết câu hỏi gốc, map tự động mở rộng:

```typescript
// Khi player hoàn thành câu cuối
if (this.currentGateIndex >= this.originalQuestionsCount) {
  // Lấy câu hỏi sai để làm lại
  const wrongQuestions = this.getWrongQuestions();
  
  if (wrongQuestions.length > 0) {
    // Thêm câu hỏi vào danh sách active
    this.activeQuestions.push(...wrongQuestions);
    
    // Tạo chunks mới
    const newChunks = this.createChunkSequence(wrongQuestions);
    
    // Render chunks mới tiếp nối map hiện tại
    this.extendMap(newChunks);
    
    // Emit event để React biết
    EventBus.emit("review-round-started", {
      questionsCount: wrongQuestions.length
    });
  }
}
```

---

## 🏃 Player Movement & Physics

### Physics Configuration

```typescript
// Arcade Physics
physics: {
  arcade: {
    gravity: { y: 800, x: 0 },  // Gravity pulls down
    debug: false,                // Show hitboxes
    fps: 120                     // Physics update rate
  }
}

// Player body
body.setSize(48, 80);           // Hitbox size
body.setOffset(40, 48);         // Hitbox offset
body.setBounce(0.2);            // Bounce on collision
body.setCollideWorldBounds(true); // Can't go outside world
```

### Movement Speeds

```typescript
private readonly RUN_SPEEDS = {
  slow: 150,
  normal: 250,
  fast: 400
};

private readonly JUMP_POWERS = {
  low: -450,
  normal: -600,
  high: -750
};
```

### Auto-run System

Player tự động chạy về phía trước:

```typescript
update(): void {
  if (this.isAutoRunning) {
    body.setVelocityX(this.RUN_SPEEDS.normal);
  }
  
  // Animation based on velocity
  this.animationManager.updateAnimation(body.velocity, isOnGround);
}
```

### AI Script Execution

Player có thể thực thi script để vượt obstacles:

```typescript
interface AICommand {
  action: "move" | "jump" | "wait";
  direction?: "left" | "right";
  duration?: number;
  intensity?: "low" | "normal" | "high";
}

// Example: Jump over gap
const script: AICommand[] = [
  { action: "move", direction: "right", duration: 300, intensity: "fast" },
  { action: "jump", intensity: "high" },
  { action: "move", direction: "right", duration: 500, intensity: "normal" }
];

await player.executeScript(script);
player.resumeAutoRun(); // Continue auto-run after script
```

### Jump Pads (Interactive Zones)

Zones đặc biệt tự động làm player nhảy:

```typescript
// Spawn jump pad từ tilemap
const jumpPad = this.add.zone(x, y, width, height);
this.physics.add.existing(jumpPad);

// Collision với player
this.physics.add.overlap(
  this.player.getSprite(),
  jumpPad,
  () => {
    // Apply custom jump force
    this.player.applyCustomJump(forceX, forceY);
    
    // Visual feedback
    this.cameraManager.shake(0.01, 100);
  }
);
```

---

## 🚪 Quiz Gate System

### Gate Structure

```typescript
interface QuizGate {
  x: number;              // Position X
  y: number;              // Position Y
  question: Question;     // Associated question
  zone: Phaser.GameObjects.Zone;  // Collision zone
  visual: Phaser.GameObjects.Sprite; // Visual representation
  answered: boolean;      // Has been answered
}
```

### Gate Spawning

```typescript
private spawnQuizGate(x: number, question: Question): void {
  // Create collision zone
  const zone = this.add.zone(x, 300, 100, 600);
  this.physics.add.existing(zone);
  
  // Create visual (door sprite)
  const visual = this.add.sprite(x, 300, "quiz-gate");
  visual.setScale(2);
  
  // Add to gates array
  this.quizGates.push({
    x: x,
    y: 300,
    question: question,
    zone: zone,
    visual: visual,
    answered: false
  });
}
```

### Gate Collision Detection

```typescript
update(): void {
  // Check if player is near next gate
  const nextGate = this.quizGates[this.currentGateIndex];
  if (!nextGate || nextGate.answered) return;
  
  const playerX = this.player.getPosition().x;
  const distanceToGate = nextGate.x - playerX;
  
  // Player reached gate
  if (distanceToGate < 50) {
    // Stop player
    this.player.stopAutoRun();
    this.gameState = "WAITING_FOR_QUIZ";
    
    // Request quiz from React
    EventBus.emit("request-quiz", {
      gateIndex: this.currentGateIndex,
      question: nextGate.question,
      position: { x: nextGate.x, y: nextGate.y }
    });
  }
}
```

### Gate Opening Animation

```typescript
private openGate(gateIndex: number): void {
  const gate = this.quizGates[gateIndex];
  
  // Mark as answered
  gate.answered = true;
  
  // Fade out animation
  this.tweens.add({
    targets: gate.visual,
    alpha: 0,
    duration: 500,
    ease: "Power2",
    onComplete: () => {
      gate.visual.destroy();
      gate.zone.destroy();
    }
  });
  
  // Camera flash effect
  this.cameraManager.flash(0x00ff00, 250);
}
```

### Quiz Result Handling

```typescript
EventBus.on("quiz-result", (data: {
  correct: boolean;
  gateIndex: number;
}) => {
  if (data.correct) {
    // Open gate
    this.openGate(data.gateIndex);
    
    // Continue game
    this.currentGateIndex++;
    this.gameState = "RUNNING";
    this.player.resumeAutoRun();
    
    // Save checkpoint
    this.lastCheckpoint = {
      gateIndex: data.gateIndex,
      respawnX: this.player.getPosition().x,
      respawnY: this.player.getPosition().y
    };
    
    EventBus.emit("checkpoint-reached", {
      gateIndex: data.gateIndex
    });
  } else {
    // Wrong answer - respawn at checkpoint
    this.respawnPlayer();
  }
});
```

---

## 💰 Collectibles System

### Coin System

**Coin Values:**
- Easy chunk: 1 coin
- Medium chunk: 3 coins
- Hard chunk: 5 coins

**Spawning:**

```typescript
private spawnCoins(tilemap: Phaser.Tilemaps.Tilemap, offsetX: number): void {
  const objectLayer = tilemap.getObjectLayer("Objects");
  
  objectLayer.objects.forEach(obj => {
    if (obj.name === "coin") {
      // Get coin value from properties
      const value = obj.properties?.find(p => p.name === "value")?.value || 1;
      
      // Create coin sprite
      const coin = this.physics.add.sprite(
        offsetX + obj.x,
        obj.y,
        "coin"
      );
      
      // Store value in data
      coin.setData("value", value);
      coin.setData("id", `coin_${offsetX}_${obj.x}_${obj.y}`);
      
      // Add to group
      this.coins.add(coin);
      
      // Floating animation
      this.tweens.add({
        targets: coin,
        y: coin.y - 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }
  });
}
```

**Collection:**

```typescript
private handleCoinCollect(coin: Phaser.GameObjects.Sprite): void {
  const coinId = coin.getData("id");
  
  // Check if already collected (for save/load)
  if (this.collectedCoins.has(coinId)) return;
  
  // Mark as collected
  this.collectedCoins.add(coinId);
  
  // Get coin value
  const value = coin.getData("value") || 1;
  this.totalCoinValue += value;
  
  // Visual feedback
  this.cameraManager.shake(0.005, 100);
  this.sound.play("collect_coin");
  
  // Particle effect
  this.createCoinParticles(coin.x, coin.y);
  
  // Destroy coin
  coin.destroy();
  
  // Update React UI
  EventBus.emit("coin-collected", {
    newCoinCount: this.totalCoinValue,
    coinValue: value
  });
}
```

### Egg System

**Egg Types:**

```typescript
const EGG_TYPES = {
  COMMON: {
    id: "egg_common",
    rarity: "common",
    dropRate: 0.50,  // 50%
    imagePath: "/eggs-icon-pack/egg_common.png"
  },
  RARE: {
    id: "egg_rare",
    rarity: "rare",
    dropRate: 0.30,  // 30%
    imagePath: "/eggs-icon-pack/egg_rare.png"
  },
  EPIC: {
    id: "egg_epic",
    rarity: "epic",
    dropRate: 0.15,  // 15%
    imagePath: "/eggs-icon-pack/egg_epic.png"
  },
  LEGENDARY: {
    id: "egg_legendary",
    rarity: "legendary",
    dropRate: 0.05,  // 5%
    imagePath: "/eggs-icon-pack/egg_legendary.png"
  }
};
```

**Spawning:**

```typescript
private spawnEgg(x: number, y: number): void {
  // Random egg type based on drop rate
  const eggType = this.selectRandomEggType();
  
  // 10% chance for golden variant
  const isGolden = Math.random() < 0.1;
  const textureKey = isGolden ? `${eggType.id}_GOLDEN` : eggType.id;
  
  // Create egg sprite
  const egg = this.physics.add.sprite(x, y, textureKey);
  egg.setData("eggType", eggType);
  egg.setData("isGolden", isGolden);
  egg.setData("id", `egg_${x}_${y}_${eggType.id}`);
  
  // Add to group
  this.eggs.add(egg);
  
  // Glow effect for rare eggs
  if (eggType.rarity !== "common") {
    this.addGlowEffect(egg);
  }
}

private selectRandomEggType(): EggType {
  const roll = Math.random();
  let cumulative = 0;
  
  for (const eggType of Object.values(EGG_TYPES)) {
    cumulative += eggType.dropRate;
    if (roll <= cumulative) {
      return eggType;
    }
  }
  
  return EGG_TYPES.COMMON;
}
```

**Collection:**

```typescript
private handleEggCollect(egg: Phaser.GameObjects.Sprite): void {
  const eggId = egg.getData("id");
  
  // Check if already collected
  if (this.collectedEggs.has(eggId)) return;
  
  // Mark as collected
  this.collectedEggs.add(eggId);
  
  // Get egg data
  const eggType = egg.getData("eggType");
  const isGolden = egg.getData("isGolden");
  
  // Store egg data
  const eggData = {
    id: eggId,
    type: eggType.id,
    rarity: eggType.rarity,
    isGolden: isGolden,
    collectedAt: Date.now()
  };
  
  this.collectedEggData.push(eggData);
  
  // Visual feedback
  this.cameraManager.flash(0xffd700, 300);
  this.createEggCollectEffect(egg.x, egg.y, eggType.rarity);
  
  // Destroy egg
  egg.destroy();
  
  // Update React UI
  EventBus.emit("egg-collected", {
    newCollectedEggs: this.collectedEggData,
    eggData: eggData
  });
}
```

---

## 🔄 Checkpoint & Respawn

### Checkpoint System

```typescript
interface Checkpoint {
  gateIndex: number;
  respawnX: number;
  respawnY: number;
}

// Save checkpoint after correct answer
this.lastCheckpoint = {
  gateIndex: this.currentGateIndex,
  respawnX: this.player.getPosition().x + 100,
  respawnY: this.player.getPosition().y
};
```

### Respawn Logic

```typescript
private respawnPlayer(): void {
  if (!this.lastCheckpoint) {
    // No checkpoint - respawn at start
    this.player.respawn(this.playerSpawnPoint.x, this.playerSpawnPoint.y);
    this.currentGateIndex = 0;
  } else {
    // Respawn at last checkpoint
    this.player.respawn(
      this.lastCheckpoint.respawnX,
      this.lastCheckpoint.respawnY
    );
    this.currentGateIndex = this.lastCheckpoint.gateIndex + 1;
  }
  
  // Resume game
  this.gameState = "RUNNING";
  this.player.resumeAutoRun();
  
  // Camera fade in
  this.cameraManager.fadeIn(300);
}
```

### Death Zones

```typescript
// Create death zone (lava, spikes, etc.)
const deathZone = this.add.zone(x, y, width, height);
this.physics.add.existing(deathZone);

// Collision with player
this.physics.add.overlap(
  this.player.getSprite(),
  deathZone,
  () => {
    // Player dies
    this.player.die(() => {
      // Respawn after death animation
      this.respawnPlayer();
    });
  }
);
```

---

## 🤖 AI Auto-run System

### Command Queue

```typescript
private aiCommandQueue: AICommand[] = [];
private currentAICommand: AICommand | null = null;
private commandTimer: number = 0;
```

### Script Execution

```typescript
public async executeScript(commands: AICommand[]): Promise<void> {
  return new Promise<void>((resolve) => {
    // Load commands into queue
    this.aiCommandQueue = [...commands];
    this.currentAICommand = null;
    this._isExecutingAI = true;
    
    // Check completion
    const checkCompletion = () => {
      if (!this._isExecutingAI || 
          (this.aiCommandQueue.length === 0 && !this.currentAICommand)) {
        resolve();
      } else {
        requestAnimationFrame(checkCompletion);
      }
    };
    
    checkCompletion();
  });
}
```

### Command Processing

```typescript
private executeAI(isOnGround: boolean): void {
  // Get next command
  if (!this.currentAICommand && this.aiCommandQueue.length > 0) {
    this.currentAICommand = this.aiCommandQueue.shift()!;
    t