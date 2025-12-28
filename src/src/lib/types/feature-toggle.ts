/**
 * Feature Toggle Types
 * Định nghĩa các types cho hệ thống Feature Toggles
 */

// Danh sách các Feature Keys
export type FeatureKey =
  | "CODE_PRACTICE"
  | "QUIZ"
  | "GAMIFICATION"
  | "ANALYTICS"
  | "AI_TUTOR";

// Trạng thái các features
export interface FeatureFlags {
  CODE_PRACTICE: boolean;
  QUIZ: boolean;
  GAMIFICATION: boolean;
  ANALYTICS: boolean;
  AI_TUTOR: boolean;
}

// Memory info từ server
export interface MemoryInfo {
  heapUsed: number;
  heapTotal: number;
  rss: number;
  unit: string;
}

// Memory detail (cho Admin dashboard)
export interface MemoryDetail {
  before_gc: {
    heapUsed: number;
    rss: number;
  };
  after_gc: {
    heapUsed: number;
    rss: number;
  };
  unit: string;
}

// Response từ GET /api/features/status
export interface FeatureStatusResponse {
  success: boolean;
  features: FeatureFlags;
  memory: MemoryInfo;
  uptime: number;
  timestamp: string;
}

// Response từ GET /api/features/memory
export interface MemoryStatusResponse {
  success: boolean;
  memory: MemoryDetail;
  loadedModules: number;
  uptime: number;
}

// Request body cho POST /api/features/toggle
export interface ToggleFeatureRequest {
  feature: FeatureKey;
  enabled: boolean;
}

// Response từ POST /api/features/toggle
export interface ToggleFeatureResponse {
  success: boolean;
  message: string;
  pendingConfig: FeatureFlags;
  needRestart: boolean;
}

// Response từ POST /api/features/toggle-and-restart
export interface ToggleAndRestartResponse {
  success: boolean;
  message: string;
  newConfig: FeatureFlags;
  restartingIn: string;
}

// Response từ POST /api/features/restart
export interface RestartResponse {
  success: boolean;
  message: string;
  restartingIn: string;
}

// Request body cho POST /api/features/set-all
export interface SetAllFeaturesRequest {
  features: Partial<FeatureFlags>;
  restart?: boolean;
}

// Response từ POST /api/features/set-all
export interface SetAllFeaturesResponse {
  success: boolean;
  message: string;
  newConfig: FeatureFlags;
}

// Error response khi module bị disabled (503)
export interface ModuleDisabledError {
  success: false;
  message: string;
  code: "MODULE_DISABLED";
  feature: FeatureKey;
}

// Feature display config cho UI
export interface FeatureDisplayConfig {
  key: FeatureKey;
  label: string;
  description: string;
  icon: string;
  affectedMenus: string[];
}

// Default feature flags (tất cả bật để tránh flash content)
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  CODE_PRACTICE: true,
  QUIZ: true,
  GAMIFICATION: true,
  ANALYTICS: true,
  AI_TUTOR: true,
};

// Feature display configs
export const FEATURE_CONFIGS: FeatureDisplayConfig[] = [
  {
    key: "CODE_PRACTICE",
    label: "Luyện Code",
    description: "Nộp bài code, chấm code AI",
    icon: "FileCode",
    affectedMenus: ["Luyện Code", "Bài tập Code"],
  },
  {
    key: "QUIZ",
    label: "Thi & Kiểm tra",
    description: "Thi trắc nghiệm, Realtime Quiz",
    icon: "ClipboardList",
    affectedMenus: ["Thi", "Kiểm tra", "Quiz"],
  },
  {
    key: "GAMIFICATION",
    label: "Gamification",
    description: "Shop, Ranking, Achievement",
    icon: "Trophy",
    affectedMenus: ["Bảng xếp hạng", "Cửa hàng"],
  },
  {
    key: "ANALYTICS",
    label: "Thống kê",
    description: "Thống kê, Báo cáo",
    icon: "BarChart3",
    affectedMenus: ["Thống kê", "Báo cáo"],
  },
  {
    key: "AI_TUTOR",
    label: "AI Tutor",
    description: "Chatbot AI hỗ trợ học tập",
    icon: "Bot",
    affectedMenus: ["Hỏi AI", "AI Chat"],
  },
];
