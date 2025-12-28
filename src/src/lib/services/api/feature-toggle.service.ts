/**
 * Feature Toggle Service
 * API service cho hệ thống Feature Toggles
 */

import api from "./client";
import {
  FeatureStatusResponse,
  MemoryStatusResponse,
  ToggleFeatureRequest,
  ToggleFeatureResponse,
  ToggleAndRestartResponse,
  RestartResponse,
  SetAllFeaturesRequest,
  SetAllFeaturesResponse,
} from "@/lib/types/feature-toggle";

const FEATURE_API_BASE = "/features";

/**
 * Feature Toggle Service
 * Quản lý các API liên quan đến Feature Toggles
 */
const featureToggleService = {
  /**
   * Lấy trạng thái tất cả features và thông tin memory
   * PUBLIC - Không cần auth
   */
  async getStatus(): Promise<FeatureStatusResponse> {
    const response = await api.get<FeatureStatusResponse>(
      `${FEATURE_API_BASE}/status`
    );
    return response.data;
  },

  /**
   * Lấy chi tiết memory (cho Admin monitoring)
   * PUBLIC - Không cần auth
   */
  async getMemoryStatus(): Promise<MemoryStatusResponse> {
    const response = await api.get<MemoryStatusResponse>(
      `${FEATURE_API_BASE}/memory`
    );
    return response.data;
  },

  /**
   * Toggle một feature (chỉ lưu config, chưa restart)
   * ADMIN ONLY
   */
  async toggleFeature(
    request: ToggleFeatureRequest
  ): Promise<ToggleFeatureResponse> {
    const response = await api.post<ToggleFeatureResponse>(
      `${FEATURE_API_BASE}/toggle`,
      request
    );
    return response.data;
  },

  /**
   * Toggle feature và restart server ngay lập tức
   * ADMIN ONLY
   */
  async toggleAndRestart(
    request: ToggleFeatureRequest
  ): Promise<ToggleAndRestartResponse> {
    const response = await api.post<ToggleAndRestartResponse>(
      `${FEATURE_API_BASE}/toggle-and-restart`,
      request
    );
    return response.data;
  },

  /**
   * Restart server để áp dụng config đã lưu
   * ADMIN ONLY
   */
  async restartServer(): Promise<RestartResponse> {
    const response = await api.post<RestartResponse>(
      `${FEATURE_API_BASE}/restart`,
      {}
    );
    return response.data;
  },

  /**
   * Set tất cả features cùng lúc
   * ADMIN ONLY
   */
  async setAllFeatures(
    request: SetAllFeaturesRequest
  ): Promise<SetAllFeaturesResponse> {
    const response = await api.post<SetAllFeaturesResponse>(
      `${FEATURE_API_BASE}/set-all`,
      request
    );
    return response.data;
  },
};

export default featureToggleService;
