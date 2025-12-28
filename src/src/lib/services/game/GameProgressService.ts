// frontend/src/lib/services/game/GameProgressService.ts

import pako from "pako";
import CryptoJS from "crypto-js";
import { Question } from "@/lib/types/quiz"; // Import kiểu dữ liệu Question

// Lấy SECRET_KEY từ biến môi trường, đây là cách an toàn nhất
// Bạn cần định nghĩa biến này trong file .env.local của mình
const SECRET_KEY =
  process.env.NEXT_PUBLIC_GAME_PROGRESS_SECRET || "default-secret-key-for-dev";

// Định nghĩa cấu trúc dữ liệu của tiến trình sẽ được lưu
export interface GameProgressState {
  version: string; // Để quản lý các phiên bản cấu trúc lưu trữ sau này
  quizId: number;
  userId: number;
  gameMode: "practice" | "assessment";
  currentGateIndex: number;
  lastCheckpoint: {
    gateIndex: number;
    respawnX: number;
    respawnY: number;
  } | null;
  activeQuestionSequence: Question[]; // Lưu lại toàn bộ chuỗi câu hỏi
  // THÊM MỚI: Lưu thông tin map đã được mở rộng
  extendedMapData?: {
    originalQuestionsCount: number; // Số lượng câu hỏi ban đầu
    totalChunksGenerated: number; // Tổng số chunk đã generate (bao gồm mở rộng)
    extendedChunkNames: string[]; // Danh sách tên các chunk đã mở rộng
  };
  quizTimeLeft?: number; // Lưu thời gian còn lại của quiz (chế độ assessment)
  playerPos: { x: number; y: number }; // Lưu vị trí chính xác của người chơi
  totalCoinValue?: number; // Tổng giá trị xu đã thu thập
  collectedCoins?: string[]; // Mảng chứa ID của các xu đã thu thập
  // THÊM HỖ TRỢ CHO TRỨNG
  collectedEggs?: string[]; // Mảng chứa ID của các trứng đã nhặt
  collectedEggData?: any[]; // Thông tin chi tiết của trứng đã nhặt
  timestamp: number;
}

const STORAGE_KEY_PREFIX = "game_progress_";
const CURRENT_VERSION = "1.0.0";

class GameProgressService {
  private getStorageKey(quizId: number, userId: number): string {
    return `${STORAGE_KEY_PREFIX}${quizId}_${userId}`;
  }

  /**
   * Lưu tiến trình của người chơi vào Local Storage
   */
  public saveProgress(
    state: Omit<GameProgressState, "version" | "timestamp">
  ): void {
    try {
      const stateToSave: GameProgressState = {
        ...state,
        version: CURRENT_VERSION,
        timestamp: Date.now(),
      };


      // 1. Chuyển object thành chuỗi JSON
      const jsonString = JSON.stringify(stateToSave);
      // 2. Nén chuỗi JSON bằng pako và chuyển thành base64
      const compressed = pako.deflate(jsonString);
      const compressedBase64 = btoa(String.fromCharCode(...compressed));
      // 3. Mã hóa dữ liệu đã nén bằng AES
      const encrypted = CryptoJS.AES.encrypt(
        compressedBase64,
        SECRET_KEY
      ).toString();
      // 4. Lưu vào Local Storage
      const storageKey = this.getStorageKey(state.quizId, state.userId);
      localStorage.setItem(storageKey, encrypted);
    } catch (error) {
      console.error("❌ Failed to save game progress:", error);
    }
  }

  /**
   * Tải tiến trình đã lưu từ Local Storage
   */
  public loadProgress(
    quizId: number,
    userId: number
  ): GameProgressState | null {
    try {
      const storageKey = this.getStorageKey(quizId, userId);
      const encrypted = localStorage.getItem(storageKey);

      if (!encrypted) {
        return null;
      }


      // 1. Giải mã dữ liệu từ Local Storage
      const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      const compressedBase64 = bytes.toString(CryptoJS.enc.Utf8);

      if (!compressedBase64) {
        throw new Error("Decryption failed, resulting in empty string.");
      }

      // 2. Chuyển từ base64 về Uint8Array và giải nén
      const compressedBytes = new Uint8Array(
        atob(compressedBase64)
          .split("")
          .map((c) => c.charCodeAt(0))
      );
      const jsonString = pako.inflate(compressedBytes, { to: "string" });
      // 3. Chuyển chuỗi JSON về lại object
      const loadedState: GameProgressState = JSON.parse(jsonString);

      // Kiểm tra phiên bản để tránh lỗi khi cấu trúc dữ liệu thay đổi
      if (loadedState.version !== CURRENT_VERSION) {
        console.warn(
          `Version mismatch. Saved: ${loadedState.version}, Current: ${CURRENT_VERSION}. Clearing old progress.`
        );
        this.clearProgress(quizId, userId);
        return null;
      }

      return loadedState;
    } catch (error) {
      console.error(
        "❌ Failed to load game progress. Data might be corrupted or key mismatched. Clearing...",
        error
      );
      // Nếu có lỗi (dữ liệu hỏng, key sai), xóa đi để tránh lỗi lặp lại
      this.clearProgress(quizId, userId);
      return null;
    }
  }

  /**
   * Xóa tiến trình đã lưu
   */
  public clearProgress(quizId: number, userId: number): void {
    try {
      localStorage.removeItem(this.getStorageKey(quizId, userId));
    } catch (error) {
      console.error("❌ Failed to clear game progress:", error);
    }
  }

  /**
   * Kiểm tra xem có tiến trình đã lưu hay không
   */
  public hasProgress(quizId: number, userId: number): boolean {
    try {
      const storageKey = this.getStorageKey(quizId, userId);
      return localStorage.getItem(storageKey) !== null;
    } catch (error) {
      console.error("❌ Failed to check saved progress:", error);
      return false;
    }
  }

  /**
   * Lấy thông tin cơ bản về tiến trình đã lưu (không giải mã toàn bộ)
   */
  public getProgressInfo(
    quizId: number,
    userId: number
  ): {
    exists: boolean;
    timestamp?: number;
    gameMode?: "practice" | "assessment";
    currentGateIndex?: number;
  } {
    try {
      const progress = this.loadProgress(quizId, userId);
      if (!progress) {
        return { exists: false };
      }

      return {
        exists: true,
        timestamp: progress.timestamp,
        gameMode: progress.gameMode,
        currentGateIndex: progress.currentGateIndex,
      };
    } catch (error) {
      console.error("❌ Failed to get progress info:", error);
      return { exists: false };
    }
  }
}

export const gameProgressService = new GameProgressService();
