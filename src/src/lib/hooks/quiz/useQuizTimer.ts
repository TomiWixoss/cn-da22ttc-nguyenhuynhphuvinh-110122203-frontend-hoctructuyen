import { useState, useEffect, useCallback } from "react";
import quizService from "@/lib/services";

interface UseQuizTimerProps {
  quizId: number;
  quizCompleted: boolean;
  onTimeUp: () => void;
  onTimeChange?: (timeLeft: number) => void;
  initialTimeLeft?: number;
  initialDurationInMinutes?: number; // Thêm prop này
  enabled?: boolean; // Thêm prop enabled
}

interface UseQuizTimerReturn {
  quizTimeLeft: number;
  formatTime: (seconds: number) => string;
  updateTimeLeft: (timeLeft: number) => void;
}

export const useQuizTimer = ({
  quizId,
  quizCompleted,
  onTimeUp,
  onTimeChange,
  initialTimeLeft,
  initialDurationInMinutes, // Thêm prop này
  enabled = true, // Mặc định enabled là true
}: UseQuizTimerProps): UseQuizTimerReturn => {
  const [quizTimeLeft, setQuizTimeLeft] = useState<number>(
    initialTimeLeft ??
      (initialDurationInMinutes ? initialDurationInMinutes * 60 : 3600)
  );

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (onTimeChange) {
      onTimeChange(quizTimeLeft);
    }
  }, [quizTimeLeft, onTimeChange]);

  useEffect(() => {
    // Nếu đã có thời gian ban đầu từ props, không cần fetch API
    if (
      initialDurationInMinutes !== undefined ||
      initialTimeLeft !== undefined
    ) {
      return;
    }

    const fetchQuizTime = async () => {
      try {
        const response = await quizService.getQuizById(quizId);
        const durationInMinutes = parseInt(
          response.data?.quiz?.duration || response.data?.duration || "60"
        );
        const durationInSeconds = durationInMinutes * 60;
        setQuizTimeLeft(durationInSeconds);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin quiz:", err);
        setQuizTimeLeft(3600);
      }
    };

    fetchQuizTime();
  }, [quizId, initialTimeLeft, initialDurationInMinutes]);

  useEffect(() => {
    if (quizTimeLeft <= 0 || quizCompleted || !enabled) return;

    const timer = setInterval(() => {
      setQuizTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizTimeLeft, quizCompleted, onTimeUp, enabled]);

  const updateTimeLeft = useCallback((newTimeLeft: number) => {
    setQuizTimeLeft(newTimeLeft);
  }, []);

  return {
    quizTimeLeft,
    formatTime,
    updateTimeLeft,
  };
};
