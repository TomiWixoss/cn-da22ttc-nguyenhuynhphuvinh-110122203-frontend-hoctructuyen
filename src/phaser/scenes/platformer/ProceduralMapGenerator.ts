// frontend/phaser/scenes/platformer/ProceduralMapGenerator.ts

import { Scene } from "phaser";
import { SeededRandom, SeedGenerator } from "../../utils/SeededRandom";
import { COIN_VALUES } from "../../config/constants"; // <- THÊM IMPORT MỚI
import {
  EGG_TYPES,
  SPAWNABLE_EGG_IDS,
  GOLDEN_EGG_CHANCE,
} from "@/lib/services/game/game-rewards.config"; // THÊM IMPORT CHO TRỨNG

// THAY ĐỔI 1: Cập nhật interface để khớp với cấu trúc JSON thật
interface QuizQuestionData {
  level: {
    name: string; // Ví dụ: "Dễ", "Trung bình", "Khó"
  };
}

// THAY ĐỔI 1: Cập nhật interface QuizGate để chứa các vùng vật lý
export interface QuizGate {
  id: number;
  chunkStartX: number;
  triggerZone: Phaser.GameObjects.Zone;
  passZone: Phaser.GameObjects.Zone; // THÊM MỚI
  failZone: Phaser.GameObjects.Zone; // THÊM MỚI
}

export interface PlayerStartPoint {
  x: number;
  y: number;
}

export interface GenerationResult {
  quizGates: QuizGate[];
  startPoint: { x: number; y: number } | null;
  interactiveZones: Phaser.GameObjects.Zone[];
  coinsGroup: Phaser.Physics.Arcade.StaticGroup; // <- THAY ĐỔI TỪ Group SANG StaticGroup
  eggsGroup: Phaser.Physics.Arcade.StaticGroup; // THÊM DÒNG NÀY
}

export class ProceduralMapGenerator {
  private scene: Scene;
  private currentX: number = 0;
  private quizGateIdCounter = 0;
  private allLayers: Phaser.Tilemaps.TilemapLayer[] = [];
  private playerStartPoint: PlayerStartPoint | null = null;
  // THAY ĐỔI 1: Thêm thuộc tính để lưu vạch đích
  private finishZone?: Phaser.GameObjects.Zone;

  // THÊM MỚI: SeededRandom để đảm bảo tính nhất quán
  private seededRandom?: SeededRandom;
  private shuffledChunkPools: {
    easy: string[];
    medium: string[];
    hard: string[];
  } = { easy: [], medium: [], hard: [] };
  private chunkPoolIndexes = { easy: 0, medium: 0, hard: 0 };

  private readonly CHUNK_POOL = {
    easy: ["easy_1", "easy_2", "easy_3", "easy_4"],
    medium: ["medium_1", "medium_2", "medium_3"],
    hard: ["hard_1", "hard_2", "hard_3"],
  };

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * 🎲 KHỞI TẠO SEEDED RANDOM - Thiết lập trình sinh số ngẫu nhiên với seed từ câu hỏi
   */
  public initializeWithQuestions(questions: QuizQuestionData[]): void {
    // Tạo seed từ câu hỏi để đảm bảo map giống nhau cho cùng bộ câu hỏi
    const quizSeed = SeedGenerator.createQuizSeed(questions);
    this.seededRandom = new SeededRandom(quizSeed);

    // Xáo trộn tất cả pools một lần duy nhất với seed
    this.shuffledChunkPools = {
      easy: this.seededRandom.shuffle([...this.CHUNK_POOL.easy]),
      medium: this.seededRandom.shuffle([...this.CHUNK_POOL.medium]),
      hard: this.seededRandom.shuffle([...this.CHUNK_POOL.hard]),
    };

    // Reset index counters
    this.chunkPoolIndexes = { easy: 0, medium: 0, hard: 0 };

    console.log("🎲 Initialized ProceduralMapGenerator with seeded pools:");
    console.log("Easy chunks:", this.shuffledChunkPools.easy);
    console.log("Medium chunks:", this.shuffledChunkPools.medium);
    console.log("Hard chunks:", this.shuffledChunkPools.hard);
  }

  // =======================================================================
  // CẬP NHẬT: Logic mới với SeededRandom để đảm bảo không trùng lặp
  // =======================================================================
  public createChunkSequenceFromQuestions(
    questions: QuizQuestionData[],
    options?: { debugChunkName?: string | null }
  ): string[] {
    console.log(
      `🧠 Generating chunk sequence for ${questions.length} questions.`
    );

    // Khởi tạo SeededRandom nếu chưa có
    if (!this.seededRandom) {
      this.initializeWithQuestions(questions);
    }

    const sequence: string[] = [];

    // Hàm nội bộ để chuyển đổi độ khó từ tiếng Việt sang key tiếng Anh
    const mapDifficultyToKey = (
      vietnameseDifficulty: string
    ): "easy" | "medium" | "hard" => {
      switch (vietnameseDifficulty.toLowerCase()) {
        case "dễ":
          return "easy";
        case "trung bình":
          return "medium";
        case "khó":
          return "hard";
        default:
          console.warn(
            `Unknown difficulty: "${vietnameseDifficulty}". Defaulting to easy.`
          );
          return "easy";
      }
    };

    for (const question of questions) {
      // Đọc độ khó từ đúng vị trí: question.level.name
      const vietnameseDifficulty = question?.level?.name || "Dễ";

      // Chuyển đổi sang key tiếng Anh
      const difficultyKey = mapDifficultyToKey(vietnameseDifficulty);

      // Lấy chunk theo thứ tự từ pool đã xáo trộn (không trùng lặp)
      const chunkName = this.getNextChunkFromShuffledPool(difficultyKey);
      sequence.push(chunkName);
    }

    // Logic debug
    if (options?.debugChunkName) {
      console.warn(
        `[DEBUG OVERRIDE] Prepending chunk: "${options.debugChunkName}" to sequence.`
      );
      // Lọc bỏ chunk debug ra khỏi sequence gốc (nếu có) để tránh trùng lặp
      const filteredSequence = sequence.filter(
        (chunk) => chunk !== options.debugChunkName
      );
      // Đặt chunk debug lên đầu
      return [options.debugChunkName, ...filteredSequence];
    }

    console.log(
      "✅ Generated Chunk Sequence from Questions (Seeded):",
      sequence
    );
    return sequence;
  }

  /**
   * 🎯 LẤY CHUNK TIẾP THEO - Lấy chunk theo thứ tự từ pool đã xáo trộn
   */
  private getNextChunkFromShuffledPool(
    difficulty: "easy" | "medium" | "hard"
  ): string {
    const pool = this.shuffledChunkPools[difficulty];
    const currentIndex = this.chunkPoolIndexes[difficulty];

    if (pool.length === 0) {
      console.warn(
        `⚠️ Empty pool for difficulty: ${difficulty}. Using fallback.`
      );
      return this.CHUNK_POOL.easy[0];
    }

    // Lấy chunk theo thứ tự, nếu hết thì quay lại từ đầu
    const chunkName = pool[currentIndex % pool.length];
    this.chunkPoolIndexes[difficulty] = currentIndex + 1;

    console.log(
      `🎯 Selected chunk "${chunkName}" from ${difficulty} pool (index: ${currentIndex})`
    );
    return chunkName;
  }

  // THAY ĐỔI 2: Cập nhật để sử dụng SeededRandom thay vì Math.random()
  public getRandomChunkName(difficulty: "easy" | "medium" | "hard"): string {
    const pool = this.CHUNK_POOL[difficulty];
    if (pool && pool.length > 0) {
      if (this.seededRandom) {
        return this.seededRandom.randomChoice(pool);
      } else {
        // Fallback cho trường hợp chưa khởi tạo SeededRandom
        return pool[Math.floor(Math.random() * pool.length)];
      }
    }
    // Fallback
    return this.CHUNK_POOL.easy[0];
  }

  // Hàm helper để xáo trộn mảng - CẬP NHẬT: Sử dụng SeededRandom
  private shuffleArray<T>(array: T[]): T[] {
    if (this.seededRandom) {
      return this.seededRandom.shuffle(array);
    } else {
      // Fallback sử dụng Fisher-Yates shuffle với Math.random()
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }
  }

  // Hàm cũ này vẫn giữ lại để có thể dùng cho chế độ luyện tập không có quiz
  public createRandomChunkSequence(options?: {
    debugChunkName?: string | null;
  }): string[] {
    const easyChunks = this.shuffleArray([...this.CHUNK_POOL.easy]);
    const mediumChunks = this.shuffleArray([...this.CHUNK_POOL.medium]);
    const hardChunks = this.shuffleArray([...this.CHUNK_POOL.hard]);

    const fullSequence = [...easyChunks, ...mediumChunks, ...hardChunks];

    // Logic debug tương tự
    if (options?.debugChunkName) {
      console.warn(
        `[DEBUG OVERRIDE] Prepending chunk: "${options.debugChunkName}" to random sequence.`
      );
      const filteredSequence = fullSequence.filter(
        (chunk) => chunk !== options.debugChunkName
      );
      return [options.debugChunkName, ...filteredSequence];
    }

    console.log("Generated Legacy Random Chunk Sequence:", fullSequence);
    return fullSequence;
  }

  // ... (Tất cả các hàm bên dưới giữ nguyên, không cần thay đổi)
  // ...

  public getAllLayers(): Phaser.Tilemaps.TilemapLayer[] {
    return this.allLayers;
  }

  /**
   * Thiết lập va chạm cho các tile nguy hiểm (hazard).
   * Hàm này sẽ duyệt qua tất cả các layer, tìm các tile có thuộc tính 'hazard'
   * và gắn một callback va chạm cho chúng.
   * @param layers - Mảng các layer cần kiểm tra.
   * @param onHazardContact - Hàm sẽ được gọi khi người chơi chạm vào tile nguy hiểm.
   */
  public setHazardCollision(
    layers: Phaser.Tilemaps.TilemapLayer[],
    onHazardContact: (player: any, tile: any) => void
  ): void {
    console.log("🔥 Setting up hazard tile collisions...");
    layers.forEach((layer) => {
      // Lấy danh sách ID của tất cả các tile trong tileset có thuộc tính 'hazard'
      const hazardTileIndexes: number[] = [];
      layer.tilemap.tilesets.forEach((tileset) => {
        // Kiểm tra xem tileset có tileProperties và không rỗng không
        if (
          !tileset.tileProperties ||
          typeof tileset.tileProperties !== "object"
        ) {
          return; // Bỏ qua tileset này nếu không có properties
        }

        // Cast tileset.tileProperties thành kiểu an toàn
        const tileProps = tileset.tileProperties as {
          [key: number]: { [key: string]: any };
        };

        // tileset.tileProperties là một đối tượng nơi key là (tile_id - firstgid)
        // và value là object chứa custom properties.
        Object.keys(tileProps).forEach((tileId) => {
          const tileIdNum = parseInt(tileId);
          const properties = tileProps[tileIdNum];
          if (properties && properties.behavior === "hazard") {
            // Cần cộng thêm firstgid để có được index chính xác trên toàn map
            hazardTileIndexes.push(tileIdNum + tileset.firstgid);
          }
        });
      });

      if (hazardTileIndexes.length > 0) {
        console.log(
          `Found ${hazardTileIndexes.length} hazard tile types in layer "${layer.layer.name}".`
        );
        // setTileIndexCallback là hàm của Phaser để xử lý va chạm với các loại tile cụ thể
        layer.setTileIndexCallback(
          hazardTileIndexes, // Mảng các ID của tile gai
          onHazardContact, // Hàm callback để gọi khi va chạm
          this.scene // Context
        );
      }
    });
  }

  // THÊM MỘT HÀM HELPER ĐỂ XÁC ĐỊNH ĐỘ KHÓ TỪ TÊN CHUNK
  private getDifficultyFromChunkName(
    chunkName: string
  ): keyof typeof COIN_VALUES {
    if (chunkName.startsWith("easy")) return "easy";
    if (chunkName.startsWith("medium")) return "medium";
    if (chunkName.startsWith("hard")) return "hard";
    return "easy"; // Mặc định là easy nếu không xác định được
  }

  // THÊM MỘT HÀM MỚI ĐỂ XỬ LÝ VIỆC TẠO XU
  private createCoinsForChunk(
    objects: Phaser.Types.Tilemaps.TiledObject[],
    coinsGroup: Phaser.Physics.Arcade.StaticGroup,
    offsetX: number,
    chunkName: string,
    collectedCoins: Set<string>, // Nhận vào danh sách các xu đã nhặt
    instanceIndex: number = 0 // <-- THÊM THAM SỐ MỚI với giá trị mặc định
  ): void {
    const coinSpawns = objects.filter((obj) => obj.name === "coin_spawn");
    const difficulty = this.getDifficultyFromChunkName(chunkName);
    const value = COIN_VALUES[difficulty]; // Lấy giá trị xu từ hằng số

    coinSpawns.forEach((spawn, index) => {
      // =======================================================================
      // === THAY ĐỔI QUAN TRỌNG NHẤT NẰM Ở ĐÂY ===
      // =======================================================================
      // Thêm instanceIndex vào ID để đảm bảo nó là duy nhất
      const coinId = `${chunkName}_${instanceIndex}_${spawn.id}`;
      // =======================================================================

      // Chỉ tạo xu nếu ID của nó không nằm trong danh sách đã thu thập
      if (!collectedCoins.has(coinId)) {
        const coinX = (spawn.x || 0) + offsetX;
        const coinY = spawn.y || 0;
        const coin = coinsGroup.create(coinX, coinY, "coin");
        coin.setData("coinId", coinId); // Gán ID vào sprite để nhận dạng khi va chạm
        coin.setData("coinValue", value); // <- GÁN GIÁ TRỊ VÀO SPRITE

        // Thêm hiệu ứng lơ lửng nhẹ nhàng cho xu
        this.scene.tweens.add({
          targets: coin,
          y: coinY - 8,
          duration: 1500,
          ease: "Sine.easeInOut",
          yoyo: true,
          repeat: -1,
        });
      }
    });
  }

  // THÊM HÀM MỚI ĐỂ TẠO TRỨNG
  private createEggsForChunk(
    objects: Phaser.Types.Tilemaps.TiledObject[],
    eggsGroup: Phaser.Physics.Arcade.StaticGroup,
    offsetX: number,
    chunkName: string,
    collectedEggs: Set<string>,
    instanceIndex: number = 0
  ): void {
    const eggSpawns = objects.filter((obj) => obj.name === "egg_spawn");

    eggSpawns.forEach((spawn, index) => {
      const eggId = `${chunkName}_${instanceIndex}_egg_${spawn.id}`;

      if (!collectedEggs.has(eggId)) {
        // Logic random loại trứng
        const randomEggIndex = Math.floor(
          Math.random() * SPAWNABLE_EGG_IDS.length
        );
        const randomEggId = SPAWNABLE_EGG_IDS[randomEggIndex];
        let eggData = EGG_TYPES[randomEggId];

        // Logic random trứng vàng
        let isGolden = Math.random() < GOLDEN_EGG_CHANCE;

        // =======================================================================
        // === THAY ĐỔI QUAN TRỌNG NHẤT NẰM Ở ĐÂY ===
        // =======================================================================
        // Đảm bảo Trứng Cầu Vồng (RAINBOW) không bao giờ là vàng
        if (randomEggId === 'RAINBOW') {
          isGolden = false;
        }
        // =======================================================================

        // --- THAY ĐỔI BẮT ĐẦU TỪ ĐÂY ---
        // 1. Chọn đúng key ảnh để tạo sprite trong Phaser
        const spriteKey =
          isGolden && eggData.goldenImagePath !== eggData.imagePath
            ? `${eggData.id}_GOLDEN`
            : eggData.id;

        // --- THAY ĐỔI DUY NHẤT NẰM Ở ĐÂY ---
        // Lấy trực tiếp tọa độ của point, không cần cộng thêm width/2 và height/2
        const eggX = (spawn.x || 0) + offsetX;
        const eggY = spawn.y || 0;
        // --- KẾT THÚC THAY ĐỔI ---

        // 2. Tạo sprite với key đã chọn
        const eggSprite = eggsGroup.create(eggX, eggY, spriteKey);

        // 3. XÓA BỎ DÒNG setTint() VÌ KHÔNG CẦN NỮA
        // eggSprite.setTint(0xFFD700); // <-- XÓA DÒNG NÀY

        // 4. Lưu dữ liệu đầy đủ (bao gồm cả 2 đường dẫn ảnh) cho React sử dụng
        eggSprite.setData("eggData", { ...eggData, isGolden });

        // --- KẾT THÚC THAY ĐỔI ---

        eggSprite.setData("eggId", eggId);

        // Hiệu ứng lơ lửng
        this.scene.tweens.add({
          targets: eggSprite,
          y: eggY - 8,
          duration: 1800,
          ease: "Sine.easeInOut",
          yoyo: true,
          repeat: -1,
        });
      }
    });
  }

  public getPlayerStartPoint(): PlayerStartPoint | null {
    return this.playerStartPoint;
  }

  private findPlayerStartPoint(
    objects: Phaser.Types.Tilemaps.TiledObject[],
    offsetX: number,
    offsetY: number
  ): PlayerStartPoint | null {
    const playerStartObj = objects.find((obj) => obj.name === "player_start");

    if (!playerStartObj) return null;

    return {
      x: (playerStartObj.x || 0) + offsetX,
      y: (playerStartObj.y || 0) + offsetY,
    };
  }

  public async generateMap(
    chunkNames: string[],
    collectedCoins: Set<string>,
    collectedEggs: Set<string>, // THÊM THAM SỐ NÀY
    gameMode: "practice" | "assessment" // <- THÊM THAM SỐ gameMode
  ): Promise<GenerationResult> {
    // ... reset state ...
    this.currentX = 0;
    this.allLayers = [];
    this.playerStartPoint = null;
    // Reset pools và indexes nếu cần
    this.chunkPoolIndexes = { easy: 0, medium: 0, hard: 0 };

    const allQuizGates: QuizGate[] = [];
    const allInteractiveZones: Phaser.GameObjects.Zone[] = [];
    // Tạo một group để chứa tất cả các đồng xu
    const coinsGroup = this.scene.physics.add.staticGroup();
    const eggsGroup = this.scene.physics.add.staticGroup(); // TẠO GROUP MỚI

    for (let i = 0; i < chunkNames.length; i++) {
      const isLastChunk = i === chunkNames.length - 1;
      const chunkResult = await this.createChunk(
        chunkNames[i],
        i === 0,
        isLastChunk,
        coinsGroup, // <- Truyền group vào
        collectedCoins, // <- Truyền danh sách xu đã nhặt
        eggsGroup, // THÊM THAM SỐ MỚI: Truyền eggsGroup
        collectedEggs, // THÊM THAM SỐ MỚI: Truyền danh sách trứng đã nhặt
        i, // <-- THÊM THAM SỐ MỚI: Truyền chỉ số 'i' vào
        gameMode // <- THAY ĐỔI: Truyền gameMode xuống
      );
      if (chunkResult) {
        if (chunkResult.quizGate) {
          allQuizGates.push(chunkResult.quizGate);
        }
        allInteractiveZones.push(...chunkResult.interactiveZones);
      }
    }

    const totalMapHeight = 1280;
    this.scene.physics.world.setBounds(0, 0, this.currentX, totalMapHeight);
    console.log(
      `🗺️ Seeded Map Generated. Dimensions: ${this.currentX} x ${totalMapHeight}`
    );

    return {
      quizGates: allQuizGates,
      startPoint: this.playerStartPoint,
      interactiveZones: allInteractiveZones,
      coinsGroup, // <- Trả về group
      eggsGroup, // TRẢ VỀ GROUP TRỨNG
    };
  }

  /**
   * 🔄 RESET GENERATOR - Reset trạng thái để tạo map mới
   */
  public resetGenerator(): void {
    this.currentX = 0;
    this.allLayers = [];
    this.playerStartPoint = null;
    this.quizGateIdCounter = 0;
    this.chunkPoolIndexes = { easy: 0, medium: 0, hard: 0 };

    if (this.finishZone) {
      this.finishZone.destroy();
      this.finishZone = undefined;
    }

    // Reset SeededRandom để sử dụng lại với seed mới
    if (this.seededRandom) {
      this.seededRandom.reset();
    }

    console.log("🔄 ProceduralMapGenerator reset");
  }

  // THAY ĐỔI 4: Hàm mới để nối thêm một chunk vào cuối map
  public async appendChunk(chunkName: string): Promise<{
    quizGate: QuizGate | null;
    interactiveZones: Phaser.GameObjects.Zone[];
  } | null> {
    console.log(`➕ Appending new chunk: ${chunkName} at X: ${this.currentX}`);

    // Xóa vạch đích cũ
    if (this.finishZone) {
      this.finishZone.destroy();
    }

    // Tạo chunk mới và đặt nó làm vạch đích mới
    // Không truyền xu/trứng vào chunk mở rộng trong chế độ assessment
    const chunkResult = await this.createChunk(
      chunkName,
      false,
      true,
      undefined,
      undefined,
      undefined, // eggsGroup
      undefined, // collectedEggs
      -1,
      "assessment" // Luôn sử dụng assessment mode cho extended chunks
    );

    // Cập nhật lại ranh giới thế giới
    const totalMapHeight = 1280;
    this.scene.physics.world.setBounds(0, 0, this.currentX, totalMapHeight);
    console.log(
      `🗺️ Map extended. New dimensions: ${this.currentX} x ${totalMapHeight}`
    );

    return chunkResult;
  }

  // THAY ĐỔI 5: Tách logic tạo một chunk ra hàm riêng để tái sử dụng
  private async createChunk(
    chunkName: string,
    isFirstChunk: boolean,
    isLastChunk: boolean,
    coinsGroup?: Phaser.Physics.Arcade.StaticGroup, // <- THAY ĐỔI TỪ Group SANG StaticGroup
    collectedCoins?: Set<string>, // <- Tham số optional
    eggsGroup?: Phaser.Physics.Arcade.StaticGroup, // THÊM THAM SỐ MỚI
    collectedEggs?: Set<string>, // THÊM THAM SỐ MỚI
    instanceIndex: number = 0, // <-- THÊM THAM SỐ MỚI với giá trị mặc định
    gameMode?: "practice" | "assessment" // <- THÊM THAM SỐ gameMode
  ): Promise<{
    quizGate: QuizGate | null;
    interactiveZones: Phaser.GameObjects.Zone[];
  } | null> {
    if (!this.scene.cache.tilemap.has(chunkName)) {
      console.error(`Map chunk "${chunkName}" was not preloaded.`);
      return null;
    }

    const tilemap = this.scene.make.tilemap({ key: chunkName });
    const tileset = tilemap.addTilesetImage(
      "spritesheet-tiles-default",
      "spritesheet-tiles-default",
      64,
      64,
      1,
      2
    );
    if (!tileset) return null;

    // Tạo layers bằng cách thông thường
    tilemap.layers.forEach((layerData) => {
      if (
        layerData.name.toLowerCase() !== "scripts" &&
        layerData.name.toLowerCase() !== "objects"
      ) {
        const layer = tilemap.createLayer(
          layerData.name,
          tileset,
          this.currentX,
          0
        );
        if (layer) {
          layer.setCollisionByProperty({ collides: true });
          this.allLayers.push(layer);
        }
      }
    });

    // Thiết lập animated tiles cho chunk này
    this.setupAnimatedTilesForChunk(chunkName, tilemap, tileset, this.currentX);

    const objectLayer = tilemap.getObjectLayer("Objects");
    if (objectLayer) {
      if (isFirstChunk) {
        const startObj = objectLayer.objects.find(
          (obj) => obj.name === "player_start"
        );
        if (startObj)
          this.playerStartPoint = {
            x: (startObj.x || 0) + this.currentX,
            y: startObj.y || 0,
          };
      }
      if (isLastChunk) {
        const endObj = objectLayer.objects.find((obj) => obj.name === "end");
        if (endObj) {
          this.finishZone = this.scene.add.zone(
            endObj.x! + this.currentX + (endObj.width || 0) / 2,
            endObj.y! + (endObj.height || 0) / 2,
            endObj.width || 0,
            endObj.height || 0
          );
          this.scene.physics.world.enable(this.finishZone);
          (this.finishZone.body as Phaser.Physics.Arcade.Body).setAllowGravity(
            false
          );
          this.finishZone.setData("isFinishZone", true);
        }
      }
    }

    let quizGate: QuizGate | null = null;
    const interactiveZones: Phaser.GameObjects.Zone[] = [];
    const scriptLayer = tilemap.getObjectLayer("Scripts");
    if (scriptLayer) {
      const parsedObjects = this.parseScriptObjects(
        scriptLayer.objects,
        this.currentX,
        0
      );
      quizGate = parsedObjects.quizGate;
      interactiveZones.push(...parsedObjects.interactiveZones);
    }

    // =======================================================================
    // === THAY ĐỔI QUAN TRỌNG NẰM Ở ĐÂY ===
    // =======================================================================
    // Chỉ tạo xu và trứng nếu đang ở chế độ 'practice'
    if (gameMode === "practice") {
      // THÊM LOGIC TẠO XU
      if (objectLayer && coinsGroup && collectedCoins) {
        this.createCoinsForChunk(
          objectLayer.objects,
          coinsGroup,
          this.currentX,
          chunkName,
          collectedCoins,
          instanceIndex // <-- TRUYỀN CHỈ SỐ XUỐNG TIẾP
        );
      }

      // THÊM LOGIC TẠO TRỨNG VÀO ĐÂY
      if (objectLayer && eggsGroup && collectedEggs) {
        this.createEggsForChunk(
          objectLayer.objects,
          eggsGroup,
          this.currentX,
          chunkName,
          collectedEggs,
          instanceIndex
        );
      }
    }
    // =======================================================================

    this.currentX += tilemap.widthInPixels;
    return { quizGate, interactiveZones };
  }

  // THAY ĐỔI 2: Cập nhật logic `parseScriptObjects` để tạo ra các Zone vật lý
  private parseScriptObjects(
    objects: Phaser.Types.Tilemaps.TiledObject[],
    offsetX: number,
    offsetY: number
  ): {
    quizGate: QuizGate | null;
    interactiveZones: Phaser.GameObjects.Zone[];
  } {
    const triggerObj = objects.find((obj) => obj.name === "quiz_trigger");
    const passZoneObj = objects.find((obj) => obj.name === "pass_zone");
    const failZoneObj = objects.find((obj) => obj.name === "fail_zone");
    const jumpPadObjs = objects.filter((obj) => obj.name === "jump_pad");

    let quizGate: QuizGate | null = null;
    const interactiveZones: Phaser.GameObjects.Zone[] = [];

    const createPhysicsZone = (
      obj: Phaser.Types.Tilemaps.TiledObject,
      isActive: boolean
    ): Phaser.GameObjects.Zone => {
      const zone = this.scene.add.zone(
        (obj.x || 0) + offsetX + (obj.width || 0) / 2,
        (obj.y || 0) + offsetY + (obj.height || 0) / 2,
        obj.width || 0,
        obj.height || 0
      );
      this.scene.physics.world.enable(zone);
      const body = zone.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      body.moves = false;

      const props = this.getTiledProperties(obj);
      zone.setData("jumpForceX", parseFloat(props.jumpForceX) || 0);
      zone.setData("jumpForceY", parseFloat(props.jumpForceY) || 0);

      if (obj.name === "pass_zone") {
        zone.setData("isPassZone", true);
      } else {
        zone.setData("isPassZone", false);
      }

      zone.setActive(isActive).setVisible(isActive);
      return zone;
    };

    if (triggerObj && passZoneObj && failZoneObj) {
      const triggerX = (triggerObj.x || 0) + offsetX;
      const triggerY = (triggerObj.y || 0) + offsetY;
      const triggerZone = this.scene.add.zone(
        triggerX + (triggerObj.width || 0) / 2,
        triggerY + (triggerObj.height || 0) / 2,
        triggerObj.width || 0,
        triggerObj.height || 0
      );
      this.scene.physics.world.enable(triggerZone);
      const triggerBody = triggerZone.body as Phaser.Physics.Arcade.Body;
      triggerBody.setAllowGravity(false);
      triggerBody.moves = false;

      // =======================================================================
      // === THÊM DÒNG NÀY ĐỂ GẮN ID VÀO TRIGGER ZONE ===
      // =======================================================================
      triggerZone.setData("gateId", this.quizGateIdCounter);
      // =======================================================================

      const passZone = createPhysicsZone(passZoneObj, false);
      const failZone = createPhysicsZone(failZoneObj, false);

      quizGate = {
        id: this.quizGateIdCounter++,
        chunkStartX: offsetX,
        triggerZone,
        passZone,
        failZone,
      };
    }

    for (const jumpPadObj of jumpPadObjs) {
      const jumpPadZone = createPhysicsZone(jumpPadObj, true);
      interactiveZones.push(jumpPadZone);
    }

    return { quizGate, interactiveZones };
  }


  /**
   * Thiết lập animated tiles cho một chunk cụ thể
   */
  private setupAnimatedTilesForChunk(
    chunkName: string,
    tilemap: Phaser.Tilemaps.Tilemap,
    tileset: Phaser.Tilemaps.Tileset,
    offsetX: number
  ): void {
    console.log(
      `🎬 Setting up animations for chunk '${chunkName}' at X: ${offsetX}`
    );

    // Xử lý animation trực tiếp trên tilemap
    this.processAnimationsForTilemap(tilemap, tileset, offsetX);
  }

  /**
   * Xử lý animations cho tilemap sử dụng PlatformerWorldBuilder logic
   */
  private processAnimationsForTilemap(
    tilemap: Phaser.Tilemaps.Tilemap,
    tileset: Phaser.Tilemaps.Tileset,
    offsetX: number
  ): void {
    // Sử dụng logic từ PlatformerWorldBuilder
    this.createAnimationsFromTilesetData(tileset);
    this.replaceAnimatedTilesInCurrentChunk(tilemap, tileset, offsetX);
  }

  /**
   * Tạo animations từ tileset data (copy từ PlatformerWorldBuilder)
   */
  private createAnimationsFromTilesetData(
    tileset: Phaser.Tilemaps.Tileset
  ): void {
    const tilesetData = tileset.tileData as Record<string, any>;
    if (!tilesetData || !tileset.image) return;

    this.ensureTilesetFrames(tileset);

    Object.keys(tilesetData).forEach((tileId) => {
      const tileData = tilesetData[tileId] as any;

      if (tileData.animation && Array.isArray(tileData.animation)) {
        const animKey = `${tileset.name}_tile_${tileId}`;

        if (this.scene.anims.exists(animKey)) return;

        const frames: Phaser.Types.Animations.AnimationFrame[] =
          tileData.animation.map((frame: any) => ({
            key: tileset.image!.key,
            frame: (tileset.firstgid + frame.tileid).toString(),
          }));

        const avgDuration =
          tileData.animation.reduce(
            (sum: number, frame: any) => sum + frame.duration,
            0
          ) / tileData.animation.length;
        const frameRate = 1000 / avgDuration;

        this.scene.anims.create({
          key: animKey,
          frames: frames,
          frameRate: frameRate,
          repeat: -1,
        });

        console.log(
          `✅ Created animation: ${animKey} (${
            frames.length
          } frames @ ${frameRate.toFixed(1)}fps)`
        );
      }
    });
  }

  /**
   * Thay thế animated tiles trong chunk hiện tại
   */
  private replaceAnimatedTilesInCurrentChunk(
    tilemap: Phaser.Tilemaps.Tilemap,
    tileset: Phaser.Tilemaps.Tileset,
    offsetX: number
  ): void {
    this.allLayers.forEach((layer) => {
      if (layer.x === offsetX) {
        layer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
          if (!tile || tile.index === -1) return;

          if (
            tile.index < tileset.firstgid ||
            tile.index >= tileset.firstgid + tileset.total
          ) {
            return;
          }

          const tileId = tile.index - tileset.firstgid;
          const animKey = `${tileset.name}_tile_${tileId}`;

          if (this.scene.anims.exists(animKey)) {
            const sprite = this.scene.add.sprite(
              tile.getCenterX(),
              tile.getCenterY(),
              tileset.image!.key,
              tile.index.toString()
            );

            sprite.setOrigin(0.5, 0.5);
            sprite.setDisplaySize(tile.width, tile.height);

            if (tile.flipX) sprite.setFlipX(true);
            if (tile.flipY) sprite.setFlipY(true);
            if (tile.rotation) sprite.setRotation(tile.rotation);

            sprite.play(animKey);
            tile.setVisible(false);

            console.log(`🎨 Replaced tile ${tile.index} with animated sprite`);
          }
        });
      }
    });
  }

  /**
   * Đảm bảo tileset có đầy đủ frame
   */
  private ensureTilesetFrames(tileset: Phaser.Tilemaps.Tileset): void {
    if (!tileset.image) return;

    const texture = this.scene.textures.get(tileset.image.key);
    if (!texture) return;

    const textureSource = texture.source[0];
    const imageWidth = textureSource.width;
    const imageHeight = textureSource.height;

    const margin = 1;
    const spacing = 2;
    const tileWidth = 64;
    const tileHeight = 64;

    const tilesPerRow = Math.floor(
      (imageWidth - margin * 2 + spacing) / (tileWidth + spacing)
    );
    const totalTiles =
      tilesPerRow *
      Math.floor((imageHeight - margin * 2 + spacing) / (tileHeight + spacing));

    for (let i = 0; i < totalTiles; i++) {
      const frameIndex = tileset.firstgid + i;

      if (texture.has(frameIndex.toString())) continue;

      const row = Math.floor(i / tilesPerRow);
      const col = i % tilesPerRow;

      const tileX = margin + col * (tileWidth + spacing);
      const tileY = margin + row * (tileHeight + spacing);

      texture.add(
        frameIndex.toString(),
        0,
        tileX,
        tileY,
        tileWidth,
        tileHeight
      );
    }
  }

  private getTiledProperties(obj: Phaser.Types.Tilemaps.TiledObject): {
    [key: string]: any;
  } {
    const props: { [key: string]: any } = {};
    if (obj.properties) {
      (obj.properties as any[]).forEach((prop) => {
        props[prop.name] = prop.value;
      });
    }
    return props;
  }
}
