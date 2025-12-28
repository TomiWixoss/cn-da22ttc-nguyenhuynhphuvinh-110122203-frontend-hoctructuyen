import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { quizService } from "@/lib/services/api";
import socketService from "@/lib/services/socket";
import quizSocketService from "@/lib/services/socket/quiz";
import { toast } from "sonner";
import type {
  TeacherDashboardData,
  ProgressTrackingUpdate,
} from "@/lib/types/quiz-monitor";

// Query keys cho quiz monitoring
export const quizMonitorKeys = {
  all: ["quiz-monitor"] as const,
  dashboard: (quizId: number) =>
    [...quizMonitorKeys.all, "dashboard", quizId] as const,
};

// Hook chính để lấy teacher dashboard với TanStack Query
export function useQuizMonitorDashboard(quizId: number) {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<string[]>([]);
  const componentId = `quiz_monitor_${quizId}_${Date.now()}`;

  // Fetch dashboard data với TanStack Query
  const query = useQuery({
    queryKey: quizMonitorKeys.dashboard(quizId),
    queryFn: async () => {
      const response = await quizService.getTeacherDashboard(quizId);
      const data = response.data as TeacherDashboardData;

      // Normalize struggling_students nếu API trả về array thay vì object
      if (Array.isArray(data.struggling_students)) {
        data.struggling_students = {
          count: 0,
          critical_count: 0,
          high_count: 0,
          students: [],
        };
      }

      return data;
    },
    refetchInterval: 30000, // Refetch mỗi 30s làm fallback
    staleTime: 10000, // Data được coi là fresh trong 10s
  });

  // Kết nối socket và join teacher room
  useEffect(() => {
    socketService.connect();
    quizSocketService.joinTeacherRoom(quizId);

    return () => {
      quizSocketService.offAllQuizEvents(componentId);
    };
  }, [quizId, componentId]);

  // Lắng nghe progressTrackingUpdate event (nâng cấp)
  useEffect(() => {
    const handleProgressUpdate = (data: ProgressTrackingUpdate) => {
      // Update cache với dữ liệu mới từ socket
      queryClient.setQueryData(
        quizMonitorKeys.dashboard(quizId),
        (oldData: TeacherDashboardData | undefined) => {
          if (!oldData) return oldData;

          // Normalize struggling_students data
          const strugglingStudents = data.struggling_students?.students
            ? {
                count: data.struggling_students.count || 0,
                critical_count:
                  data.struggling_students.students.filter(
                    (s) => s.risk_level === "critical"
                  ).length || 0,
                high_count:
                  data.struggling_students.students.filter(
                    (s) => s.risk_level === "high"
                  ).length || 0,
                students: data.struggling_students.students,
              }
            : { count: 0, critical_count: 0, high_count: 0, students: [] };

          return {
            ...oldData,
            class_metrics: data.class_metrics,
            struggling_students: strugglingStudents,
            current_question_analytics: data.current_question_analytics,
            predictions: data.predictions,
            alerts: data.alerts || [],
            timestamp: data.timestamp,
          };
        }
      );
    };

    socketService.on<ProgressTrackingUpdate>(
      "progressTrackingUpdate",
      componentId,
      handleProgressUpdate
    );

    return () => {
      socketService.off("progressTrackingUpdate", componentId);
    };
  }, [quizId, componentId, queryClient]);

  // Lắng nghe sự kiện participant mới
  useEffect(() => {
    const handleNewParticipant = (data: any) => {
      const message = `${data.participant.name} đã tham gia bài kiểm tra`;
      setNotifications((prev) => [message, ...prev.slice(0, 4)]);
      toast.success(message);

      // Refetch dashboard để cập nhật số lượng participants
      queryClient.invalidateQueries({
        queryKey: quizMonitorKeys.dashboard(quizId),
      });
    };

    socketService.on("newParticipant", componentId, handleNewParticipant);

    return () => {
      socketService.off("newParticipant", componentId);
    };
  }, [quizId, componentId, queryClient]);

  // Lắng nghe sự kiện participant rời
  useEffect(() => {
    const handleParticipantLeft = (data: any) => {
      const message = `${data.participant.name} đã rời khỏi bài kiểm tra`;
      setNotifications((prev) => [message, ...prev.slice(0, 4)]);
      toast.info(message);
    };

    socketService.on("participantLeft", componentId, handleParticipantLeft);

    return () => {
      socketService.off("participantLeft", componentId);
    };
  }, [quizId, componentId]);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Manual refetch
  const refetch = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: quizMonitorKeys.dashboard(quizId),
    });
  }, [quizId, queryClient]);

  return {
    // Data từ TanStack Query
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    // Notifications
    notifications,
    clearNotifications,

    // Actions
    refetch,

    // Socket status
    isConnected: socketService.isSocketConnected(),
  };
}
