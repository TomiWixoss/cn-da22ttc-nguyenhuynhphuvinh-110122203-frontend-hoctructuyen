"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation";
import { RefreshCw, XCircle, Eye, X } from "lucide-react";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { hasRole } from "@/lib/auth/role-manager";
import { toast } from "sonner";
import { useQuizMonitorDashboard } from "@/lib/hooks/use-quiz-monitor";
import { useQuizRealtime } from "@/lib/hooks/use-quiz-realtime";
import {
  StrugglingStudentsList,
  CurrentQuestionAnalytics,
} from "@/components/features/quiz-monitor";
import {
  QuizStatusChart,
  ScoreDistributionChart,
  RealtimeLeaderboard,
  QuizProgressChart,
} from "@/components/features/charts";

const QuizMonitorPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const quizId = parseInt(id as string, 10);
  const { isAuthenticated } = useAuthStatus();

  // Kiểm tra quyền giáo viên
  const isTeacher = isAuthenticated() && hasRole(["teacher", "Teacher"]);

  // Sử dụng hook mới với TanStack Query
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    notifications,
    clearNotifications,
    refetch,
    isConnected,
  } = useQuizMonitorDashboard(quizId);

  // Vẫn sử dụng hook cũ để lấy danh sách participants chi tiết
  const { participants, reloadParticipants } = useQuizRealtime(quizId, true);

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (!isLoading && !isTeacher) {
      toast.error("Bạn không có quyền truy cập trang này");
      router.push("/dashboard");
    }
  }, [isTeacher, isLoading, router]);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (isError) {
      console.error("Lỗi khi lấy dashboard:", error);
      toast.error("Không thể tải dữ liệu dashboard");
    }
  }, [isError, error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
          <span className="mt-4 text-lg">Đang tải dashboard...</span>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-bold">
            Không tìm thấy dữ liệu dashboard
          </h2>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Quay lại Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const {
    quiz_info,
    participants_summary,
    struggling_students,
    current_question_analytics,
  } = dashboardData;

  return (
    <div className="relative min-h-screen">
      {/* Nút X bo tròn ở góc trên bên phải */}
      <div className="absolute top-6 right-6 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/dashboard")}
          className="rounded-full h-12 w-12 border-2 border-gray-200 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all cursor-pointer"
          aria-label="Đóng"
          title="Quay lại dashboard"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pr-16">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{quiz_info.name}</h1>
              <Badge
                className={
                  quiz_info.status === "active"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
                    : quiz_info.status === "pending"
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                }
              >
                {quiz_info.status === "active"
                  ? "Đang diễn ra"
                  : quiz_info.status === "pending"
                  ? "Chờ bắt đầu"
                  : "Đã kết thúc"}
              </Badge>
            </div>
            {quiz_info.course && (
              <p className="text-sm text-muted-foreground">
                {quiz_info.course}
              </p>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => {
              refetch();
              reloadParticipants();
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
        </div>

        {/* Thông báo realtime */}
        {notifications.length > 0 && (
          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 hover:border-primary transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Thông báo realtime
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearNotifications}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  Xóa tất cả
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {notifications.slice(0, 3).map((notification, index) => (
                  <div
                    key={index}
                    className="text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 p-2 rounded"
                  >
                    {notification}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State - Quiz chưa có người tham gia */}
        {participants_summary.total === 0 && (
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                  <Eye className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Quiz chưa có người tham gia
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Dữ liệu sẽ được cập nhật tự động khi có học viên tham gia
                    bài kiểm tra
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto p-1">
            <TabsTrigger
              value="overview"
              className="text-xs sm:text-sm px-2 py-2 sm:py-2.5"
            >
              Theo dõi
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="text-xs sm:text-sm px-2 py-2 sm:py-2.5"
            >
              Phân tích
            </TabsTrigger>
            <TabsTrigger
              value="charts"
              className="text-xs sm:text-sm px-2 py-2 sm:py-2.5"
            >
              Biểu đồ
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="text-xs sm:text-sm px-2 py-2 sm:py-2.5"
            >
              Học viên
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Theo dõi */}
          <TabsContent value="overview" className="space-y-6">
            {participants_summary.total === 0 ? (
              <Card className="border-2">
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Eye className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        Đang chờ học viên tham gia
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Dashboard sẽ hiển thị dữ liệu phân tích khi có học viên
                        bắt đầu làm bài
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <QuizProgressChart participants={participants} />
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <CurrentQuestionAnalytics analytics={current_question_analytics} />
            <StrugglingStudentsList strugglingStudents={struggling_students} />
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuizStatusChart
                data={{
                  total: participants.length,
                  completed: participants.filter(
                    (p) => p.status === "completed"
                  ).length,
                  inProgress: participants.filter(
                    (p) => p.status === "in_progress"
                  ).length,
                  pending: participants.filter((p) => p.status === "pending")
                    .length,
                }}
              />
              <ScoreDistributionChart participants={participants} />
            </div>
            <RealtimeLeaderboard participants={participants} />
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card className="border-2 hover:border-primary transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Danh sách học viên ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {participants.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Chưa có học viên nào tham gia
                  </div>
                ) : (
                  <div className="space-y-4">
                    {participants.map((participant) => (
                      <div
                        key={participant.user_id}
                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                              <span className="font-bold text-primary text-lg">
                                {participant.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {participant.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {participant.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground">
                                Điểm
                              </p>
                              <p className="font-bold text-lg">
                                {participant.score}
                              </p>
                            </div>
                            <Badge
                              className={
                                participant.status === "completed"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800"
                                  : participant.status === "in_progress"
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                              }
                            >
                              {participant.status === "completed"
                                ? "Hoàn thành"
                                : participant.status === "in_progress"
                                ? "Đang làm bài"
                                : "Chờ bắt đầu"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Trạng thái kết nối - chỉ hiển thị khi mất kết nối */}
        {!isConnected && (
          <div className="fixed bottom-4 right-4 bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-300 dark:border-orange-800 text-orange-800 dark:text-orange-300 px-4 py-3 rounded-lg flex items-center gap-2 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="font-medium">Đang kết nối lại...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizMonitorPage;
