"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/forms";
import { Card, CardContent } from "@/components/ui/layout";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileCode,
} from "lucide-react";
import { Input } from "@/components/ui/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import {
  codePracticeService,
  CodePracticeQuiz,
} from "@/lib/services/api/code-practice.service";
import {
  studentCourseService,
  StudentCourse,
} from "@/lib/services/api/student-course.service";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { CodePracticeCard } from "./CodePracticeCard";

interface CodePracticeListProps {
  userId?: number;
  onStartQuiz: (quiz: CodePracticeQuiz) => void;
  className?: string;
}

export function CodePracticeList({
  userId,
  onStartQuiz,
  className,
}: CodePracticeListProps) {
  const [quizzes, setQuizzes] = useState<CodePracticeQuiz[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<CodePracticeQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuizzes, setTotalQuizzes] = useState(0);

  // Course filtering
  const [studentCourses, setStudentCourses] = useState<StudentCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(
    undefined
  );
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Refs for GSAP animations
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  const limit = 12;

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
        "❌ [CodePracticeList] Error fetching student courses:",
        error
      );
      showErrorToast("Không thể tải danh sách khóa học");
    } finally {
      setLoadingCourses(false);
    }
  };

  // Fetch code practice quizzes
  const fetchCodePracticeQuizzes = async (
    page: number = 1,
    search: string = ""
  ) => {
    if (!selectedCourseId) {
      console.warn(
        "⚠️ [CodePracticeList] No courseId selected, skipping quiz fetch"
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await codePracticeService.getCodePracticeQuizzes({
        course_id: selectedCourseId,
        page,
        limit,
      });

      if (response?.quizzes) {
        setAllQuizzes(response.quizzes);
        setQuizzes(response.quizzes);

        // Handle pagination info
        const pagination = response.pagination;
        if (pagination) {
          setTotalPages(pagination.totalPages || 1);
          setTotalQuizzes(pagination.total || 0);
        }
      } else {
        throw new Error("Không thể tải danh sách bài tập code");
      }
    } catch (error) {
      console.error(
        "❌ [CodePracticeList] Error fetching code practice quizzes:",
        {
          error,
          courseId: selectedCourseId,
          page,
        }
      );
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách bài tập code";
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
      fetchCodePracticeQuizzes(1);
      setCurrentPage(1);
    }
  }, [selectedCourseId]);

  // Animate cards when quizzes change
  useEffect(() => {
    if (quizzes.length > 0 && !loading) {
      cardsRef.current = cardsRef.current.slice(0, quizzes.length);

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

  // Handle search (client-side filtering)
  const handleSearch = (value: string) => {
    setSearchTerm(value);

    if (!value.trim()) {
      setQuizzes(allQuizzes);
    } else {
      const filtered = allQuizzes.filter((quiz) =>
        quiz.name.toLowerCase().includes(value.toLowerCase())
      );
      setQuizzes(filtered);
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
      fetchCodePracticeQuizzes(newPage);
    }
  };

  // Skeleton component
  const QuizCardSkeleton = () => (
    <Card className="h-full border border-border/60 bg-white dark:bg-card overflow-hidden relative">
      <CardContent className="px-4">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center flex-1">
              <div className="h-4 w-4 bg-muted rounded mr-2 animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
          </div>
          <div className="flex-1 mb-4 space-y-2">
            <div className="h-5 w-full bg-muted rounded animate-pulse" />
            <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
          </div>
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
          <div className="h-10 w-full bg-muted rounded mt-4 animate-pulse" />
        </div>
      </CardContent>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent" />
    </Card>
  );

  // Loading state
  if (loadingCourses || (loading && !selectedCourseId)) {
    return (
      <div className={cn("w-full", className)}>
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
                  fetchCodePracticeQuizzes(currentPage);
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
      {/* Course Selector */}
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
                    placeholder="Tìm kiếm bài tập code..."
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
            <FileCode className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
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
            <FileCode className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Chưa có bài tập code
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? `Không tìm thấy bài tập nào với từ khóa "${searchTerm}"`
                : "Chưa có bài tập code nào trong khóa học này"}
            </p>
          </div>
        ) : (
          <>
            {/* Quiz Grid */}
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
                  <CodePracticeCard quiz={quiz} onStartQuiz={onStartQuiz} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Trang {currentPage} / {totalPages} ({totalQuizzes} bài tập)
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
