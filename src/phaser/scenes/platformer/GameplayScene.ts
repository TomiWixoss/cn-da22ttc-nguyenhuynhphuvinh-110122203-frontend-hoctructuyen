// frontend/phaser/scenes/platformer/GameplayScene.ts

import { Scene } from "phaser";
import { EventBus } from "../../EventBus";
import { Player, CameraManager } from "../../classes";
import { ProceduralMapGenerator, QuizGate } from "./ProceduralMapGenerator";
// NetworkManager đã được xóa do không còn sử dụng Colyseus
import { QuizDetail, Question } from "@/lib/types/quiz";
import { GameProgressState } from "@/lib/services/game/GameProgressService";
import { EGG_TYPES } from "@/lib/services/game/game-rewards.config"; // THÊM IMPORT MỚI

type GameMode = "practice" | "assessment";

type GameLoopState = "RUNNING" | "WAITING_FOR_QUIZ" | "GAME_OVER";

export class GameplayScene extends Scene {
  private player!: Player;
  private cameraManager!: CameraManager;
  private mapGenerator!: ProceduralMapGenerator;
  // networkManager đã được xóa

  private quizGates: QuizGate[] = [];
  private currentGateIndex: number = 0;
  private gameState: GameLoopState = "RUNNING";
  private lastQuizResult: boolean = false;
  private playerSpawnPoint!: { x: number; y: number };
  private lastCheckpoint: {
    gateIndex: number;
    respawnX: number;
    respawnY: number;
  } | null = null;
  private finishZone?: Phaser.GameObjects.Zone;
  private quizData?: QuizDetail;
  private gameMode: GameMode = "practice";
  private lastQuizTimeLeft: number = 0;
  // THÊM MỚI: Một mảng để lưu tất cả các zone tương tác (jump pads)
  private interactiveZones: Phaser.GameObjects.Zone[] = [];

  // THÊM MỚI: Thêm thuộc tính để lưu chunk debug
  private debugChunkName?: string | null;
  private currentUser?: any; // Lưu thông tin người dùng
  private savedProgressData?: GameProgressState | null; // Thuộc tính để lưu progress

  // THAY ĐỔI 1: Đổi tên 'sortedQuestions' thành 'activeQuestions' để phản ánh đúng bản chất
  // Đây sẽ là danh sách câu hỏi "sống", có thể mở rộng
  private activeQuestions: Question[] = [];

  // THÊM MỚI: Theo dõi thông tin map mở rộng
  private originalQuestionsCount: number = 0;
  private extendedChunkNames: string[] = [];

  // THÊM: Flag để track xem đã hiển thị popup bắt đầu vòng làm lại chưa
  private hasStartedReviewRound: boolean = false;

  // THÊM STATE MỚI CHO XU
  private totalCoinValue: number = 0; // <- ĐỔI TÊN TỪ coinCount
  private collectedCoins: Set<string> = new Set(); // <- Thêm state lưu ID xu đã nhặt

  // THÊM STATE MỚI CHO TRỨNG
  private collectedEggs: Set<string> = new Set();
  private collectedEggData: any[] = []; // Lưu thông tin chi tiết của trứng đã nhặt

  // THÊM STATE CHO BACKGROUND MUSIC
  private bgMusic?: Phaser.Sound.BaseSound;

  constructor() {
    super({ key: "GameplayScene" });
  }

  // THAY ĐỔI: Cập nhật hàm init để nhận thêm data
  init(data: {
    quizData?: QuizDetail;
    gameMode?: GameMode;
    debugChunkName?: string | null;
    user?: any; // Thêm thông tin người dùng
    savedProgress?: GameProgressState | null; // Nhận savedProgress từ React
  }): void {
    console.log("🔄 GameplayScene initializing/restarting...");
    this.quizData = data.quizData;
    this.gameMode = data.gameMode || "practice";
    // THÊM MỚI: Lưu lại tên chunk debug
    this.debugChunkName = data.debugChunkName;
    // THÊM MỚI: Lưu thông tin người dùng
    this.currentUser = data.user;
    // Lưu lại savedProgress data
    this.savedProgressData = data.savedProgress;
    console.log(`🎮 Game mode set to: ${this.gameMode}`);
    console.log(
      `👤 User:`,
      this.currentUser
        ? this.currentUser.fullName || this.currentUser.name
        : "No user"
    );

    // QUAN TRỌNG: Nếu có tiến trình đã lưu, dùng chuỗi câu hỏi từ đó
    if (this.savedProgressData) {
      console.log("Restoring question sequence from saved data.");
      this.activeQuestions = this.savedProgressData.activeQuestionSequence;
      // Khôi phục thông tin map mở rộng
      if (this.savedProgressData.extendedMapData) {
        this.originalQuestionsCount =
          this.savedProgressData.extendedMapData.originalQuestionsCount;
        this.extendedChunkNames =
          this.savedProgressData.extendedMapData.extendedChunkNames;
        console.log(
          `🗺️ Restored extended map data: ${this.extendedChunkNames.length} extended chunks`
        );
      } else {
        this.originalQuestionsCount = this.activeQuestions.length;
      }
      // LẤY DỮ LIỆU XU ĐÃ LƯU TỪ `savedProgressData`
      this.totalCoinValue = this.savedProgressData.totalCoinValue || 0;
      this.collectedCoins = new Set(
        this.savedProgressData.collectedCoins || []
      );
      // KHÔI PHỤC DỮ LIỆU TRỨNG ĐÃ LƯU
      this.collectedEggs = new Set(this.savedProgressData.collectedEggs || []);
      this.collectedEggData = this.savedProgressData.collectedEggData || [];
      // Gửi số xu ban đầu về cho React
      EventBus.emit("coin-collected", { newCoinCount: this.totalCoinValue });
      // Gửi dữ liệu trứng ban đầu về React
      EventBus.emit("egg-collected", {
        newCollectedEggs: this.collectedEggData,
      });
    } else if (this.quizData && this.quizData.questions) {
      // Logic sắp xếp câu hỏi ban đầu
      const difficultyOrder: { [key: string]: number } = {
        Dễ: 1,
        "Trung bình": 2,
        Khó: 3,
      };
      this.activeQuestions = [...this.quizData.questions].sort((a, b) => {
        return (
          (difficultyOrder[a.level.name] || 4) -
          (difficultyOrder[b.level.name] || 4)
        );
      });
      this.originalQuestionsCount = this.activeQuestions.length;
    } else {
      this.activeQuestions = [];
      this.originalQuestionsCount = 0;
    }

    this.quizGates = [];
    // THÊM MỚI: Reset danh sách zone tương tác
    this.interactiveZones = [];
    this.currentGateIndex = 0;
    this.gameState = "RUNNING";

    // THÊM: Reset flag vòng làm lại
    // Nếu có saved progress và đã vượt qua câu gốc, nghĩa là đã vào vòng làm lại rồi
    if (
      this.savedProgressData &&
      this.savedProgressData.currentGateIndex >= this.originalQuestionsCount
    ) {
      this.hasStartedReviewRound = true;
    } else {
      this.hasStartedReviewRound = false;
    }
    this.lastQuizResult = false;
    this.lastCheckpoint = null;
  }

  preload(): void {
    // ... (preload giữ nguyên)
    this.load.image(
      "spritesheet-tiles-default",
      "/kenney_new-platformer-pack-1.0/Spritesheets/spritesheet-tiles-default_extruded.png"
    );
    this.load.image(
      "spritesheet-characters-default",
      "/kenney_new-platformer-pack-1.0/Spritesheets/spritesheet-characters-default.png"
    );
    this.load.audio(
      "jump",
      "/kenney_new-platformer-pack-1.0/Sounds/sfx_jump.ogg"
    );
    this.load.image(
      "coin",
      "/kenney_new-platformer-pack-1.0/Sprites/Tiles/Default/coin_gold.png"
    ); // <- THÊM DÒNG NÀY
    this.load.audio(
      "collect_coin",
      "/kenney_new-platformer-pack-1.0/Sounds/sfx_coin.ogg"
    ); // <- THÊM DÒNG NÀY

    // THÊM: Tải background music
    this.load.audio("bgMusic", "/VillainousTreachery.mp3");

    // Tải ảnh của tất cả các loại trứng (cả thường và vàng)
    Object.values(EGG_TYPES).forEach((egg) => {
      this.load.image(egg.id, egg.imagePath); // Tải ảnh trứng thường
      // Chỉ tải ảnh vàng nếu nó tồn tại và khác ảnh thường
      if (egg.goldenImagePath && egg.goldenImagePath !== egg.imagePath) {
        this.load.image(`${egg.id}_GOLDEN`, egg.goldenImagePath); // Tải ảnh trứng vàng
      }
    });
    this.load.tilemapTiledJSON(
      "easy_1",
      "/assets/tilemaps/chunks/easy/easy_1.json"
    );
    this.load.tilemapTiledJSON(
      "easy_2",
      "/assets/tilemaps/chunks/easy/easy_2.json"
    );
    this.load.tilemapTiledJSON(
      "easy_3",
      "/assets/tilemaps/chunks/easy/easy_3.json"
    );
    this.load.tilemapTiledJSON(
      "easy_4",
      "/assets/tilemaps/chunks/easy/easy_4.json"
    );
    this.load.tilemapTiledJSON(
      "medium_1",
      "/assets/tilemaps/chunks/medium/medium_1.json"
    );
    this.load.tilemapTiledJSON(
      "medium_2",
      "/assets/tilemaps/chunks/medium/medium_2.json"
    );
    this.load.tilemapTiledJSON(
      "medium_3",
      "/assets/tilemaps/chunks/medium/medium_3.json"
    );
    this.load.tilemapTiledJSON(
      "hard_1",
      "/assets/tilemaps/chunks/hard/hard_1.json"
    );
    this.load.tilemapTiledJSON(
      "hard_2",
      "/assets/tilemaps/chunks/hard/hard_2.json"
    );
    this.load.tilemapTiledJSON(
      "hard_3",
      "/assets/tilemaps/chunks/hard/hard_3.json"
    );
  }

  async create(): Promise<void> {
    console.log("🚀 GameplayScene Created");

    // THÊM: Khởi tạo và phát background music
    this.bgMusic = this.sound.add("bgMusic", {
      loop: true,
      volume: 0.3, // 30% volume, có thể điều chỉnh
    });
    this.bgMusic.play();

    this.cameraManager = new CameraManager(this, { zoom: 1.2 });
    this.mapGenerator = new ProceduralMapGenerator(this);

    // THÊM MỚI: Khởi tạo SeededRandom với câu hỏi
    if (this.activeQuestions.length > 0) {
      this.mapGenerator.initializeWithQuestions(this.activeQuestions);
    }

    // NetworkManager đã được xóa do không còn sử dụng Colyseus
    // THAY ĐỔI: Truyền thông tin debug và extended chunks vào hàm tạo sequence
    let chunkSequence: string[];

    if (
      this.savedProgressData &&
      this.savedProgressData.extendedMapData &&
      this.extendedChunkNames.length > 0
    ) {
      // Khôi phục map đã mở rộng từ saved progress
      console.log("🗺️ Restoring extended map from saved progress...");
      const originalQuestions = this.activeQuestions.slice(
        0,
        this.originalQuestionsCount
      );
      const baseSequence = this.mapGenerator.createChunkSequenceFromQuestions(
        originalQuestions,
        { debugChunkName: this.debugChunkName }
      );
      // Thêm các extended chunks vào cuối
      chunkSequence = [...baseSequence, ...this.extendedChunkNames];
      console.log(
        `🗺️ Extended sequence: [${baseSequence.join(
          ", "
        )}] + [${this.extendedChunkNames.join(", ")}]`
      );
    } else {
      // Tạo sequence bình thường
      chunkSequence =
        this.activeQuestions.length > 0
          ? this.mapGenerator.createChunkSequenceFromQuestions(
              this.activeQuestions,
              { debugChunkName: this.debugChunkName }
            )
          : this.mapGenerator.createRandomChunkSequence({
              debugChunkName: this.debugChunkName,
            });
    }

    const { quizGates, startPoint, interactiveZones, coinsGroup, eggsGroup } =
      await this.mapGenerator.generateMap(
        chunkSequence,
        this.collectedCoins,
        this.collectedEggs,
        this.gameMode // <- THAY ĐỔI: Truyền gameMode vào đây
      );
    this.quizGates = quizGates;
    // THÊM MỚI: Lưu danh sách zone vào thuộc tính của class
    this.interactiveZones = interactiveZones;
    const worldBounds = this.physics.world.bounds;
    this.cameraManager.setBounds(
      worldBounds.x,
      worldBounds.y,
      worldBounds.width,
      worldBounds.height
    );
    const startPointFinal = startPoint || { x: 150, y: 400 };
    this.playerSpawnPoint = { x: startPointFinal.x, y: startPointFinal.y };
    this.player = new Player(
      this as any,
      {
        x: this.playerSpawnPoint.x,
        y: this.playerSpawnPoint.y,
        texture: "spritesheet-characters-default",
        username: "Player",
        isPracticeMode: this.gameMode === "practice",
      },
      this.cameraManager
    );
    this.cameraManager.followTarget(this.player.getSprite());
    this.physics.add.collider(
      this.player.getSprite(),
      this.mapGenerator.getAllLayers()
    );

    // =======================================================================
    // THÊM MỚI: LOGIC VA CHẠM VỚI BẪ GAI
    // =======================================================================
    // 2. Gọi hàm mới từ generator để "đánh dấu" các tile gai
    this.mapGenerator.setHazardCollision(
      this.mapGenerator.getAllLayers(),
      this.handlePlayerHazardContact.bind(this) // Truyền hàm xử lý vào
    );

    // 3. Thêm một 'overlap' checker.
    // Nó sẽ không tạo ra va chạm vật lý, nhưng sẽ kích hoạt callback
    // mà chúng ta đã thiết lập ở bước 2 khi người chơi đi vào vùng tile gai.
    this.physics.add.overlap(
      this.player.getSprite(),
      this.mapGenerator.getAllLayers()
    );
    // =======================================================================

    // =======================================================================
    // THÊM VA CHẠM VỚI XU (CHỈ TRONG CHẾ ĐỘ LUYỆN TẬP)
    // =======================================================================
    if (this.gameMode === "practice") {
      this.physics.add.overlap(
        this.player.getSprite(),
        coinsGroup,
        this.handleCoinCollect,
        undefined,
        this
      );

      // THÊM VA CHẠM VỚI TRỨNG (CHỈ TRONG CHẾ ĐỘ LUYỆN TẬP)
      this.physics.add.overlap(
        this.player.getSprite(),
        eggsGroup,
        this.handleEggCollect,
        undefined,
        this
      );
    }
    // =======================================================================
    // THAY ĐỔI 3: Thiết lập va chạm bền vững cho TẤT CẢ các trigger
    // =======================================================================
    this.quizGates.forEach((gate) => {
      // Thiết lập cho trigger
      this.physics.add.overlap(
        this.player.getSprite(),
        gate.triggerZone,
        this.handleQuizTriggerCollision, // <-- Gọi hàm xử lý mới
        undefined,
        this
      );

      // Thiết lập cho pass/fail zones (giữ nguyên)
      this.physics.add.overlap(
        this.player.getSprite(),
        gate.passZone,
        this.handleZoneCollision,
        undefined,
        this
      );
      this.physics.add.overlap(
        this.player.getSprite(),
        gate.failZone,
        this.handleZoneCollision,
        undefined,
        this
      );
    });
    // =======================================================================
    // THÊM MỚI: ĐOẠN CODE SỬA LỖI
    // Thiết lập trạng thái ban đầu cho tất cả các quiz trigger
    // =======================================================================
    if (this.quizGates.length > 0) {
      console.log(`🔑 Initializing ${this.quizGates.length} quiz triggers...`);
      // 1. Vô hiệu hóa TẤT CẢ các trigger trước
      this.quizGates.forEach((gate) => gate.triggerZone.setActive(false));

      // 2. Chỉ kích hoạt trigger ĐẦU TIÊN
      this.quizGates[0].triggerZone.setActive(true);
      console.log(
        `✅ First trigger (ID: ${this.quizGates[0].id}) is now active.`
      );
    }
    // =======================================================================

    // THAY ĐỔI: Lặp qua mảng đã lưu trữ
    this.interactiveZones.forEach((zone) => {
      this.physics.add.overlap(
        this.player.getSprite(),
        zone,
        this.handleInteractiveZoneCollision,
        undefined,
        this
      );
    });
    // Khôi phục trạng thái nếu có
    if (this.savedProgressData) {
      this.restoreFromProgress(this.savedProgressData);
    }

    // Thêm listener để React có thể yêu cầu lưu trước khi thoát
    EventBus.on("request-save-before-unload", this.emitSaveProgress, this);
    this.events.on("shutdown", () => {
      EventBus.off("request-save-before-unload", this.emitSaveProgress, this);
    });

    EventBus.on("quiz-result", this.handleQuizResult, this);
    this.events.on("shutdown", () => {
      EventBus.off("quiz-result", this.handleQuizResult, this);
      EventBus.off("toggle-music", this.handleToggleMusic, this);
      EventBus.off("set-music-volume", this.handleSetMusicVolume, this);
      // THÊM: Dừng nhạc khi scene shutdown
      if (this.bgMusic) {
        this.bgMusic.stop();
      }
    });

    // THÊM: Listeners để điều khiển nhạc từ React
    EventBus.on("toggle-music", this.handleToggleMusic, this);
    EventBus.on("set-music-volume", this.handleSetMusicVolume, this);

    this.gameState = "RUNNING";
    this.player.resumeAutoRun();
    EventBus.emit("current-scene-ready", this);
  }

  update(): void {
    if (!this.player) return;
    this.player.update();
    this.cameraManager.update();
    if (this.gameState === "RUNNING") {
      this.checkFinishTrigger();
    }
    this.checkPlayerFallen();
  }

  /**
   * Xử lý khi người chơi va chạm với một quiz_trigger.
   * Đây là callback được gọi bởi trình lắng nghe vật lý bền vững.
   */
  private handleQuizTriggerCollision(player: any, zone: any): void {
    const triggerZone = zone as Phaser.GameObjects.Zone;

    // Lớp bảo vệ: Nếu trigger không hoạt động (đã được kích hoạt rồi), bỏ qua.
    if (!triggerZone.active) {
      return;
    }

    // TẮT TRIGGER NÀY NGAY LẬP TỨC ĐỂ TRÁNH LẶP
    triggerZone.setActive(false);

    // Lấy gateId đã được lưu từ Bước 1
    const gateId = triggerZone.getData("gateId") as number;

    // Kiểm tra xem gateId có hợp lệ với trạng thái hiện tại không
    // Điều này ngăn việc kích hoạt lại các trigger cũ
    if (gateId !== this.currentGateIndex) {
      console.warn(
        `[Collision] Ignored trigger for gate ${gateId} because current gate is ${this.currentGateIndex}.`
      );
      // Kích hoạt lại để có thể thử lại nếu cần, hoặc cứ để tắt
      // triggerZone.setActive(true);
      return;
    }

    console.log(`[Collision] Player hit trigger for gate ID: ${gateId}`);

    // THÊM: Kiểm tra xem có phải đang ở câu làm lại đầu tiên không
    // Chỉ hiển thị popup khi:
    // 1. Đang ở chế độ assessment
    // 2. Chưa hiển thị popup lần nào
    // 3. Đã vượt qua số câu hỏi gốc (đang ở phần làm lại)
    if (
      this.gameMode === "assessment" &&
      !this.hasStartedReviewRound &&
      this.currentGateIndex >= this.originalQuestionsCount
    ) {
      this.hasStartedReviewRound = true;
      EventBus.emit("review-round-started", {
        message: "Bắt đầu vòng làm lại câu sai!",
      });
      console.log("🔄 Started review round - showing notification");
    }

    this.gameState = "WAITING_FOR_QUIZ";
    this.player.stopAutoRun();

    EventBus.emit("request-quiz", { gateId: this.currentGateIndex });
  }

  /**
   * Xử lý khi người chơi chạm vào tile nguy hiểm (hazard).
   * @param player - Sprite của người chơi.
   * @param tile - Tile nguy hiểm mà người chơi chạm vào.
   */
  private handlePlayerHazardContact(player: any, tile: any): void {
    // Lớp bảo vệ, chỉ kích hoạt khi người chơi còn sống
    if (!this.player.getIsDead()) {
      console.log("💥 Player touched a hazard tile!");
      this.triggerPlayerDeath();
    }
  }

  // THÊM HÀM MỚI ĐỂ XỬ LÝ NHẶT XU
  private handleCoinCollect(playerSprite: any, coinSprite: any): void {
    const coin = coinSprite as Phaser.Physics.Arcade.Sprite;
    const coinId = coin.getData("coinId") as string;
    const coinValue = (coin.getData("coinValue") as number) || 1; // Lấy giá trị, mặc định là 1

    // Lớp bảo vệ để tránh nhặt cùng 1 xu nhiều lần
    if (!coinId || this.collectedCoins.has(coinId)) {
      return;
    }

    // Tắt sprite xu
    coin.disableBody(true, true);

    // Phát âm thanh
    this.sound.play("collect_coin", { volume: 0.5 });

    // Cộng giá trị thay vì ++
    this.totalCoinValue += coinValue;
    this.collectedCoins.add(coinId);

    // LOG ĐỂ KIỂM TRA: In ra giá trị xu sau mỗi lần nhặt
    console.log(
      `[Phaser] Nhặt xu giá trị ${coinValue}. Tổng giá trị mới: ${this.totalCoinValue}`
    );

    // Gửi tín hiệu về React để cập nhật UI
    EventBus.emit("coin-value-updated", { newTotalValue: this.totalCoinValue }); // <- CẬP NHẬT TÊN EVENT VÀ PAYLOAD

    // Kích hoạt lưu tiến trình
    this.time.delayedCall(100, () => this.emitSaveProgress());
  }

  // THÊM HÀM MỚI ĐỂ XỬ LÝ NHẶT TRỨNG
  private handleEggCollect(playerSprite: any, eggSprite: any): void {
    const egg = eggSprite as Phaser.Physics.Arcade.Sprite;
    const eggId = egg.getData("eggId") as string;
    const eggData = egg.getData("eggData");

    if (!eggId || this.collectedEggs.has(eggId)) {
      return;
    }

    egg.disableBody(true, true);
    // this.sound.play("collect_egg_sound"); // Thêm âm thanh nếu có

    this.collectedEggs.add(eggId);

    // ===================================================================
    // === SỬA LỖI QUAN TRỌNG NHẤT NẰM Ở ĐÂY ===
    // Thay vì .push(), chúng ta tạo một mảng mới bằng cú pháp spread.
    // Điều này đảm bảo React sẽ nhận diện đây là một sự thay đổi và re-render.
    this.collectedEggData = [...this.collectedEggData, eggData];
    // ===================================================================

    console.log(
      `[Phaser] Nhặt trứng: ${eggData.name} (Vàng: ${eggData.isGolden})`
    );

    // Gửi tín hiệu về React để cập nhật UI
    EventBus.emit("egg-collected", { newCollectedEggs: this.collectedEggData });

    this.time.delayedCall(100, () => this.emitSaveProgress());
  }

  // THÊM HÀM HOÀN TOÀN MỚI NÀY VÀO TRONG CLASS
  private checkPlayerFallen(): void {
    // Nếu player không tồn tại hoặc đã chết rồi thì không cần kiểm tra nữa
    if (!this.player || this.player.getIsDead()) {
      return;
    }

    const playerY = this.player.getSprite().y;
    const worldBottom = this.physics.world.bounds.bottom;

    // Kiểm tra nếu người chơi rơi xuống dưới đáy của thế giới
    // Thêm một khoảng đệm (ví dụ: 100px) để chắc chắn người chơi đã ra khỏi màn hình
    if (playerY > worldBottom - 100) {
      console.log("Player has fallen off the world. Triggering death...");

      // Gọi hàm helper để xử lý cái chết
      this.triggerPlayerDeath();
    }
  }

  // THAY ĐỔI 1: TẠO MỘT HÀM HELPER ĐỂ XỬ LÝ CÁI CHẾT
  private triggerPlayerDeath(): void {
    if (this.player.getIsDead()) return;

    console.log(
      `💀 Player death triggered in mode: "${this.gameMode}". Will use ${
        this.gameMode === "practice"
          ? "handlePlayerDeath (checkpoint respawn)"
          : "handleAssessmentRespawn (skip to next chunk)"
      }`
    );

    if (this.gameMode === "practice") {
      // Chế độ luyện tập: Hồi sinh tại checkpoint
      this.player.die(() => this.handlePlayerDeath());
    } else {
      // Chế độ 'assessment'
      // Chế độ đánh giá: Bỏ qua và hồi sinh ở chặng kế tiếp
      this.player.die(() => this.handleAssessmentRespawn());
    }
  }

  private handleZoneCollision(player: any, zone: any) {
    const zoneGameObject = zone as Phaser.GameObjects.Zone;

    // Lớp bảo vệ: Nếu zone đã bị tắt thì không làm gì cả
    if (!zoneGameObject.active) {
      return;
    }

    const isPass = zoneGameObject.getData("isPassZone") as boolean;

    if (isPass) {
      // --- LOGIC KHI ĐÁP ÁN ĐÚNG ---
      zoneGameObject.setActive(false); // Vô hiệu hóa ngay lập tức

      const forceX = zoneGameObject.getData("jumpForceX") as number;
      const forceY = zoneGameObject.getData("jumpForceY") as number;

      this.player.applyCustomJump(forceX, forceY);

      this.proceedToNextChunk();
    } else {
      // --- LOGIC MỚI KHI ĐÁP ÁN SAI ---
      // Vô hiệu hóa zone để tránh trigger nhiều lần
      zoneGameObject.setActive(false);

      // Lấy lực nhảy từ Tiled properties của fail_zone
      const forceX = zoneGameObject.getData("jumpForceX") as number;
      const forceY = zoneGameObject.getData("jumpForceY") as number;

      // Áp dụng lực nhảy để "trừng phạt" thay vì giết người chơi
      this.player.applyCustomJump(forceX, forceY);
    }
  }

  private handleInteractiveZoneCollision(player: any, zone: any) {
    const zoneGameObject = zone as Phaser.GameObjects.Zone;

    // THAY ĐỔI 1: Kiểm tra xem zone có đang hoạt động VÀ đã được sử dụng chưa
    // Nếu đã được sử dụng, thoát ra ngay lập tức.
    if (!zoneGameObject.active || zoneGameObject.getData("isUsed")) {
      return;
    }

    // THAY ĐỔI 2: Đánh dấu là đã sử dụng ngay lập tức
    // để ngăn việc kích hoạt nhiều lần trong cùng một frame.
    zoneGameObject.setData("isUsed", true);

    // Lấy lực nhảy (giữ nguyên)
    const forceX = zoneGameObject.getData("jumpForceX") as number;
    const forceY = zoneGameObject.getData("jumpForceY") as number;

    // Áp dụng lực nhảy lên người chơi (giữ nguyên)
    this.player.applyCustomJump(forceX, forceY);

    // THAY ĐỔI 3: Vô hiệu hóa zone vĩnh viễn
    // Đây là một bước tối ưu hóa để Phaser không cần kiểm tra va chạm với zone này nữa.
    // Bạn có thể thêm hiệu ứng hình ảnh (ví dụ: làm mờ tile bên dưới) ở đây nếu muốn.
    zoneGameObject.setActive(false);
  } // THAY ĐỔI 1: Chuyển `handleQuizResult` thành hàm `async` để có thể `await` việc tạo map
  private async handleQuizResult(data: {
    correct: boolean;
    timeLeft?: number;
  }): Promise<void> {
    if (this.gameState !== "WAITING_FOR_QUIZ") return;

    this.lastQuizResult = data.correct;
    this.lastQuizTimeLeft = data.timeLeft || 0;

    const currentGate = this.quizGates[this.currentGateIndex];
    if (!currentGate) return;

    // ===================================================================
    // THAY ĐỔI DUY NHẤT Ở ĐÂY: XÓA BỎ HOÀN TOÀN VIỆC KIỂM TRA THỜI GIAN
    // ===================================================================
    if (!data.correct && this.gameMode === "assessment") {
      // CỨ SAI LÀ TĂNG CHUNK. KHÔNG HỎI NHIỀU!
      await this.extendMapOnFailure();
    }
    // ===================================================================

    // Kích hoạt bệ phóng (pass hoặc fail)
    if (data.correct) {
      currentGate.passZone.setActive(true).setVisible(true);
    } else {
      currentGate.failZone.setActive(true).setVisible(true);
    }

    // Trì hoãn để người chơi thấy bệ phóng, sau đó cho chạy tiếp
    this.time.delayedCall(500, () => {
      this.gameState = "RUNNING";
      this.player.resumeAutoRun();
    });
  }

  private handleAssessmentRespawn(): void {
    const nextGateIndex = this.currentGateIndex + 1;
    if (nextGateIndex >= this.quizGates.length) {
      console.log("🏆 Assessment finished. No more chunks to proceed to.");
      EventBus.emit("game-completed");
      return;
    }

    const nextGate = this.quizGates[nextGateIndex];
    const respawnX = nextGate.chunkStartX + this.playerSpawnPoint.x;
    const respawnY = this.playerSpawnPoint.y;

    this.player.respawn(respawnX, respawnY);
    this.currentGateIndex = nextGateIndex;

    // =======================================================================
    // THÊM MỚI: KÍCH HOẠT TRIGGER CHO CHUNK HIỆN TẠI
    // Đây là bước quan trọng bị thiếu, đảm bảo quiz có thể được kích hoạt
    // sau khi người chơi được dịch chuyển đến đây.
    console.log(
      `[Respawn] Activating trigger for gate ${nextGate.id} at index ${this.currentGateIndex}`
    );
    nextGate.triggerZone.setActive(true);
    // =======================================================================

    this.gameState = "RUNNING";
    this.time.delayedCall(500, () => this.player.resumeAutoRun());
  }

  // THÊM MỚI: Hàm reset trạng thái của tất cả các bệ phóng
  private resetInteractiveZones(): void {
    console.log("🔄 Resetting all interactive zones (jump pads)...");
    this.interactiveZones.forEach((zone) => {
      // Xóa cờ 'isUsed'
      zone.data.remove("isUsed");
      // Kích hoạt lại zone để nó có thể va chạm
      zone.setActive(true);
    });
  }

  private checkFinishTrigger(): void {
    // ... (checkFinishTrigger giữ nguyên)
    const finishZones = this.children.list.filter(
      (child) => child.getData && child.getData("isFinishZone")
    );
    for (const zone of finishZones) {
      const finishZone = zone as Phaser.GameObjects.Zone;
      if (
        finishZone.body &&
        this.physics.overlap(this.player.getSprite(), finishZone)
      ) {
        if (this.currentGateIndex >= this.quizGates.length) {
          if (this.gameState !== "GAME_OVER") {
            this.gameState = "GAME_OVER";
            this.player.stopAutoRun();
            this.player.stopAI();
            console.log("🏆 CONGRATULATIONS! You reached the FINAL end!");

            // =======================================================================
            // === THAY ĐỔI QUAN TRỌNG NẰM Ở ĐÂY ===
            // =======================================================================
            // Gửi sự kiện game hoàn thành KÈM THEO tổng giá trị xu cuối cùng.
            EventBus.emit("game-completed", {
              finalCoinValue: this.totalCoinValue,
            });
            // Dòng cũ: EventBus.emit("game-completed");
            // =======================================================================
          }
        } else {
          finishZone.setActive(false);
          console.log(
            `🏁 Player hit an intermediate finish zone at index ${this.currentGateIndex}. Deactivating it.`
          );
        }
        break;
      }
    }
  }

  // =======================================================================
  // === CÁC HÀM MỚI ĐỂ XỪC LÝ GAME PROGRESS ========================
  // =======================================================================

  /**
   * Gửi tín hiệu lưu tiến trình
   */
  private emitSaveProgress(): void {
    if (this.player.getIsDead()) return; // Không lưu khi đang chết

    // Chuẩn bị thông tin map mở rộng
    const extendedMapData =
      this.extendedChunkNames.length > 0
        ? {
            originalQuestionsCount: this.originalQuestionsCount,
            totalChunksGenerated: this.quizGates.length,
            extendedChunkNames: this.extendedChunkNames,
          }
        : undefined;

    const progressData = {
      currentGateIndex: this.currentGateIndex,
      lastCheckpoint: this.lastCheckpoint,
      activeQuestionSequence: this.activeQuestions,
      playerPos: { x: this.player.getSprite().x, y: this.player.getSprite().y },
      extendedMapData: extendedMapData,
      // THÊM DỮ LIỆU XU
      totalCoinValue: this.totalCoinValue, // <-- Đổi từ coinCount thành totalCoinValue
      collectedCoins: Array.from(this.collectedCoins),
      // THÊM DỮ LIỆU TRỨNG
      collectedEggs: Array.from(this.collectedEggs),
      collectedEggData: this.collectedEggData,
    };

    console.log(
      "💾 Emitting save progress with extended map data:",
      extendedMapData
    );
    console.log("💾 Emitting save progress with coin data:", {
      totalCoinValue: this.totalCoinValue, // <-- Đổi từ count thành totalCoinValue
    });
    EventBus.emit("save-progress", progressData);
  }

  /**
   * Khôi phục trạng thái từ dữ liệu đã lưu
   */
  private restoreFromProgress(progress: GameProgressState): void {
    console.log("🔄 Restoring game state from progress...", progress);

    // QUAN TRỌNG: Cập nhật gameMode từ saved progress
    this.gameMode = progress.gameMode;
    console.log(
      `🎮 Game mode updated to: ${this.gameMode} (from saved progress)`
    );

    this.currentGateIndex = progress.currentGateIndex;
    this.lastCheckpoint = progress.lastCheckpoint;

    // Di chuyển người chơi đến vị trí đã lưu
    this.player
      .getSprite()
      .setPosition(progress.playerPos.x, progress.playerPos.y);

    // Kích hoạt lại trigger của chặng hiện tại
    if (this.currentGateIndex < this.quizGates.length) {
      // Tắt tất cả các trigger khác trước
      this.quizGates.forEach((gate, index) => {
        gate.triggerZone.setActive(index === this.currentGateIndex);
      });
      console.log(
        `✅ Restored to chunk ${this.currentGateIndex}. Trigger activated.`
      );
    }
  }

  // =======================================================================
  // === CẬP NHẬT CÁC HÀM HIỆN TẠI ĐỂ TỰ ĐỘNG LƯU TIẾN TRÌNH =====
  // =======================================================================

  /**
   * Cập nhật proceedToNextChunk để tự động lưu tiến trình
   */
  private proceedToNextChunk(): void {
    // Tăng chỉ số của chặng đường
    this.currentGateIndex++;

    // Kích hoạt lại trigger của chặng tiếp theo (nếu có)
    if (this.currentGateIndex < this.quizGates.length) {
      const nextGate = this.quizGates[this.currentGateIndex];
      nextGate.triggerZone.setActive(true);
    }

    // =======================================================================
    // === THAY ĐỔI QUAN TRỌNG NẰM Ở ĐÂY ===
    // =======================================================================
    // Chỉ thiết lập checkpoint trong chế độ luyện tập
    if (this.gameMode === "practice") {
      // Logic checkpoint theo độ khó
      const completedIndex = this.currentGateIndex - 1;
      const nextIndex = this.currentGateIndex;

      if (nextIndex < this.activeQuestions.length) {
        const completedQuestion = this.activeQuestions[completedIndex];
        const nextQuestion = this.activeQuestions[nextIndex];

        const difficultyOrder: { [key: string]: number } = {
          Dễ: 1,
          "Trung bình": 2,
          Khó: 3,
        };

        const completedDifficulty =
          difficultyOrder[completedQuestion.level.name] || 0;
        const nextDifficulty = difficultyOrder[nextQuestion.level.name] || 0;

        if (nextDifficulty > completedDifficulty) {
          console.log(
            `Difficulty changed from ${completedQuestion.level.name} to ${nextQuestion.level.name}. Setting checkpoint!`
          );
          this.setCheckpoint();
        }
      }
    }
    // =======================================================================

    // Gọi lưu tiến trình sau khi qua chặng
    this.time.delayedCall(100, () => this.emitSaveProgress());

    this.gameState = "RUNNING";
    this.player.resumeAutoRun();
  }

  /**
   * Cập nhật setCheckpoint để tự động lưu tiến trình
   */
  private setCheckpoint(): void {
    // =======================================================================
    // === THAY ĐỔI QUAN TRỌNG NẰM Ở ĐÂY ===
    // =======================================================================
    // Chỉ thực thi logic checkpoint trong chế độ 'practice'
    if (this.gameMode === "practice") {
      if (this.currentGateIndex < this.quizGates.length) {
        const checkpointGate = this.quizGates[this.currentGateIndex];
        this.lastCheckpoint = {
          gateIndex: this.currentGateIndex,
          respawnX: checkpointGate.chunkStartX + this.playerSpawnPoint.x,
          respawnY: this.playerSpawnPoint.y,
        };
        EventBus.emit("checkpoint-reached", { message: `Đã đến điểm lưu!` });
        // Gọi lưu tiến trình khi có checkpoint
        this.time.delayedCall(100, () => this.emitSaveProgress());
      }
    }
    // =======================================================================
  }

  /**
   * Cập nhật extendMapOnFailure để tự động lưu tiến trình
   */
  private async extendMapOnFailure(): Promise<void> {
    console.log(
      "🚀 Extending map due to incorrect answer in assessment mode..."
    );

    // KHÔNG emit event ở đây nữa - chỉ extend map thôi
    // Event sẽ được emit khi thực sự đến câu làm lại đầu tiên

    const failedQuestion = this.activeQuestions[this.currentGateIndex];
    if (!failedQuestion) return;

    const difficultyMap = {
      Dễ: "easy",
      "Trung bình": "medium",
      Khó: "hard",
    } as const;
    const difficultyKey =
      difficultyMap[failedQuestion.level.name as keyof typeof difficultyMap] ||
      "easy";

    const newChunkName = this.mapGenerator.getRandomChunkName(difficultyKey);
    const newChunkResult = await this.mapGenerator.appendChunk(newChunkName);
    if (!newChunkResult) return;

    // THÊM MỚI: Theo dõi tên chunk đã mở rộng
    this.extendedChunkNames.push(newChunkName);
    console.log(
      `🗺️ Extended chunk added: ${newChunkName}. Total extended chunks: ${this.extendedChunkNames.length}`
    );

    const { quizGate: newGate, interactiveZones: newInteractiveZones } =
      newChunkResult;

    if (newGate) {
      this.quizGates.push(newGate);

      // =======================================================================
      // === THAY ĐỔI QUAN TRỌNG NHẤT ĐỂ SỬA LỖI ===
      // =======================================================================
      // Thiết lập va chạm cho trigger, pass, và fail zone của chunk MỚI
      this.physics.add.overlap(
        this.player.getSprite(),
        newGate.triggerZone, // <-- Thiết lập cho trigger zone mới
        this.handleQuizTriggerCollision,
        undefined,
        this
      );
      this.physics.add.overlap(
        this.player.getSprite(),
        newGate.passZone,
        this.handleZoneCollision,
        undefined,
        this
      );
      this.physics.add.overlap(
        this.player.getSprite(),
        newGate.failZone,
        this.handleZoneCollision,
        undefined,
        this
      );
      // =======================================================================

      newGate.triggerZone.setActive(false); // Bắt đầu ở trạng thái tắt
      console.log(`🚀 New gate added. Total gates: ${this.quizGates.length}`);
    }

    this.interactiveZones.push(...newInteractiveZones);
    newInteractiveZones.forEach((zone) => {
      this.physics.add.overlap(
        this.player.getSprite(),
        zone,
        this.handleInteractiveZoneCollision,
        undefined,
        this
      );
    });

    this.finishZone = this.children.list.find(
      (child) => child.getData && child.getData("isFinishZone")
    ) as Phaser.GameObjects.Zone;

    const newWorldBounds = this.physics.world.bounds;
    this.cameraManager.setBounds(
      newWorldBounds.x,
      newWorldBounds.y,
      newWorldBounds.width,
      newWorldBounds.height
    );
    console.log(
      `🚀 Camera bounds updated to new width: ${newWorldBounds.width}`
    );

    EventBus.emit("add-dynamic-question", failedQuestion);
    this.activeQuestions.push(failedQuestion);
    console.log(
      `🚀 Phaser's active question list now has ${this.activeQuestions.length} questions.`
    );

    // Gọi lưu tiến trình sau khi mở rộng map
    this.time.delayedCall(100, () => this.emitSaveProgress());
  }

  /**
   * Cập nhật handlePlayerDeath để tự động lưu tiến trình
   */
  private handlePlayerDeath(): void {
    this.resetInteractiveZones();

    if (this.lastCheckpoint) {
      this.player.respawn(
        this.lastCheckpoint.respawnX,
        this.lastCheckpoint.respawnY
      );
      this.currentGateIndex = this.lastCheckpoint.gateIndex;
    } else {
      this.player.respawn(this.playerSpawnPoint.x, this.playerSpawnPoint.y);
      this.currentGateIndex = 0;
    }

    if (this.currentGateIndex < this.quizGates.length) {
      this.quizGates[this.currentGateIndex].triggerZone.setActive(true);
    }

    this.gameState = "RUNNING";
    this.time.delayedCall(500, () => {
      this.player.resumeAutoRun();
      // Gọi lưu tiến trình sau khi hồi sinh
      this.emitSaveProgress();
    });
  }

  // =======================================================================
  // === CÁC HÀM ĐIỀU KHIỂN NHẠC NỀN ===
  // =======================================================================

  /**
   * Bật/tắt nhạc nền
   */
  private handleToggleMusic = (data: { enabled: boolean }): void => {
    if (!this.bgMusic) return;

    if (data.enabled) {
      if (!this.bgMusic.isPlaying) {
        this.bgMusic.play();
      }
    } else {
      if (this.bgMusic.isPlaying) {
        this.bgMusic.pause();
      }
    }
  };

  /**
   * Điều chỉnh âm lượng nhạc nền (0.0 - 1.0)
   */
  private handleSetMusicVolume = (data: { volume: number }): void => {
    if (!this.bgMusic) return;

    const volume = Math.max(0, Math.min(1, data.volume)); // Clamp 0-1
    (
      this.bgMusic as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound
    ).setVolume(volume);
  };
}
