"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ParticipantList,
  QuizPinDisplay,
} from "@/components/features/quiz/waiting-room";
import { EmojiDrawer } from "@/components/features/quiz/waiting-room/emoji-drawer";
import { ParticipantEmoji } from "@/components/features/quiz/waiting-room/participant-list";
import { useQuizRealtime } from "@/lib/hooks/use-quiz-realtime";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { useQuizDetail } from "@/lib/hooks/use-teaching";
import quizService from "@/lib/services";
import { emojiService } from "@/lib/services/api/emoji.service";
import { HelpCircle, X, Loader2, Smile } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/forms";
import { hasRole } from "@/lib/auth/role-manager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/feedback";

const QuizWaitingRoomPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const quizId = parseInt(id as string, 10);
  const { isAuthenticated } = useAuthStatus();
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showEmojiDrawer, setShowEmojiDrawer] = useState(false);
  const [participantEmojis, setParticipantEmojis] = useState<
    ParticipantEmoji[]
  >([]);

  // Sử dụng useQuizDetail hook thay vì manual fetch
  const {
    data: quiz,
    isLoading: loading,
    error: quizError,
  } = useQuizDetail(quizId);

  // Xác định người dùng là giáo viên hay học sinh
  const isTeacher = isAuthenticated() && hasRole(["teacher", "Teacher"]);
  const isStudent = isAuthenticated() && hasRole(["student", "Student"]);

  // Sử dụng hook realtime để lấy danh sách người tham gia
  const {
    participants: realtimeParticipants,
    isConnected,
    error,
    joinWaitingRoom,
    reloadParticipants,
    quizStarted,
    emojiEvents,
  } = useQuizRealtime(quizId, isTeacher);

  // Kết hợp danh sách người tham gia
  const participants = useMemo(() => {
    return realtimeParticipants;
  }, [realtimeParticipants]);

  // Xử lý khi quiz bắt đầu
  useEffect(() => {
    if (quizStarted) {
      if (!isTeacher) {
        // Học sinh chuyển đến trang làm bài
        toast.success("Bài kiểm tra đã bắt đầu!");
        router.push(`/quiz-game/${quizId}`);
      } else {
        // Giáo viên chuyển đến trang theo dõi
        toast.success("Bài kiểm tra đã bắt đầu! Chuyển đến trang theo dõi...");
        router.push(`/quiz-monitor/${quizId}`);
      }
    }
  }, [quizStarted, quizId, router, isTeacher]);

  // Thêm useEffect để gọi reload participants khi cần
  useEffect(() => {
    if (isTeacher && quizId && isConnected) {
      reloadParticipants();
    }
  }, [isTeacher, quizId, isConnected, reloadParticipants]);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (quizError) {
      console.error("Lỗi khi lấy thông tin quiz:", quizError);
      toast.error("Không thể tải thông tin bài kiểm tra");
    }
  }, [quizError]);

  // Xử lý emoji events từ socket
  useEffect(() => {
    if (emojiEvents.length > 0) {
      const latestEmoji = emojiEvents[emojiEvents.length - 1];

      console.log("Received emoji event from socket:", latestEmoji);

      // Kiểm tra xem có emoji_image không
      if (!latestEmoji.emoji_image) {
        console.warn(
          "Emoji event missing emoji_image field. Backend needs to include emoji_image_path in socket event."
        );
        return;
      }

      // Thêm emoji vào danh sách hiển thị
      const newEmoji: ParticipantEmoji = {
        userId: latestEmoji.user_id,
        emojiImagePath: latestEmoji.emoji_image,
        emojiName: latestEmoji.emoji_name,
      };

      setParticipantEmojis((prev) => {
        // Xóa emoji cũ của user này nếu có
        const filtered = prev.filter((pe) => pe.userId !== newEmoji.userId);
        return [...filtered, newEmoji];
      });

      // Tự động xóa emoji sau 5 giây
      setTimeout(() => {
        setParticipantEmojis((prev) =>
          prev.filter((pe) => pe.userId !== newEmoji.userId)
        );
      }, 5000);
    }
  }, [emojiEvents]);

  // Kiểm tra quiz status và chuyển hướng nếu cần
  useEffect(() => {
    if (quiz?.quiz?.status === "active" && !isTeacher) {
      // Nếu quiz đã active, chỉ học sinh chuyển hướng sang trang quiz-live hoặc quiz-game
      const handleActiveQuiz = async () => {
        try {
          // Gọi API để tham gia lại quiz nếu cần
          const joinResponse = await quizService.joinQuiz(quizId, {
            pin: quiz.quiz.pin || "",
          });

          // Nếu có thông tin về tiến độ làm bài, chuyển hướng tới quiz-live
          if (joinResponse.session && joinResponse.progress) {
            toast.success(
              "Bài kiểm tra đang diễn ra, đang chuyển đến bài làm..."
            );
          }

          router.push(`/quiz-game/${quizId}`);
        } catch (joinError) {
          console.error("Lỗi khi tham gia lại quiz:", joinError);
          // Vẫn chuyển hướng nếu quiz đang active
          router.push(`/quiz-game/${quizId}`);
        }
      };

      handleActiveQuiz();
    }
  }, [quiz?.quiz?.status, isTeacher, quizId, router]);

  // Thêm useEffect để gọi joinWaitingRoom khi socket đã kết nối
  useEffect(() => {
    if (isConnected) {
      joinWaitingRoom();
    }
  }, [isConnected, joinWaitingRoom]);

  // Xử lý bắt đầu bài kiểm tra (chỉ dành cho giáo viên)
  const handleStartQuiz = async () => {
    try {
      // Bắt đầu bài kiểm tra
      await quizService.startQuiz(quizId);

      // Gọi API để tự động chạy tất cả các câu hỏi
      //await quizService.startAutoQuiz(quizId);
    } catch (err) {
      toast.error("Không thể bắt đầu bài kiểm tra");
      console.error(err);
    }
  };

  const handleBackToDashboard = async () => {
    if (!isTeacher) {
      // Hiển thị dialog xác nhận cho học sinh
      setShowLeaveDialog(true);
    } else {
      // Giáo viên không cần xác nhận, chuyển hướng về trang quiz list
      router.push("/dashboard/teaching/quizzes/list");
    }
  };

  const handleLeaveRoom = async () => {
    try {
      // Gọi API rời phòng
      await quizService.leaveQuiz(quizId);
      toast.success("Bạn đã rời khỏi phòng chờ");
      // Chuyển hướng về dashboard - phân biệt teacher và student
      if (isTeacher) {
        router.push("/dashboard/teaching/quizzes/list");
      } else {
        // Học sinh quay về dashboard
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Lỗi khi rời phòng:", error);
      toast.error("Không thể rời phòng. Vui lòng thử lại.");
    }
  };

  const handleEmojiSelect = async (emojiTypeId: number) => {
    try {
      // Lấy thông tin emoji từ inventory trước
      const emojiInventory = await emojiService.getEmojiCollection();
      const selectedEmoji = emojiInventory.find(
        (item) => item.emoji.emoji_type_id === emojiTypeId
      );

      if (!selectedEmoji) {
        toast.error("Không tìm thấy emoji");
        return;
      }

      const result = await emojiService.sendEmojiRealtime({
        emoji_type_id: emojiTypeId,
        quiz_id: quizId,
      });

      console.log("Emoji sent result:", result);

      // Response format: { success, message, data: { user_id, emoji_type_id, emoji_code, emoji_name, timestamp } }
      if (result && result.user_id) {
        // Thêm emoji vào danh sách hiển thị
        const newEmoji: ParticipantEmoji = {
          userId: result.user_id,
          emojiImagePath: selectedEmoji.emoji.emoji_image_path,
          emojiName: result.emoji_name,
        };

        console.log("Adding emoji to display:", newEmoji);

        setParticipantEmojis((prev) => {
          // Xóa emoji cũ của user này nếu có
          const filtered = prev.filter((pe) => pe.userId !== newEmoji.userId);
          const updated = [...filtered, newEmoji];
          console.log("Updated participant emojis:", updated);
          return updated;
        });

        // Tự động xóa emoji sau 5 giây
        setTimeout(() => {
          setParticipantEmojis((prev) =>
            prev.filter((pe) => pe.userId !== newEmoji.userId)
          );
        }, 5000);

        toast.success("Đã gửi emoji!");
      } else {
        console.warn("Unexpected response format:", result);
        toast.success("Đã gửi emoji!");
      }
    } catch (error) {
      console.error("Error sending emoji:", error);
      toast.error("Không thể gửi emoji");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mx-auto" />
          <span className="mt-4 text-base sm:text-lg">
            Đang tải phòng chờ...
          </span>
        </div>
      </div>
    );
  }

  // Hiển thị màn hình connecting khi chưa kết nối
  if (!isConnected && !error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mx-auto" />
          <span className="mt-4 text-base sm:text-lg">
            Đang kết nối với máy chủ...
          </span>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="mt-4 text-xl font-bold">
            Không tìm thấy bài kiểm tra
          </h2>
          <p className="mt-2 text-muted-foreground">
            Bài kiểm tra không tồn tại hoặc bạn không có quyền truy cập
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      {/* Dialog xác nhận rời phòng */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn muốn rời khỏi phòng chờ?</DialogTitle>
            <DialogDescription>
              Nếu bạn rời khỏi phòng chờ, bạn sẽ không thể tham gia bài kiểm tra
              này khi nó bắt đầu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLeaveDialog(false)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeaveRoom}
              className="cursor-pointer"
            >
              Rời phòng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nút thoát đặt ở ngoài container để không bị ảnh hưởng bởi max-width */}
      <div className="absolute top-6 right-6 z-20">
        <div className="relative flex items-center justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBackToDashboard}
            className="rounded-full h-12 w-12 border-2 border-gray-200 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all cursor-pointer"
            aria-label={isTeacher ? "Quay lại" : "Rời phòng"}
            title={isTeacher ? "Quay lại trang chủ" : "Rời khỏi phòng chờ"}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto py-6 sm:py-10 md:py-16 px-4">
        <QuizPinDisplay
          pin={quiz?.quiz?.pin || "Không có mã PIN"}
          quizName={quiz?.quiz?.name}
          onStartQuiz={handleStartQuiz}
          disabled={
            quiz?.quiz?.status !== "pending" || participants.length === 0
          }
        />

        <ParticipantList
          participants={participants}
          participantEmojis={participantEmojis}
        />

        {error && (
          <div className="mt-4 p-3 sm:p-4 bg-red-100 text-red-800 rounded-md text-sm sm:text-base">
            Lỗi kết nối: {error}
          </div>
        )}
      </div>

      {/* Nút mở kho emoji - chỉ hiển thị cho học sinh */}
      {isStudent && (
        <div className="fixed bottom-6 right-6 z-30">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowEmojiDrawer(true)}
            className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all cursor-pointer bg-background"
            title="Mở kho emoji"
          >
            <Smile className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Emoji Drawer */}
      <EmojiDrawer
        isOpen={showEmojiDrawer}
        onClose={() => setShowEmojiDrawer(false)}
        onEmojiSelect={handleEmojiSelect}
      />
    </div>
  );
};

export default QuizWaitingRoomPage;
