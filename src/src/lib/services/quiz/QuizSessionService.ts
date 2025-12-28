// frontend/src/lib/services/quiz/QuizSessionService.ts

import pako from "pako";
import CryptoJS from "crypto-js";
import { Question } from "@/lib/types/quiz";

// Sử dụng cùng SECRET_KEY như GameProgressService để nhất quán
const SECRET_KEY =
  process.env.NEXT_PUBLIC_GAME_PROGRESS_SECRET || "default-secret-key-for-dev";

// Interface cho dữ liệu performance của mỗi câu hỏi
export interface PerformanceDataItem {
  question_id: number;
  is_correct: boolean;
  response_time_ms: number;
  attempts: number;
  attempt_number?: number; // MỚI: Số lần thử (1, 2, 3...)
}

// Interface cho câu trả lời trong phiên
export interface SessionAnswer {
  question: Question;
  selectedAnswerId: number; // ID của đáp án mà sinh viên đã chọn
  isCorrect: boolean;
  attempt_number?: number; // MỚI: Số lần thử (1, 2, 3...)
}

// Interface chính cho dữ liệu phiên quiz
export interface QuizSessionData {
  version: string;
  quizId: number;
  userId: number;
  gameMode: "practice" | "assessment";
  sessionStartTime: number;
  sessionAnswers: SessionAnswer[];
  performanceData: PerformanceDataItem[];
  totalCoinValue: number;
  collectedEggs: any[];
  eggOpeningResults: any[]; // Đổi từ openedRewards sang eggOpeningResults
  timestamp: number;
}

const STORAGE_KEY_PREFIX = "quiz_session_";
const CURRENT_VERSION = "1.0.0";

class QuizSessionService {
  private getStorageKey(quizId: number, userId: number): string {
    return `${STORAGE_KEY_PREFIX}${quizId}_${userId}`;
  }

  /**
   * Lưu dữ liệu phiên quiz vào localStorage với mã hóa
   */
  public saveSession(
    data: Omit<QuizSessionData, "version" | "timestamp">
  ): void {
    try {
      const sessionData: QuizSessionData = {
        ...data,
        version: CURRENT_VERSION,
        timestamp: Date.now(),
      };

      // 1. Chuyển object thành chuỗi JSON
      const jsonString = JSON.stringify(sessionData);
      // 2. Nén chuỗi JSON bằng pako và chuyển thành base64
      const compressed = pako.deflate(jsonString);
      const compressedBase64 = btoa(String.fromCharCode(...compressed));
      // 3. Mã hóa dữ liệu đã nén bằng AES
      const encrypted = CryptoJS.AES.encrypt(
        compressedBase64,
        SECRET_KEY
      ).toString();
      // 4. Lưu vào localStorage
      const storageKey = this.getStorageKey(data.quizId, data.userId);
      localStorage.setItem(storageKey, encrypted);
    } catch (error) {
      console.error("❌ Failed to save quiz session data:", error);
    }
  }

  /**
   * Tải dữ liệu phiên quiz từ localStorage
   */
  public loadSession(quizId: number, userId: number): QuizSessionData | null {
    try {
      const storageKey = this.getStorageKey(quizId, userId);
      const encrypted = localStorage.getItem(storageKey);

      if (!encrypted) {
        return null;
      }

      // 1. Giải mã dữ liệu từ localStorage
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
      const loadedData: QuizSessionData = JSON.parse(jsonString);

      // Kiểm tra phiên bản để tránh lỗi khi cấu trúc dữ liệu thay đổi
      if (loadedData.version !== CURRENT_VERSION) {
        console.warn(
          `Version mismatch. Saved: ${loadedData.version}, Current: ${CURRENT_VERSION}. Clearing old session data.`
        );
        this.clearSession(quizId, userId);
        return null;
      }

      return loadedData;
    } catch (error) {
      console.error(
        "❌ Failed to load quiz session data. Data might be corrupted or key mismatched. Clearing...",
        error
      );
      // Nếu có lỗi (dữ liệu hỏng, key sai), xóa đi để tránh lỗi lặp lại
      this.clearSession(quizId, userId);
      return null;
    }
  }

  /**
   * Xóa dữ liệu phiên quiz đã lưu
   */
  public clearSession(quizId: number, userId: number): void {
    try {
      const storageKey = this.getStorageKey(quizId, userId);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("❌ Failed to clear quiz session data:", error);
    }
  }

  /**
   * Kiểm tra xem có dữ liệu phiên đã lưu hay không
   */
  public hasSession(quizId: number, userId: number): boolean {
    try {
      const storageKey = this.getStorageKey(quizId, userId);
      return localStorage.getItem(storageKey) !== null;
    } catch (error) {
      console.error("❌ Failed to check saved session data:", error);
      return false;
    }
  }

  /**
   * Cập nhật một phần dữ liệu phiên (merge với dữ liệu hiện có)
   */
  public updateSession(
    quizId: number,
    userId: number,
    partialData: Partial<
      Omit<QuizSessionData, "version" | "timestamp" | "quizId" | "userId">
    >
  ): void {
    try {
      const existingData = this.loadSession(quizId, userId);

      if (!existingData) {
        console.warn("No existing session data found to update");
        return;
      }

      const updatedData = {
        ...existingData,
        ...partialData,
        quizId, // Đảm bảo không thay đổi
        userId, // Đảm bảo không thay đổi
      };

      this.saveSession(updatedData);
    } catch (error) {
      console.error("❌ Failed to update quiz session data:", error);
    }
  }

  /**
   * Xóa tất cả dữ liệu phiên quiz (dọn dẹp)
   */
  public clearAllSessions(): void {
    try {
      const keysToRemove: string[] = [];

      // Tìm tất cả keys có pattern quiz_session_*
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }

      // Xóa tất cả quiz session data
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("❌ Failed to clear all quiz sessions:", error);
    }
  }
}

export const quizSessionService = new QuizSessionService();
