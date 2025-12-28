# ⚛️ React - Phaser Integration Guide

## 📋 Mục Lục

1. [Component Setup](#component-setup)
2. [Lifecycle Management](#lifecycle-management)
3. [Event Communication](#event-communication)
4. [State Synchronization](#state-synchronization)
5. [Common Patterns](#common-patterns)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Component Setup

### QuizGameWrapper - Main Integration Component

```typescript
// src/components/features/game/QuizGameWrapper.tsx

import StartGame from "../../../../phaser/GameEngine";
import { EventBus } from "../../../../phaser/EventBus";

export function QuizGameWrapper() {
  // Refs để quản lý Phaser instance
  const gameInitialized = useRef(false);
  const globalGameInstance = useRef<Phaser.Game | null>(null);

  // React state
  const [gameState, setGameState] = useState<GameState>("LOADING");
  const [totalCoins, setTotalCoins] = useState(0);
  const [collectedEggs, setCollectedEggs] = useState<any[]>([]);

  // Game container ref
  const gameContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-full h-screen">
      {/* Phaser Canvas Container */}
      <div
        id="game-container"
        ref={gameContainerRef}
        className="absolute inset-0"
      />

      {/* React UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <GameTimerUI timeLeft={quizTimeLeft} />
        <GameCoinUI coinCount={totalCoins} />
        <GameEggUI eggs={collectedEggs} />
      </div>

      {/* Dialogs */}
      {showQuizDialog && (
        <QuizObstacleDialog
          question={currentQuestion}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
}
```

### Key Points:

1. **Container Element**: Phaser cần một DOM element để mount canvas
2. **Refs**: Sử dụng refs để tránh re-render không cần thiết
3. **Overlay UI**: React components nằm trên canvas với `pointer-events-none`
4. **Absolute Positioning**: Canvas và UI overlay đều dùng absolute positioning

---

## 🔄 Lifecycle Management

### 1. Mounting Phaser Game

```typescript
const startGame = useCallback(
  async (mode: GameMode) => {
    // Chỉ khởi tạo 1 lần
    if (!gameInitialized.current) {
      gameInitialized.current = true;

      // Tạo Phaser instance
      globalGameInstance.current = StartGame("game-container");

      // Đợi Phaser sẵn sàng
      EventBus.once("game-ready", () => {
        // Start scene với data
        globalGameInstance.current?.scene.start("GameplayScene", {
          quizData: quizData,
          gameMode: mode,
          user: user,
          savedProgress: savedProgress,
        });
      });
    } else {
      // Restart scene nếu đã khởi tạo
      globalGameInstance.current?.scene.start("GameplayScene", {
        quizData: quizData,
        gameMode: mode,
        user: user,
      });
    }
  },
  [quizData, user, savedProgress]
);
```

### 2. Unmounting Phaser Game

```typescript
useEffect(() => {
  return () => {
    // Cleanup khi component unmount
    if (globalGameInstance.current) {
      console.log("🧹 Cleaning up Phaser game instance");
      globalGameInstance.current.destroy(true);
      globalGameInstance.current = null;
      gameInitialized.current = false;
    }
  };
}, []);
```

### 3. Auto-start Game

```typescript
useEffect(() => {
  // Chỉ start khi data đã load xong
  if (isLoadingProgress) return;

  // Ưu tiên 1: Khôi phục từ saved progress
  if (savedProgress) {
    startGame(savedProgress.gameMode);
    return;
  }

  // Ưu tiên 2: Xác định mode từ URL
  if (pathname.includes("quiz-practice")) {
    startGame("practice");
  } else if (pathname.includes("quiz-game")) {
    startGame("assessment");
  }
}, [isLoadingProgress, savedProgress, pathname, startGame]);
```

### Lifecycle Diagram

```
Component Mount
    ↓
Load Quiz Data
    ↓
Load Saved Progress (if exists)
    ↓
Initialize Phaser (once)
    ↓
Wait for "game-ready" event
    ↓
Start GameplayScene with data
    ↓
Setup Event Listeners
    ↓
Game Running
    ↓
Component Unmount
    ↓
Cleanup Event Listeners
    ↓
Destroy Phaser Instance
```

---

## 📡 Event Communication

### Phaser → React Events

#### 1. Request Quiz

```typescript
// Phaser emits
EventBus.emit("request-quiz", {
  gateIndex: this.currentGateIndex,
  question: currentQuestion,
  position: { x: gate.x, y: gate.y },
});

// React listens
useEffect(() => {
  const handleRequestQuiz = (data: {
    gateIndex: number;
    question: Question;
    position: { x: number; y: number };
  }) => {
    setCurrentQuestion(data.question);
    setCurrentGateIndex(data.gateIndex);
    setShowQuizDialog(true);

    // Pause game
    setGameState("PAUSED");
  };

  EventBus.on("request-quiz", handleRequestQuiz);

  return () => {
    EventBus.off("request-quiz", handleRequestQuiz);
  };
}, []);
```

#### 2. Coin Collected

```typescript
// Phaser emits
EventBus.emit("coin-collected", {
  newCoinCount: this.totalCoinValue,
  coinValue: coinValue,
  position: { x: coin.x, y: coin.y },
});

// React listens
useEffect(() => {
  const handleCoinCollected = (data: {
    newCoinCount: number;
    coinValue: number;
  }) => {
    setTotalCoins(data.newCoinCount);

    // Show animation
    toast.success(`+${data.coinValue} coins!`);
  };

  EventBus.on("coin-collected", handleCoinCollected);

  return () => {
    EventBus.off("coin-collected", handleCoinCollected);
  };
}, []);
```

#### 3. Checkpoint Reached

```typescript
// Phaser emits
EventBus.emit("checkpoint-reached", {
  gateIndex: checkpointGateIndex,
  position: { x: respawnX, y: respawnY },
});

// React listens
useEffect(() => {
  const handleCheckpoint = async (data: { gateIndex: number }) => {
    // Auto-save progress
    await saveProgress({
      currentGateIndex: data.gateIndex,
      totalCoins: totalCoins,
      collectedEggs: collectedEggs,
    });

    toast.success("Progress saved!");
  };

  EventBus.on("checkpoint-reached", handleCheckpoint);

  return () => {
    EventBus.off("checkpoint-reached", handleCheckpoint);
  };
}, [totalCoins, collectedEggs]);
```

#### 4. Game Completed

```typescript
// Phaser emits
EventBus.emit("game-completed", {
  totalCoins: this.totalCoinValue,
  collectedEggs: this.collectedEggData,
  completionTime: elapsedTime,
});

// React listens
useEffect(() => {
  const handleGameCompleted = async (data: {
    totalCoins: number;
    collectedEggs: any[];
    completionTime: number;
  }) => {
    setGameState("COMPLETED");
    setCompletionReason("finished");

    // Submit results
    await submitResults({
      quizId: quizData.quiz_id,
      coins: data.totalCoins,
      eggs: data.collectedEggs,
      time: data.completionTime,
    });

    // Show results screen
    setShowResultsDialog(true);
  };

  EventBus.on("game-completed", handleGameCompleted);

  return () => {
    EventBus.off("game-completed", handleGameCompleted);
  };
}, [quizData]);
```

### React → Phaser Events

#### 1. Quiz Answer Result

```typescript
// React emits
const handleAnswer = (selectedAnswer: string) => {
  const isCorrect = selectedAnswer === currentQuestion.correct_answer;

  EventBus.emit("quiz-result", {
    correct: isCorrect,
    timeLeft: quizTimeLeft,
    selectedAnswer: selectedAnswer,
    gateIndex: currentGateIndex,
  });

  setShowQuizDialog(false);
  setGameState("PLAYING");
};

// Phaser listens
EventBus.on(
  "quiz-result",
  (data: { correct: boolean; timeLeft: number; selectedAnswer: string }) => {
    this.lastQuizResult = data.correct;

    if (data.correct) {
      // Continue game
      this.gameState = "RUNNING";
      this.player.resumeAutoRun();
    } else {
      // Respawn at checkpoint
      this.respawnPlayer();
    }
  }
);
```

#### 2. Time Up (Assessment Mode)

```typescript
// React emits
useEffect(() => {
  if (gameState === "PLAYING" && gameMode === "assessment") {
    if (quizTimeLeft <= 0) {
      EventBus.emit("time-up");
      setGameState("COMPLETED");
      setCompletionReason("time-up");
    }
  }
}, [quizTimeLeft, gameState, gameMode]);

// Phaser listens
EventBus.on("time-up", () => {
  this.gameState = "GAME_OVER";
  this.player.stopAutoRun();

  // Show time up animation
  this.showTimeUpEffect();
});
```

#### 3. Add Dynamic Question

```typescript
// React emits (khi cần thêm câu hỏi mới)
EventBus.emit("add-dynamic-question", {
  question: newQuestion,
  difficulty: "medium",
});

// Phaser listens
EventBus.on(
  "add-dynamic-question",
  (data: { question: Question; difficulty: string }) => {
    // Thêm câu hỏi vào danh sách
    this.activeQuestions.push(data.question);

    // Tạo chunk mới cho câu hỏi
    const newChunk = this.mapGenerator.createChunk(data.difficulty);

    // Spawn quiz gate mới
    this.spawnQuizGate(newChunk.endX, data.question);
  }
);
```

### Event Communication Best Practices

#### 1. Use TypeScript Interfaces

```typescript
// Define event data types
interface QuizRequestEvent {
  gateIndex: number;
  question: Question;
  position: { x: number; y: number };
}

interface QuizResultEvent {
  correct: boolean;
  timeLeft: number;
  selectedAnswer: string;
  gateIndex: number;
}

// Type-safe event handling
EventBus.on("request-quiz", (data: QuizRequestEvent) => {
  // TypeScript knows the shape of data
});
```

#### 2. Centralize Event Names

```typescript
// constants/events.ts
export const GAME_EVENTS = {
  GAME_READY: "game-ready",
  REQUEST_QUIZ: "request-quiz",
  QUIZ_RESULT: "quiz-result",
  COIN_COLLECTED: "coin-collected",
  EGG_COLLECTED: "egg-collected",
  CHECKPOINT_REACHED: "checkpoint-reached",
  GAME_COMPLETED: "game-completed",
  TIME_UP: "time-up",
  SAVE_PROGRESS: "save-progress",
} as const;

// Usage
EventBus.emit(GAME_EVENTS.COIN_COLLECTED, data);
```

#### 3. Error Handling

```typescript
useEffect(() => {
  const handleEvent = (data: any) => {
    try {
      // Process event
      processData(data);
    } catch (error) {
      console.error("Error handling event:", error);
      // Fallback behavior
      showErrorToast("Something went wrong");
    }
  };

  EventBus.on("event-name", handleEvent);

  return () => {
    EventBus.off("event-name", handleEvent);
  };
}, []);
```

---

## 🔄 State Synchronization

### Problem: Stale Closures

```typescript
// ❌ BAD: State trong closure có thể stale
const [gameMode, setGameMode] = useState("practice");

useEffect(() => {
  EventBus.on("some-event", () => {
    console.log(gameMode); // Có thể là giá trị cũ!
  });
}, []); // Empty deps = closure captures initial value
```

### Solution 1: Use Refs

```typescript
// ✅ GOOD: Ref luôn có giá trị mới nhất
const [gameMode, setGameMode] = useState("practice");
const gameModeRef = useRef(gameMode);

// Sync ref với state
useEffect(() => {
  gameModeRef.current = gameMode;
}, [gameMode]);

useEffect(() => {
  EventBus.on("some-event", () => {
    console.log(gameModeRef.current); // Luôn đúng!
  });
}, []);
```

### Solution 2: Include Dependencies

```typescript
// ✅ GOOD: Re-register listener khi state thay đổi
const [gameMode, setGameMode] = useState("practice");

useEffect(() => {
  const handler = () => {
    console.log(gameMode); // Luôn đúng!
  };

  EventBus.on("some-event", handler);

  return () => {
    EventBus.off("some-event", handler);
  };
}, [gameMode]); // Re-run khi gameMode thay đổi
```

### Syncing Complex State

```typescript
// State cần sync với Phaser
const [gameProgress, setGameProgress] = useState<GameProgress>({
  currentGateIndex: 0,
  totalCoins: 0,
  collectedEggs: [],
  answeredQuestions: [],
});

// Ref để Phaser access
const gameProgressRef = useRef(gameProgress);

// Sync ref
useEffect(() => {
  gameProgressRef.current = gameProgress;
}, [gameProgress]);

// Listen to Phaser updates
useEffect(() => {
  const handleProgressUpdate = (data: Partial<GameProgress>) => {
    setGameProgress((prev) => ({
      ...prev,
      ...data,
    }));
  };

  EventBus.on("save-progress", handleProgressUpdate);

  return () => {
    EventBus.off("save-progress", handleProgressUpdate);
  };
}, []);
```

---

## 🎨 Common Patterns

### Pattern 1: Loading State

```typescript
function QuizGameWrapper() {
  const [isLoading, setIsLoading] = useState(true);
  const [gameReady, setGameReady] = useState(false);

  useEffect(() => {
    // Listen for game ready
    EventBus.once("game-ready", () => {
      setGameReady(true);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <GameUI />;
}
```

### Pattern 2: Conditional Event Handling

```typescript
useEffect(() => {
  // Chỉ handle event khi game đang chạy
  if (gameState !== "PLAYING") return;

  const handler = (data: any) => {
    // Process event
  };

  EventBus.on("event-name", handler);

  return () => {
    EventBus.off("event-name", handler);
  };
}, [gameState]);
```

### Pattern 3: Debounced Auto-save

```typescript
const saveProgress = useMemo(
  () =>
    debounce(async (progress: GameProgress) => {
      try {
        await api.saveGameProgress(progress);
        toast.success("Progress saved");
      } catch (error) {
        console.error("Save failed:", error);
      }
    }, 2000), // Save every 2 seconds max
  []
);

useEffect(() => {
  const handler = (data: GameProgress) => {
    saveProgress(data);
  };

  EventBus.on("save-progress", handler);

  return () => {
    EventBus.off("save-progress", handler);
    saveProgress.cancel(); // Cancel pending saves
  };
}, [saveProgress]);
```

### Pattern 4: Modal Dialog with Game Pause

```typescript
function QuizGameWrapper() {
  const [showDialog, setShowDialog] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const openDialog = useCallback(() => {
    setShowDialog(true);
    setIsPaused(true);
    EventBus.emit("pause-game");
  }, []);

  const closeDialog = useCallback(() => {
    setShowDialog(false);
    setIsPaused(false);
    EventBus.emit("resume-game");
  }, []);

  return (
    <>
      <GameCanvas />
      {showDialog && (
        <Dialog onClose={closeDialog}>
          <DialogContent />
        </Dialog>
      )}
    </>
  );
}
```

### Pattern 5: Multi-step Game Flow

```typescript
type GameFlow = "INTRO" | "PLAYING" | "QUIZ" | "RESULTS";

function QuizGameWrapper() {
  const [flow, setFlow] = useState<GameFlow>("INTRO");

  useEffect(() => {
    const handlers = {
      "game-started": () => setFlow("PLAYING"),
      "request-quiz": () => setFlow("QUIZ"),
      "quiz-answered": () => setFlow("PLAYING"),
      "game-completed": () => setFlow("RESULTS"),
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      EventBus.on(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        EventBus.off(event, handler);
      });
    };
  }, []);

  return (
    <>
      {flow === "INTRO" && <IntroScreen />}
      {flow === "PLAYING" && <GameCanvas />}
      {flow === "QUIZ" && <QuizDialog />}
      {flow === "RESULTS" && <ResultsScreen />}
    </>
  );
}
```

---

## 🐛 Troubleshooting

### Issue 1: Canvas Not Rendering

**Symptoms:**

- Phaser game không hiển thị
- Console không có lỗi

**Solutions:**

```typescript
// 1. Đảm bảo container element tồn tại
useEffect(() => {
  const container = document.getElementById("game-container");
  if (!container) {
    console.error("Game container not found!");
    return;
  }

  // Initialize game
  const game = StartGame("game-container");
}, []);

// 2. Đảm bảo container có kích thước
<div
  id="game-container"
  className="w-full h-screen" // Must have width & height
/>

// 3. Check z-index conflicts
<div
  id="game-container"
  style={{ zIndex: 0 }} // Canvas should be behind UI
/>
```

### Issue 2: Events Not Firing

**Symptoms:**

- EventBus.emit() không trigger listeners
- Listeners không được gọi

**Solutions:**

```typescript
// 1. Đảm bảo listener được register trước khi emit
useEffect(() => {
  // Register BEFORE game starts
  EventBus.on("event-name", handler);

  // Then start game
  startGame();

  return () => {
    EventBus.off("event-name", handler);
  };
}, []);

// 2. Check event name spelling
const EVENT_NAME = "coin-collected"; // Use constant
EventBus.emit(EVENT_NAME, data);
EventBus.on(EVENT_NAME, handler);

// 3. Verify cleanup
useEffect(() => {
  const handler = () => {
    /* ... */
  };
  EventBus.on("event", handler);

  // MUST cleanup
  return () => {
    EventBus.off("event", handler);
  };
}, []);
```

### Issue 3: Memory Leaks

**Symptoms:**

- Performance degradation over time
- Multiple game instances running

**Solutions:**

```typescript
// 1. Proper cleanup on unmount
useEffect(() => {
  const game = StartGame("game-container");

  return () => {
    game.destroy(true); // Remove canvas
    gameRef.current = null;
  };
}, []);

// 2. Remove all event listeners
useEffect(() => {
  const handlers = {
    event1: handler1,
    event2: handler2,
  };

  Object.entries(handlers).forEach(([event, handler]) => {
    EventBus.on(event, handler);
  });

  return () => {
    Object.entries(handlers).forEach(([event, handler]) => {
      EventBus.off(event, handler);
    });
  };
}, []);

// 3. Cancel pending operations
useEffect(() => {
  const timer = setInterval(() => {
    // Do something
  }, 1000);

  return () => {
    clearInterval(timer);
  };
}, []);
```

### Issue 4: Stale State in Callbacks

**Symptoms:**

- Event handlers có giá trị state cũ
- State updates không reflect trong Phaser

**Solutions:**

```typescript
// Use refs for mutable state
const [count, setCount] = useState(0);
const countRef = useRef(count);

useEffect(() => {
  countRef.current = count;
}, [count]);

useEffect(() => {
  EventBus.on("event", () => {
    console.log(countRef.current); // Always current
  });
}, []); // Empty deps OK
```

### Issue 5: Multiple Game Instances

**Symptoms:**

- Game khởi tạo nhiều lần
- Multiple canvases rendered

**Solutions:**

```typescript
// Use ref to track initialization
const gameInitialized = useRef(false);
const gameInstance = useRef<Phaser.Game | null>(null);

const startGame = useCallback(() => {
  // Only initialize once
  if (!gameInitialized.current) {
    gameInitialized.current = true;
    gameInstance.current = StartGame("game-container");
  }
}, []);

// Cleanup properly
useEffect(() => {
  return () => {
    if (gameInstance.current) {
      gameInstance.current.destroy(true);
      gameInstance.current = null;
      gameInitialized.current = false;
    }
  };
}, []);
```

---

## 📚 Summary

### Key Takeaways:

1. **Separation**: Keep game logic in Phaser, UI logic in React
2. **EventBus**: Use for all communication between React and Phaser
3. **Refs**: Use refs to avoid stale closures
4. **Cleanup**: Always cleanup listeners and destroy game instance
5. **Type Safety**: Use TypeScript interfaces for event data
6. **Error Handling**: Wrap event handlers in try-catch
7. **Performance**: Debounce frequent operations like auto-save

### Checklist for Integration:

- [ ] Game container has proper dimensions
- [ ] Phaser instance stored in ref
- [ ] Event listeners registered before game starts
- [ ] All listeners cleaned up on unmount
- [ ] Game instance destroyed on unmount
- [ ] Refs used for mutable state in callbacks
- [ ] Event names centralized in constants
- [ ] TypeScript interfaces for event data
- [ ] Error boundaries around game component
- [ ] Loading states handled properly

---

## 🎯 Next Steps

1. Read [PHASER_ARCHITECTURE.md](./PHASER_ARCHITECTURE.md) for game internals
2. Check [GAME.md](./GAME.md) for game mechanics
3. Review [API_ACTUALLY_USED.md](./API_ACTUALLY_USED.md) for backend integration
