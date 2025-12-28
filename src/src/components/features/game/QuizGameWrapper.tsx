"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { motion } from "framer-motion";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import StartGame from "../../../../phaser/GameEngine";
import { EventBus } from "../../../../phaser/EventBus";
import Portal from "./Portal";
import { QuizObstacleDialog } from "./QuizObstacleDialog";
import { Button } from "@/components/ui/forms/button";
import {
  Gamepad2,
  Trophy,
  RefreshCw,
  ClipboardCheck,
  Loader2,
  X, // <-- THÊM IMPORT ICON X
} from "lucide-react";
import { QuizDetail, Question } from "@/lib/types/quiz";
import { UserInventory } from "@/lib/types/avatar"; // THÊM IMPORT
import { useQuizTimer } from "@/lib/hooks/quiz/useQuizTimer";
import { GameTimerUI } from "./GameTimerUI";
import { useQuizSocket } from "@/lib/hooks/quiz/useQuizSocket";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { quizService } from "@/lib/services/api";
import { GameLeaderboardUI } from "./GameLeaderboardUI";
import { CheckpointNotification } from "./CheckpointNotification";
import AssessmentResultsUI from "./AssessmentResultsUI";
import PracticeResultsUI from "./PracticeResultsUI"; // <- THÊM IMPORT MỚI
import { GameCoinUI } from "./GameCoinUI"; // <- THÊM IMPORT MỚI
import { GameEggUI } from "./GameEggUI"; // THÊM IMPORT MỚI
import EggOpeningUI from "./EggOpeningUI"; // THÊM IMPORT MỚI
import { GameMusicControl } from "./GameMusicControl"; // THÊM IMPORT MUSIC CONTROL
import {
  gameProgressService,
  GameProgressState,
} from "@/lib/services/game/GameProgressService";
import type {
  ChoiceStatsData,
  SocketChoiceStatsUpdate,
} from "@/lib/types/answer-choice-stats";
import quizSocketService from "@/lib/services/socket/quiz";
// MỚI: Import service và hook cần thiết
import {
  practiceRecommendationService,
  PracticeSessionSubmission,
  SubmitSessionWithEggsRequest,
} from "@/lib/services/api/practice-recommendation.service";
import { useGamification } from "@/lib/hooks/use-gamification";
import { useCurrency } from "@/lib/hooks/use-currency";
import {
  quizSessionService,
  QuizSessionData,
  SessionAnswer,
  PerformanceDataItem,
} from "@/lib/services/quiz/QuizSessionService";
import { toast } from "sonner";

let globalGameInstance: Phaser.Game | null = null;
type GameMode = "practice" | "assessment";

// Sử dụng interface từ QuizSessionService thay vì định nghĩa lại

interface QuizGameWrapperProps {
  quizData: QuizDetail;
  initialInventory?: UserInventory | null; // THÊM PROP MỚI - Optional
}

const QuizGameWrapper: React.FC<QuizGameWrapperProps> = ({
  quizData,
  initialInventory = null, // Giá trị mặc định
}) => {
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "COMPLETED">(
    "IDLE"
  );
  const [currentGameMode, setCurrentGameMode] = useState<GameMode>("practice");

  // THÊM REF ĐỂ LƯU TRỮ GIÁ TRỊ HIỆN TẠI CỦA GAME MODE
  const currentGameModeRef = useRef<GameMode>("practice");

  // MỚI: State để theo dõi số lần thử cho mỗi câu hỏi
  const [attemptCounts, setAttemptCounts] = useState<Record<number, number>>(
    {}
  );

  // THÊM WRAPPER ĐỂ THEO DÕI MỌI LẦN THAY ĐỔI currentGameMode
  const setCurrentGameModeWithDebug = (mode: GameMode) => {
    console.trace("[DEBUG] Stack trace for gameMode change:");
    setCurrentGameMode(mode);
    currentGameModeRef.current = mode; // CẬP NHẬT REF NGAY LẬP TỨC
  };
  const [completionReason, setCompletionReason] = useState<
    "finished" | "time-up" | null
  >(null);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [quizCounter, setQuizCounter] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const gameInitialized = useRef(false);

  // THÊM STATE MỚI CHO SỐ XU
  const [totalCoinValue, setTotalCoinValue] = useState(0);

  // THÊM STATE MỚI CHO SESSION ID
  const [sessionId, setSessionId] = useState<number | null>(null);
  // THAY ĐỔI 1: Tạo một ref để lưu sessionId
  const sessionIdRef = useRef<number | null>(null);

  // THÊM STATE MỚI CHO TRỨNG VÀ PHẦN THƯỞNG
  const [collectedEggs, setCollectedEggs] = useState<any[]>([]);
  const [isOpeningEggs, setIsOpeningEggs] = useState(false);
  const [eggOpeningResults, setEggOpeningResults] = useState<any[]>([]);
  const [rewardsSummary, setRewardsSummary] = useState<any>(null);

  // Tạo một ref để lưu trữ bản sao của state
  const collectedEggsRef = useRef(collectedEggs);

  // Đồng bộ ref với state
  useEffect(() => {
    collectedEggsRef.current = collectedEggs;
  }, [collectedEggs]);

  // =======================================================================
  // === GIẢI PHÁP NẰM Ở ĐÂY ===
  // =======================================================================

  // 1. Tạo một state trung gian để lưu dữ liệu khi game kết thúc
  const [completionData, setCompletionData] = useState<{
    finalCoinValue: number;
  } | null>(null);
  const [savedProgress, setSavedProgress] = useState<GameProgressState | null>(
    null
  );
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  // THAY ĐỔI 2: Thêm state để lưu trữ dữ liệu thống kê lựa chọn
  const [choiceStats, setChoiceStats] = useState<ChoiceStatsData | null>(null);

  // THAY ĐỔI 2b: State để quản lý thông báo checkpoint
  const [checkpointMessage, setCheckpointMessage] = useState<string | null>(
    null
  );

  // =======================================================================
  // === THAY ĐỔI MỚI: STATE ĐỂ LƯU KẾT QUẢ PHIÊN LÀM BÀI ===
  // =======================================================================
  const [sessionAnswers, setSessionAnswers] = useState<SessionAnswer[]>([]);

  // MỚI: State để thu thập dữ liệu performance
  const [performanceData, setPerformanceData] = useState<PerformanceDataItem[]>(
    []
  );
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // MỚI: Hooks để làm mới dữ liệu global
  const gamificationHook = useGamification();
  const currencyHook = useCurrency();
  // =======================================================================

  // --- TÍNH TOÁN ownedAvatarIds TỪ PROP ---
  const ownedAvatarIds = useMemo(() => {
    if (!initialInventory) return new Set<number>();
    const ids = new Set(
      initialInventory.avatars.map((item) => (item.Avatar || item).avatar_id)
    );
    return ids;
  }, [initialInventory]);
  // --- KẾT THÚC TÍNH TOÁN ---

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const sortedInitialQuestions = useMemo(() => {
    if (!quizData.questions) return [];
    const difficultyOrder: { [key: string]: number } = {
      Dễ: 1,
      "Trung bình": 2,
      Khó: 3,
    };
    return [...quizData.questions].sort(
      (a, b) =>
        (difficultyOrder[a.level.name] || 4) -
        (difficultyOrder[b.level.name] || 4)
    );
  }, [quizData.questions]);
  const [activeQuestionSequence, setActiveQuestionSequence] = useState<
    Question[]
  >(sortedInitialQuestions);
  const { user, loading: authLoading } = useAuthStatus();
  const sceneToLaunch = "GameplayScene";

  // MỚI: Hàm gửi kết quả phiên luyện tập với eggs
  const submitPracticeWithEggs = useCallback(async () => {
    if (!sessionStartTime || !user) return null;

    // Map egg type từ frontend sang backend format
    const eggTypeMapping: Record<string, string> = {
      BASIC_EGG: "BASIC",
      CAT_EGG: "CAT",
      DRAGON_EGG: "DRAGON",
      RAINBOW_EGG: "RAINBOW",
      LEGENDARY_EGG: "LEGENDARY",
    };

    // Tính toán performance data
    const totalQuestions = performanceData.length;
    const correctAnswers = performanceData.filter((p) => p.is_correct).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const totalTimeSeconds = Math.floor(
      performanceData.reduce((sum, p) => sum + p.response_time_ms, 0) / 1000
    );
    const score =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    const submissionData: SubmitSessionWithEggsRequest = {
      quizInfo: {
        quiz_id: quizData.quiz_id,
        session_start_time: new Date(sessionStartTime).toISOString(),
        session_end_time: new Date().toISOString(),
      },
      performanceData: {
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        total_time_seconds: totalTimeSeconds,
        score: score,
      },
      baseRewards: {
        syncoin_collected: totalCoinValue,
      },
      eggsToOpen: collectedEggs.map((egg) => ({
        egg_type: (eggTypeMapping[egg.type] || "BASIC") as
          | "BASIC"
          | "CAT"
          | "DRAGON"
          | "RAINBOW"
          | "LEGENDARY",
        is_golden: Boolean(egg.isGolden),
      })),
    };

    try {
      const response =
        await practiceRecommendationService.submitSessionWithEggs(
          submissionData
        );

      if (response.success) {
        gamificationHook.refreshData();
        currencyHook.refresh();
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to submit practice session with eggs:", error);
      toast.error("Không thể gửi kết quả phiên luyện tập");
      return null;
    }
  }, [
    sessionStartTime,
    user,
    quizData.quiz_id,
    performanceData,
    totalCoinValue,
    collectedEggs,
    gamificationHook,
    currencyHook,
  ]);

  // Hàm callback khi tất cả trứng đã được mở xong
  const handleAllEggsOpened = useCallback(async () => {
    console.log("[EggOpening] All eggs opened, transitioning to results");
    console.log("[EggOpening] Rewards summary:", rewardsSummary);
    console.log(
      "[EggOpening] Egg opening results count:",
      eggOpeningResults.length
    );

    setIsOpeningEggs(false);
    setCompletionReason("finished");
    setGameState("COMPLETED");

    // Clear progress sau khi hoàn thành
    if (user) {
      gameProgressService.clearProgress(quizData.quiz_id, user.user_id);
    }
  }, [rewardsSummary, eggOpeningResults, user, quizData.quiz_id]);

  // THÊM useEffect ĐỂ THEO DÕI THAY ĐỔI currentGameMode
  useEffect(() => {}, [currentGameMode]);

  // 2. useEffect này đã được XÓA vì logic đã được xử lý trong handleGameCompleted
  // Không cần tự động set gameState = "COMPLETED" nữa

  const handleTimeUp = () => {
    const actualGameMode = currentGameModeRef.current; // SỬ DỤNG REF
    if (gameState === "PLAYING" && actualGameMode === "assessment") {
      EventBus.emit("time-up");
      setCompletionReason("time-up");
      setGameState("COMPLETED");
    }
  };

  const { quizTimeLeft, formatTime, updateTimeLeft } = useQuizTimer({
    quizId: quizData.quiz_id,
    quizCompleted: gameState === "COMPLETED",
    onTimeUp: handleTimeUp,
    initialDurationInMinutes: quizData.duration,
    enabled: currentGameMode === "assessment", // GIỮ NGUYÊN STATE CHO HOOK NÀY
  });

  useEffect(() => {
    if (user) {
      const progress = gameProgressService.loadProgress(
        quizData.quiz_id,
        user.user_id
      );
      setSavedProgress(progress);
      if (progress) {
        setTotalCoinValue(progress.totalCoinValue || 0); // <- Load đúng thuộc tính
      }
      setIsLoadingProgress(false);
    } else if (!authLoading) {
      setIsLoadingProgress(false);
    }
  }, [user, quizData.quiz_id, authLoading]);

  useEffect(() => {
    if (
      savedProgress &&
      savedProgress.gameMode === "assessment" &&
      savedProgress.quizTimeLeft
    ) {
      updateTimeLeft(savedProgress.quizTimeLeft);
    }
  }, [savedProgress, updateTimeLeft]);

  useEffect(() => {
    const handleProgressUpdate = (progressData: any) => {
      if (user && gameState === "PLAYING") {
        const actualGameMode = currentGameModeRef.current; // SỬ DỤNG REF
        gameProgressService.saveProgress({
          quizId: quizData.quiz_id,
          userId: user.user_id,
          gameMode: actualGameMode,
          quizTimeLeft: quizTimeLeft,
          ...progressData,
        });
      }
    };

    EventBus.on("save-progress", handleProgressUpdate);
    return () => {
      EventBus.off("save-progress", handleProgressUpdate);
    };
  }, [user, quizData.quiz_id, gameState, quizTimeLeft]); // BỎ currentGameMode KHỎI DEPENDENCIES

  useEffect(() => {
    const handleBeforeUnload = () => {
      EventBus.emit("request-save-before-unload");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const goBackToMenu = async () => {
    // THAY ĐỔI 3: Đọc từ ref
    if (currentGameModeRef.current === "practice" && sessionIdRef.current) {
      try {
        await practiceRecommendationService.endIndividualSession({
          session_id: sessionIdRef.current,
          reason: "user_quit",
        });
        toast.info("Đã kết thúc phiên luyện tập.");
      } catch (error) {
        console.error("Error ending session on exit:", error);
        // Vẫn cho người dùng thoát dù có lỗi
      }
    }
    router.push("/dashboard");
  };

  const startGame = useCallback(
    async (mode: GameMode) => {
      // Thêm async
      // =======================================================================
      // === RESET LỊCH SỬ CÂU TRẢ LỜI KHI BẮT ĐẦU GAME MỚI ===
      // =======================================================================
      setSessionAnswers([]);
      // MỚI: Reset performance data và set thời gian bắt đầu
      setPerformanceData([]);
      setAttemptCounts({}); // MỚI: Reset số lần thử
      setSessionStartTime(Date.now());
      // =======================================================================

      // --- LOGIC MỚI: BẮT ĐẦU SESSION TRƯỚC KHI VÀO GAME ---
      if (mode === "practice") {
        try {
          const response =
            await practiceRecommendationService.startIndividualSession({
              quiz_id: quizData.quiz_id,
              session_type: "individual",
            });
          if (response.success) {
            const newSessionId = response.data.session_info.session_id;
            // THAY ĐỔI 2: Cập nhật cả state và ref
            setSessionId(newSessionId);
            sessionIdRef.current = newSessionId;
            toast.success("Phiên luyện tập đã bắt đầu!");
          } else {
            toast.error(
              response.message || "Không thể bắt đầu phiên luyện tập."
            );
            goBackToMenu(); // Quay về nếu không start được
            return;
          }
        } catch (error: any) {
          // Xử lý trường hợp đã có session đang diễn ra
          if (
            error?.response?.status === 400 &&
            error?.response?.data?.data?.existing_session_id
          ) {
            const existingSessionId =
              error.response.data.data.existing_session_id;
            setSessionId(existingSessionId);
            sessionIdRef.current = existingSessionId;
            toast.info("Tiếp tục phiên luyện tập đang diễn ra");
          } else {
            console.error("Error starting practice session:", error);
            toast.error(
              error instanceof Error
                ? error.message
                : "Lỗi khi bắt đầu phiên luyện tập."
            );
            goBackToMenu();
            return;
          }
        }
      }
      // --- KẾT THÚC LOGIC MỚI ---

      const progressToLoad =
        savedProgress && savedProgress.gameMode === mode ? savedProgress : null;

      if (progressToLoad) {
        setActiveQuestionSequence(progressToLoad.activeQuestionSequence);
      } else {
        setActiveQuestionSequence(sortedInitialQuestions);
      }

      setCurrentGameModeWithDebug(mode);

      const debugChunkName = searchParams.get("debugChunk");
      if (debugChunkName) {
        console.warn(
          `[DEBUG MODE] Forcing first chunk to be: "${debugChunkName}"`
        );
      }

      const sceneData = {
        quizData,
        gameMode: mode,
        debugChunkName: debugChunkName,
        user: user,
        savedProgress: progressToLoad,
      };

      if (!gameInitialized.current) {
        gameInitialized.current = true;
        globalGameInstance = StartGame("game-container");
        EventBus.once("game-ready", () => {
          globalGameInstance?.scene.start(sceneToLaunch, sceneData);
        });
      } else {
        globalGameInstance?.scene
          .getScene(sceneToLaunch)
          ?.scene.restart(sceneData);
      }
      setGameState("PLAYING");
    },
    [
      quizData,
      savedProgress,
      searchParams,
      sortedInitialQuestions,
      user,
      sessionId,
    ] // Thêm sessionId vào dependencies
  );

  // =======================================================================
  // THAY ĐỔI: Logic tự động bắt đầu game dựa trên URL
  // =======================================================================
  useEffect(() => {
    // THÊM DEBUG LOG ĐỂ KIỂM TRA URL VÀ PATHNAME

    // Chờ cho đến khi kiểm tra tiến trình hoàn tất và game sẵn sàng bắt đầu
    if (isLoadingProgress || gameState !== "IDLE" || gameInitialized.current) {
      return;
    }

    // Ưu tiên 1: Khôi phục từ tiến trình đã lưu
    if (savedProgress) {
      startGame(savedProgress.gameMode);
      return; // Thoát sau khi bắt đầu
    }

    // Ưu tiên 2: Kiểm tra URL để xác định chế độ
    if (pathname.includes("quiz-practice")) {
      startGame("practice");
    } else if (pathname.includes("quiz-game")) {
      startGame("assessment");
    } else {
    }
  }, [isLoadingProgress, savedProgress, pathname, gameState, startGame]);

  // =======================================================================
  // === THÊM LOGIC LƯU TRỮ VÀ KHÔI PHỤC DỮ LIỆU QUIZ SESSION ===
  // =======================================================================

  // Tự động lưu dữ liệu session khi có thay đổi
  useEffect(() => {
    if (!user || !sessionStartTime || gameState !== "PLAYING") return;

    const sessionData = {
      quizId: quizData.quiz_id,
      userId: user.user_id,
      gameMode: currentGameModeRef.current,
      sessionStartTime,
      sessionAnswers,
      performanceData,
      totalCoinValue,
      collectedEggs,
      eggOpeningResults,
    };

    // Lưu dữ liệu session với debounce để tránh lưu quá thường xuyên
    const timeoutId = setTimeout(() => {
      quizSessionService.saveSession(sessionData);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [
    user,
    sessionStartTime,
    sessionAnswers,
    performanceData,
    totalCoinValue,
    collectedEggs,
    eggOpeningResults,
    gameState,
    quizData.quiz_id,
  ]);

  // Khôi phục dữ liệu session khi component mount
  useEffect(() => {
    if (!user || gameState !== "IDLE") return;

    const savedSession = quizSessionService.loadSession(
      quizData.quiz_id,
      user.user_id
    );
    if (savedSession) {
      // Khôi phục các state từ session đã lưu
      setSessionStartTime(savedSession.sessionStartTime);
      setSessionAnswers(savedSession.sessionAnswers);
      setPerformanceData(savedSession.performanceData);
      setTotalCoinValue(savedSession.totalCoinValue);
      setCollectedEggs(savedSession.collectedEggs);
      setEggOpeningResults(savedSession.eggOpeningResults || []);

      // Cập nhật game mode nếu cần
      if (savedSession.gameMode !== currentGameMode) {
        setCurrentGameModeWithDebug(savedSession.gameMode);
      }
    }
  }, [
    user,
    gameState,
    quizData.quiz_id,
    currentGameMode,
    setCurrentGameModeWithDebug,
  ]);

  // Xóa dữ liệu session khi game hoàn thành thành công
  useEffect(() => {
    if (gameState === "COMPLETED" && user && completionReason === "finished") {
      // Delay một chút để đảm bảo dữ liệu đã được submit thành công
      const timeoutId = setTimeout(() => {
        quizSessionService.clearSession(quizData.quiz_id, user.user_id);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [gameState, user, completionReason, quizData.quiz_id]);
  // =======================================================================

  const { userPosition, totalParticipants, updateUserPosition } = useQuizSocket(
    {
      quizId: quizData.quiz_id,
      user: currentGameMode === "assessment" ? user : null, // GIỮ NGUYÊN STATE CHO HOOK NÀY
      questionsLength: activeQuestionSequence.length,
    }
  );

  useEffect(() => {
    const actualGameMode = currentGameModeRef.current; // SỬ DỤNG REF
    if (actualGameMode !== "assessment" || !user) {
      return;
    }

    const listenerId = `choice-stats-wrapper-${quizData.quiz_id}`;

    quizSocketService.joinQuizWithRole({
      quiz_id: quizData.quiz_id,
      user_id: user.user_id,
      role: "student",
    });

    const handleStatsUpdate = (data: SocketChoiceStatsUpdate) => {
      if (currentQuestion && data.question_id === currentQuestion.question_id) {
        setChoiceStats({
          quiz_id: data.quiz_id,
          question_id: data.question_id,
          choice_stats: data.choice_stats,
          total_responses: Object.values(data.choice_stats).reduce(
            (sum, stat) => sum + stat.count,
            0
          ),
          last_updated: data.timestamp,
        });
      }
    };

    quizSocketService.onChoiceStatsUpdate(
      quizData.quiz_id,
      listenerId,
      handleStatsUpdate
    );

    return () => {
      quizSocketService.offEvent("choiceStatsUpdate", listenerId);
    };
  }, [user, quizData.quiz_id, currentQuestion]); // BỎ currentGameMode KHỎI DEPENDENCIES

  const restartGame = () => {
    startGame(currentGameMode);
  };
  useEffect(() => {
    const handleRequestQuiz = async (data: { gateId: number }) => {
      if (data.gateId < activeQuestionSequence.length) {
        const nextQuestion = activeQuestionSequence[data.gateId];
        setCurrentQuestion(nextQuestion);

        // SỬ DỤNG REF THAY VÌ STATE ĐỂ ĐẢM BẢO GIÁ TRỊ HIỆN TẠI
        const actualGameMode = currentGameModeRef.current;

        if (actualGameMode === "assessment") {
          try {
            const response = await quizService.getQuestionChoiceStats(
              quizData.quiz_id,
              nextQuestion.question_id
            );

            // THÊM LOG CHI TIẾT VỀ RAW RESPONSE

            if (response.success) {
              setChoiceStats(response.data);
            } else {
              console.warn("[DEBUG] API returned success=false:", response);
              setChoiceStats(null);
            }
          } catch (error) {
            console.error("Lỗi khi tải thống kê lựa chọn ban đầu:", error);
            console.error("[DEBUG] Full error object:", error);
            setChoiceStats(null);
          }
        } else {
          setChoiceStats(null);
        }

        setQuestionStartTime(Date.now());
        setQuizCounter((prev) => prev + 1);
        setShowQuizDialog(true);
      }
    };

    // =======================================================================
    // === THAY ĐỔI: GỌI API BACKEND ĐỂ ĐẬP TRỨNG ===
    // =======================================================================
    const handleGameCompleted = async (data: { finalCoinValue: number }) => {
      setCompletionData(data);
      setTotalCoinValue(data.finalCoinValue);

      if (currentGameModeRef.current === "practice") {
        // Gọi API backend để submit kết quả và đập trứng
        const result = await submitPracticeWithEggs();

        if (result) {
          // Lưu kết quả từ backend
          setEggOpeningResults(result.egg_opening_results);
          setRewardsSummary(result.rewards_summary);

          // Nếu có trứng, hiển thị màn hình mở trứng
          if (collectedEggsRef.current.length > 0) {
            setIsOpeningEggs(true);
          } else {
            // Không có trứng, hiện kết quả luôn
            setCompletionReason("finished");
            setGameState("COMPLETED");

            // Clear progress
            if (user) {
              gameProgressService.clearProgress(quizData.quiz_id, user.user_id);
            }
          }
        } else {
          // Lỗi khi submit, vẫn cho phép xem kết quả
          setCompletionReason("finished");
          setGameState("COMPLETED");
        }
      } else {
        // Assessment mode - không có trứng
        setCompletionReason("finished");
        setGameState("COMPLETED");
      }
    };
    // =======================================================================

    const handleAddDynamicQuestion = (newQuestion: Question) => {
      setActiveQuestionSequence((prevSequence) => [
        ...prevSequence,
        newQuestion,
      ]);
    };

    const handleCheckpointReached = (data: { message: string }) => {
      if (currentGameModeRef.current === "practice") {
        // SỬ DỤNG REF
        setCheckpointMessage(data.message);
        setTimeout(() => setCheckpointMessage(null), 3000);
      }
    };

    // THÊM HÀM NÀY: Xử lý sự kiện khi bắt đầu vòng làm lại câu sai
    const handleReviewRoundStarted = (data: { message: string }) => {
      if (currentGameModeRef.current === "assessment") {
        // SỬ DỤNG REF
        setCheckpointMessage(data.message);
        // Ẩn sau 3 giây
        setTimeout(() => setCheckpointMessage(null), 3000);
      }
    };

    // THÊM LISTENER MỚI
    const handleCoinValueUpdate = (data: { newTotalValue: number }) => {
      setTotalCoinValue(data.newTotalValue);
    };

    // Lắng nghe sự kiện nhặt trứng từ Phaser
    const handleEggCollected = (data: { newCollectedEggs: any[] }) => {
      setCollectedEggs(data.newCollectedEggs);
    };

    EventBus.on("request-quiz", handleRequestQuiz);
    EventBus.on("game-completed", handleGameCompleted);
    EventBus.on("add-dynamic-question", handleAddDynamicQuestion);
    EventBus.on("checkpoint-reached", handleCheckpointReached);
    EventBus.on("review-round-started", handleReviewRoundStarted); // LẮNG NGHE SỰ KIỆN MỚI
    EventBus.on("coin-value-updated", handleCoinValueUpdate); // <- LẮNG NGHE EVENT MỚI
    EventBus.on("egg-collected", handleEggCollected); // THÊM LISTENER CHO TRỨNG

    return () => {
      EventBus.off("request-quiz", handleRequestQuiz);
      EventBus.off("game-completed", handleGameCompleted);
      EventBus.off("add-dynamic-question", handleAddDynamicQuestion);
      EventBus.off("checkpoint-reached", handleCheckpointReached);
      EventBus.off("review-round-started", handleReviewRoundStarted); // HỦY LẮNG NGHE SỰ KIỆN MỚI
      EventBus.off("coin-value-updated", handleCoinValueUpdate); // <- HỦY LẮNG NGHE
      EventBus.off("egg-collected", handleEggCollected); // HỦY LISTENER CHO TRỨNG
    };
  }, [user, quizData.quiz_id, activeQuestionSequence, submitPracticeWithEggs]);

  const handleAnswer = async (selectedAnswerId: number, isCorrect: boolean) => {
    setShowQuizDialog(false);
    const actualGameMode = currentGameModeRef.current; // SỬ DỤNG REF
    const responseTime = Date.now() - questionStartTime;

    // =======================================================================
    // === THAY ĐỔI: LƯU KẾT QUẢ VÀO STATE CỦA PHIÊN LÀM BÀI ===
    // =======================================================================
    if (currentQuestion) {
      // THAY ĐỔI: Ghi lại số lần thử
      const questionId = currentQuestion.question_id;
      const currentAttempts = (attemptCounts[questionId] || 0) + 1;
      setAttemptCounts((prev) => ({ ...prev, [questionId]: currentAttempts }));

      if (actualGameMode === "assessment") {
        setSessionAnswers((prev) => [
          ...prev,
          {
            question: currentQuestion,
            selectedAnswerId: selectedAnswerId,
            isCorrect,
            attempt_number: currentAttempts, // THÊM SỐ LẦN THỬ
          },
        ]);
      }

      // THAY ĐỔI: Luôn thêm entry mới cho mỗi lần thử thay vì cập nhật
      setPerformanceData((prevData) => {
        return [
          ...prevData,
          {
            question_id: questionId,
            is_correct: isCorrect,
            response_time_ms: responseTime,
            attempts: 1, // 'attempts' trong data này giờ chỉ là 1
            attempt_number: currentAttempts, // THÊM SỐ LẦN THỬ
          },
        ];
      });
    }
    // =======================================================================

    if (actualGameMode === "assessment" && currentQuestion && user) {
      try {
        await quizService.submitRealtimeAnswer(
          quizData.quiz_id,
          currentQuestion.question_id,
          selectedAnswerId,
          questionStartTime,
          user.user_id,
          true
        );
        await updateUserPosition();
      } catch (error) {
        console.error("Lỗi khi gửi đáp án:", error);
      }
    }
    EventBus.emit("quiz-result", {
      correct: isCorrect,
      timeLeft: quizTimeLeft,
    });
  };

  useEffect(() => {
    return () => {
      if (globalGameInstance) {
        globalGameInstance.destroy(true);
        globalGameInstance = null;
        gameInitialized.current = false;
      }
    };
  }, []);

  if (authLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-800">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <span>Đang xác thực người dùng...</span>
      </div>
    );
  }

  if (isLoadingProgress) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-800">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <span>Đang kiểm tra tiến trình...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-slate-800">
      {/* THÊM: Music Control */}
      {gameState === "PLAYING" && <GameMusicControl />}

      {/* Các HUD khác giữ nguyên */}
      {gameState === "PLAYING" && currentGameModeRef.current === "practice" && (
        <>
          <GameCoinUI totalCoinValue={totalCoinValue} />
          <GameEggUI collectedEggs={collectedEggs} />
        </>
      )}
      {gameState === "PLAYING" &&
        currentGameModeRef.current === "assessment" && (
          <>
            <GameTimerUI timeLeft={quizTimeLeft} formatTime={formatTime} />
            <GameLeaderboardUI
              position={userPosition}
              total={totalParticipants}
            />
          </>
        )}

      {/* Game Container */}
      <div
        id="game-container"
        className={`absolute inset-0 w-full h-full ${
          gameState !== "IDLE" ? "visible" : "invisible"
        }`}
      />

      {/* Các màn hình trạng thái khác */}
      {gameState === "IDLE" && (
        <div className="w-full h-full flex flex-col items-center justify-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <span>Đang tải trò chơi...</span>
        </div>
      )}
      {/* Ưu tiên hiển thị màn đập trứng trước */}
      {isOpeningEggs ? (
        <EggOpeningUI
          eggsToOpen={collectedEggs}
          eggOpeningResults={eggOpeningResults}
          onComplete={handleAllEggsOpened}
        />
      ) : gameState === "COMPLETED" ? (
        <>
          {currentGameModeRef.current === "assessment" ? (
            <AssessmentResultsUI
              className="absolute inset-0 z-[1500]"
              quizName={quizData.name}
              onBackToMenu={goBackToMenu}
              sessionAnswers={sessionAnswers}
              performanceData={performanceData}
            />
          ) : (
            <PracticeResultsUI
              onBackToMenu={goBackToMenu}
              rewardsSummary={
                rewardsSummary || {
                  total_exp_earned: 0,
                  total_syncoin_earned: totalCoinValue,
                  syncoin_from_gameplay: totalCoinValue,
                  syncoin_from_duplicates: 0,
                }
              }
              eggOpeningResults={eggOpeningResults}
            />
          )}
        </>
      ) : null}

      {/* Portal cho các dialog VÀ nút thoát */}
      <Portal>
        {/*
          THAY ĐỔI: Thêm điều kiện `currentGameModeRef.current === "practice"`
          để nút "X" chỉ hiển thị trong chế độ luyện tập.
        */}
        {gameState !== "IDLE" && currentGameModeRef.current === "practice" && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            onClick={goBackToMenu}
            className="fixed top-4 right-4 z-[1600] pointer-events-auto cursor-pointer w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-b from-red-200 to-red-50/90 border-2 border-b-4 border-red-400 transition-all duration-150 ease-out hover:from-red-300 hover:to-red-100/90 hover:border-red-500 active:translate-y-1 active:border-b-2"
            aria-label="Thoát luyện tập"
            title="Thoát luyện tập"
          >
            <X className="h-6 w-6 text-red-800" />
          </motion.div>
        )}

        {/* Các dialog khác giữ nguyên */}
        <CheckpointNotification
          isVisible={checkpointMessage !== null}
          message={checkpointMessage || ""}
          duration={3000}
        />
        {gameState === "PLAYING" && currentQuestion && (
          <QuizObstacleDialog
            key={quizCounter}
            isVisible={showQuizDialog}
            question={currentQuestion}
            onAnswer={handleAnswer}
            gameMode={currentGameModeRef.current}
            choiceStats={choiceStats}
          />
        )}
      </Portal>
    </div>
  );
};
export default QuizGameWrapper;
