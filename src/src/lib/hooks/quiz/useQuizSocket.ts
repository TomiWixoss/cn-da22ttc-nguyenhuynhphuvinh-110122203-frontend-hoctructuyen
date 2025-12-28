/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import quizService from "@/lib/services";
import quizSocketService from "@/lib/services/socket/quiz";

// Định nghĩa interface cho item trong leaderboard
interface LeaderboardItem {
  user_id: string | number;
  score: number;
  name?: string;
  student_id?: string;
}

interface UseQuizSocketProps {
  quizId: number;
  user: any;
  questionsLength: number;
}

interface UseQuizSocketReturn {
  userPosition: number | undefined;
  totalParticipants: number | undefined;
  updateUserPosition: () => Promise<void>;
}

export const useQuizSocket = ({
  quizId,
  user,
  questionsLength,
}: UseQuizSocketProps): UseQuizSocketReturn => {
  // State cho vị trí bảng xếp hạng realtime
  const [userPosition, setUserPosition] = useState<number | undefined>(
    undefined
  );
  const [totalParticipants, setTotalParticipants] = useState<
    number | undefined
  >(undefined);

  // Function để cập nhật vị trí bảng xếp hạng hiện tại
  const updateUserPosition = useCallback(async () => {
    try {
      if (!user?.user_id) return;

      const response = await quizService.getLeaderboard(quizId);

      if (response.data?.leaderboard && response.data.leaderboard.length > 0) {
        // Tìm vị trí của user hiện tại trong bảng xếp hạng
        const userIndex = response.data.leaderboard.findIndex(
          (item: LeaderboardItem) =>
            item.user_id.toString() === user.user_id.toString()
        );

        if (userIndex !== -1) {
          const position = userIndex + 1; // Vị trí bắt đầu từ 1
          const total = response.data.leaderboard.length;

          setUserPosition(position);
          setTotalParticipants(total);
        } else {
        }
      }
    } catch (error) {
      console.error("Error updating user position:", error);
    }
  }, [quizId, user?.user_id]);

  // Lấy vị trí ban đầu khi component mount
  useEffect(() => {
    if (user?.user_id && questionsLength > 0) {
      updateUserPosition();
    }
  }, [user?.user_id, questionsLength, updateUserPosition]);

  // Socket listener cho cập nhật vị trí realtime
  useEffect(() => {
    if (!user || !quizId) {
      return;
    }

    const listenerId = `quiz-live-${quizId}-${user.user_id}`;

    // Tham gia phòng quiz
    quizSocketService.joinQuizRoom(quizId);
    quizSocketService.joinStudentRoom(quizId);
    quizSocketService.joinPersonalRoom(quizId, user.user_id);

    // Lắng nghe sự kiện cập nhật vị trí người dùng
    quizSocketService.onUserPositionUpdate(quizId, listenerId, (data) => {

      // Chỉ cập nhật nếu là vị trí của người dùng hiện tại
      if (data.userId.toString() === user.user_id.toString()) {
        setUserPosition(data.position);
        setTotalParticipants(data.totalParticipants);

        // Hiển thị toast thông báo vị trí mới
        toast.success(
          `Vị trí hiện tại: #${data.position}/${data.totalParticipants}`
        );
      }
    });

    // Cleanup khi component unmount
    return () => {
      quizSocketService.offEvent("userPositionUpdate", listenerId);
    };
  }, [user, quizId, updateUserPosition]);

  return {
    userPosition,
    totalParticipants,
    updateUserPosition,
  };
};
