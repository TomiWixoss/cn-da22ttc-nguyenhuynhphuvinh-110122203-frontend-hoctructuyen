"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Card, CardContent } from "@/components/ui/layout";
import {
  BookOpen,
  Clock,
  Play,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import { quizService } from "@/lib/services/api/quiz.service";
import {
  studentCourseService,
  StudentCourse,
} from "@/lib/services/api/student-course.service";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { cn } from "@/lib/utils";
import gsap from "gsap";

interface Quiz {
  quiz_id: number;
  name: string;
  description?: string;
  duration: number;
  start_time: string | null;
  end_time: string | null;
  update_time: string;
  status: string;
  pin: string;
  current_question_index: number;
  show_leaderboard: boolean;
  quiz_mode: "assessment" | "practice";
  course_id: number;
  // Gamification fields for practice mode
  gamification_enabled?: boolean;
  skill_system_enabled?: boolean;
  avatar_system_enabled?: boolean;
  level_progression_enabled?: boolean;
  real_time_leaderboard_enabled?: boolean;
  // Course and Subject info
  Course?: {
    course_id: number;
    name: string;
    subject_id: number;
    Subject?: {
      subject_id: number;
      name: string;
    };
  };
  Subject?: {
    subject_id: number;
    name: string;
  };
  Questions?: Array<{
    question_id: number;
    question_text: string;
  }>;
  subject_id?: number;
  // Legacy fields for backward compatibility
  total_questions?: number;
  time_limit_minutes?: number;
  course_name?: string;
  subject_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface PracticeQuizListProps {
  courseId?: number; // Made optional để hỗ trợ việc lọc theo khóa học
  userId?: number; // Thêm userId để lấy danh sách khóa học của sinh viên
  onStartQuiz: (quiz: Quiz) => void;
  className?: string;
}

export function PracticeQuizList({
  courseId,
  userId,
  onStartQuiz,
  className,
}: PracticeQuizListProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuizzes, setTotalQuizzes] = useState(0);

  // Course filtering
  const [studentCourses, setStudentCourses] = useState<StudentCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(
    courseId
  );
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Refs for GSAP animations
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  const limit = 12; // Tăng số quiz hiển thị mỗi trang để bù cho việc filter

  // Fetch student courses
  const fetchStudentCourses = async () => {
    if (!userId) return;

    try {
      setLoadingCourses(true);

      const response = await studentCourseService.getCoursesOfStudent(userId);

      if (response?.success && response?.data?.courses) {
        setStudentCourses(response.data.courses);
      }
    } catch (error) {
      console.error(
        "❌ [PracticeQuizList] Error fetching student courses:",
        error
      );
      showErrorToast("Không thể tải danh sách khóa học");
    } finally {
      setLoadingCourses(false);
    }
  };

  // Fetch practice quizzes
  const fetchPracticeQuizzes = async (
    page: number = 1,
    search: string = ""
  ) => {
    if (!selectedCourseId) {
      console.warn(
        "⚠️ [PracticeQuizList] No courseId selected, skipping quiz fetch"
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await quizService.getQuizzesByCourseAndMode(
        selectedCourseId,
        "practice",
        {
          page,
          limit,
          search: search.trim() || undefined,
          sort_by: "update_time",
          sort_order: "DESC",
        }
      );

      if (response?.success && response?.data) {
        const quizzes = response.data.quizzes || [];

        // Transform data to match new API structure and filter out finished quizzes
        const transformedQuizzes = quizzes
          .map((quiz: any) => ({
            ...quiz,
            // Map legacy fields for backward compatibility
            total_questions: quiz.Questions?.length || 0,
            time_limit_minutes: quiz.duration,
            course_name: quiz.Course?.name,
            subject_name: quiz.Subject?.name || quiz.Course?.Subject?.name,
            created_at: quiz.update_time,
            updated_at: quiz.update_time,
          }))
          .filter((quiz: any) => quiz.status !== "finished"); // Filter out finished quizzes

        setQuizzes(transformedQuizzes);

        // Handle pagination info
        const pagination = response.data.pagination;
        if (pagination) {
          setTotalPages(pagination.totalPages || 1);
          setTotalQuizzes(pagination.total || 0);
        }
      } else {
        console.error(
          "❌ [PracticeQuizList] Invalid response format:",
          response
        );
        throw new Error(
          response?.message || "Không thể tải danh sách quiz luyện tập"
        );
      }
    } catch (error) {
      console.error("❌ [PracticeQuizList] Error fetching practice quizzes:", {
        error,
        courseId: selectedCourseId,
        page,
        search,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách quiz luyện tập";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (userId) {
      fetchStudentCourses();
    }
  }, [userId]);

  // Auto-select first course when courses are loaded
  useEffect(() => {
    if (studentCourses.length > 0 && !selectedCourseId) {
      const firstCourse = studentCourses[0];
      setSelectedCourseId(firstCourse.course_id);
    }
  }, [studentCourses, selectedCourseId]);

  // Load quizzes when course is selected
  useEffect(() => {
    if (selectedCourseId) {
      fetchPracticeQuizzes(1, searchTerm);
      setCurrentPage(1);
    }
  }, [selectedCourseId]);

  // Animate cards when quizzes change
  useEffect(() => {
    if (quizzes.length > 0 && !loading) {
      // Reset refs array
      cardsRef.current = cardsRef.current.slice(0, quizzes.length);

      // Animate cards with stagger
      gsap.fromTo(
        cardsRef.current,
        {
          opacity: 0,
          y: 30,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.08,
          clearProps: "all",
        }
      );
    }
  }, [quizzes, loading]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    if (selectedCourseId) {
      fetchPracticeQuizzes(1, value);
    }
  };

  // Handle course selection
  const handleCourseSelect = (courseId: number) => {
    setSelectedCourseId(courseId);
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && selectedCourseId) {
      setCurrentPage(newPage);
      fetchPracticeQuizzes(newPage, searchTerm);
    }
  };

  // Format time display
  const formatTimeLimit = (minutes?: number) => {
    if (!minutes) return "Không giới hạn";
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}p`
      : `${hours} giờ`;
  };

  // Get quiz status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return null;
      case "active":
        return (
          <Badge
            variant="default"
            className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            Đang hoạt động
          </Badge>
        );
      case "finished":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            Đã kết thúc
          </Badge>
        );
      case "draft":
        return <Badge variant="secondary">Nháp</Badge>;
      case "archived":
        return <Badge variant="outline">Lưu trữ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Skeleton component with shimmer effect
  const QuizCardSkeleton = () => (
    <Card className="h-full border border-border/60 bg-white dark:bg-card overflow-hidden relative">
      <CardContent className="px-4">
        <div className="flex flex-col h-full">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center flex-1">
              <div className="h-4 w-4 bg-muted rounded mr-2 animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
          </div>

          {/* Title skeleton */}
          <div className="flex-1 mb-4 space-y-2">
            <div className="h-5 w-full bg-muted rounded animate-pulse" />
            <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
          </div>

          {/* Info skeleton */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-4 w-4 bg-muted rounded mr-2 animate-pulse" />
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              </div>
              <div className="flex items-center">
                <div className="h-4 w-4 bg-muted rounded mr-2 animate-pulse" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Button skeleton */}
          <div className="h-10 w-full bg-muted rounded mt-4 animate-pulse" />
        </div>
      </CardContent>

      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
    </Card>
  );

  // Loading state
  if (loadingCourses || (loading && !selectedCourseId)) {
    return (
      <div className={cn("w-full", className)}>
        {/* Skeleton for filters */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center">
            <div className="flex flex-col gap-2">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-10 w-[250px] bg-muted rounded animate-pulse" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-10 w-[300px] bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Skeleton grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <QuizCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Lỗi tải dữ liệu
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={() => {
                if (selectedCourseId) {
                  fetchPracticeQuizzes(currentPage, searchTerm);
                }
              }}
              variant="outline"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Course Selector - Compact Design */}
      {userId && studentCourses.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center">
            {/* Course Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Khóa học
              </label>
              <Select
                value={selectedCourseId?.toString() || ""}
                onValueChange={(value) => {
                  const courseId = Number(value);
                  handleCourseSelect(courseId);
                }}
              >
                <SelectTrigger className="w-[250px] bg-background border-2 border-border/60">
                  <SelectValue placeholder="Chọn khóa học" />
                </SelectTrigger>
                <SelectContent>
                  {studentCourses.map((course) => (
                    <SelectItem
                      key={course.course_id}
                      value={course.course_id.toString()}
                    >
                      {course.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            {selectedCourseId && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Tìm kiếm
                </label>
                <div className="relative min-w-[300px] max-w-lg">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm quiz luyện tập..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 h-10 text-sm border-2 border-border/60 rounded-lg focus-visible:ring-primary/20 bg-background"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {!selectedCourseId ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Đang tải khóa học
            </h3>
            <p className="text-muted-foreground">
              Vui lòng chờ trong giây lát...
            </p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <QuizCardSkeleton key={i} />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Chưa có quiz luyện tập
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? `Không tìm thấy quiz nào với từ khóa "${searchTerm}"`
                : "Chưa có quiz luyện tập nào trong khóa học này"}
            </p>
          </div>
        ) : (
          <>
            {/* Quiz Grid - Optimized Layout */}
            <div
              ref={gridRef}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6"
            >
              {quizzes.map((quiz, index) => (
                <div
                  key={quiz.quiz_id}
                  ref={(el) => {
                    cardsRef.current[index] = el;
                  }}
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, {
                      y: -8,
                      scale: 1.02,
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, {
                      y: 0,
                      scale: 1,
                      duration: 0.3,
                      ease: "power2.out",
                    });
                  }}
                >
                  <Card className="group h-full border border-border/60 hover:border-primary/50 transition-all duration-200 bg-white dark:bg-card hover:bg-slate-50/50 dark:hover:bg-card/90">
                    <CardContent className="px-4">
                      <div className="flex flex-col h-full">
                        {/* Header: Subject + Status */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center text-muted-foreground min-w-0 flex-1">
                            <BookOpen className="h-4 w-4 mr-2 flex-shrink-0 text-primary/70" />
                            <span className="text-sm line-clamp-1 font-medium">
                              {quiz.subject_name ||
                                quiz.course_name ||
                                "Chưa phân loại"}
                            </span>
                          </div>
                          {getStatusBadge(quiz.status)}
                        </div>

                        {/* Quiz Name */}
                        <div className="flex-1 mb-4">
                          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                            {quiz.name}
                          </h3>
                        </div>

                        {/* Quiz Info */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-blue-500" />
                              <span>{quiz.total_questions || 0} câu hỏi</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-green-500" />
                              <span>{formatTimeLimit(quiz.duration)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Button - Styled like QuizActions */}
                        <div className="flex flex-wrap items-center justify-center gap-2 w-full mt-4">
                          {quiz.status === "pending" && (
                            <Button
                              onClick={() => onStartQuiz(quiz)}
                              variant="default"
                              size="sm"
                              className="h-8 sm:h-10 px-3 text-xs sm:text-sm cursor-pointer flex-1 bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-500/20 group-hover:scale-[1.02] transition-all duration-200"
                            >
                              <Play className="h-3.5 w-3.5 flex-shrink-0 mr-1" />
                              <span className="whitespace-nowrap">Bắt đầu</span>
                            </Button>
                          )}

                          {quiz.status === "active" && (
                            <Button
                              onClick={() => onStartQuiz(quiz)}
                              variant="default"
                              size="sm"
                              className="h-8 sm:h-10 px-3 text-xs sm:text-sm cursor-pointer flex-1 bg-green-500 hover:bg-green-600 text-white border-2 border-green-500/20 group-hover:scale-[1.02] transition-all duration-200"
                            >
                              <Play className="h-3.5 w-3.5 flex-shrink-0 mr-1" />
                              <span className="whitespace-nowrap">
                                Tiếp tục
                              </span>
                            </Button>
                          )}

                          {quiz.status === "draft" && (
                            <Button
                              onClick={() => onStartQuiz(quiz)}
                              variant="outline"
                              size="sm"
                              className="h-8 sm:h-10 px-3 text-xs sm:text-sm cursor-pointer flex-1 border-2 border-border hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all duration-200"
                            >
                              <Play className="h-3.5 w-3.5 flex-shrink-0 mr-1" />
                              <span className="whitespace-nowrap">
                                Xem trước
                              </span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Trang {currentPage} / {totalPages} ({totalQuizzes} quiz)
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
