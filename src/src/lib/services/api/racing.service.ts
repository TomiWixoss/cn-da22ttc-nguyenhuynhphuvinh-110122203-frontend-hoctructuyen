import api from "./client";

interface CompleteRoundRequest {
  user_id: string | number;
  quiz_id: string | number;
  round_number: number;
  round_score: number;
  skipped_round: boolean;
}

interface CompleteRoundResponse {
  success: boolean;
  message: string;
  data?: {
    rank_change?: {
      previous_rank: number;
      current_rank: number;
    };
    total_score?: number;
    player_position?: number;
  };
}

export const racingService = {
  /**
   * Gửi kết quả hoàn thành vòng chơi lên server
   * @param data - Dữ liệu vòng chơi
   * @returns Promise với kết quả từ server
   */
  completeRound: async (
    data: CompleteRoundRequest
  ): Promise<CompleteRoundResponse> => {
    try {
      const response = await api.post("/racing/complete-round", data);
      return response.data;
    } catch (error: any) {
      console.error("Racing API Error:", error);
      throw new Error(
        error.response?.data?.message || "Không thể gửi kết quả vòng chơi"
      );
    }
  },
};

export default racingService;
