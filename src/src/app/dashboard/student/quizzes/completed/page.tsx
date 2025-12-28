"use client";

// THÊM MỚI: useState và useMemo
import { useState, useMemo, useEffect, useRef } from "react";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { Badge } from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms";
import { Card } from "@/components/ui/layout";
import { Input } from "@/components/ui/forms";
// THAY ĐỔI: Import component PaginationWithInfo mới
import { PaginationWithInfo } from "@/components/ui/navigation";
import { Calendar, Search, BarChart } from "lucide-react";
import gsap from "gsap";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/layout/page-header";
import {
  useCurrentUserQuizResults,
  QuizResult,
} from "@/lib/hooks/use-quiz-results";

// XÓA BỎ: Hook usePagination cũ không còn cần thiết

export default function CompletedQuizzesPage() {
  const { getUser } = useAuthStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // THÊM MỚI: State để quản lý trang hiện tại và số item mỗi trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Giữ nguyên 6 item mỗi trang

  // GSAP refs
  const headerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  const user = getUser();
  const userId = user ? Number(user.user_id) : 0;

  const {
    data: allQuizResults = [],
    isLoading,
    error,
  } = useCurrentUserQuizResults(userId);

  const quizResults = useMemo(() => {
    // Chỉ lấy các quiz đã hoàn thành và không phải là mode luyện tập
    return allQuizResults.filter(
      (result) =>
        result.status === "completed" && result.Quiz.quiz_mode !== "practice"
    );
  }, [allQuizResults]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return "Ngày không hợp lệ";
    }
  };

  const filteredResults = useMemo(() => {
    return quizResults.filter((result) =>
      result.Quiz.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [quizResults, searchTerm]);

  // THÊM MỚI: Logic tính toán phân trang thủ công
  const totalItems = filteredResults.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredResults.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredResults, currentPage, itemsPerPage]);

  // THAY ĐỔI: Reset trang về 1 khi tìm kiếm
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8)
      return "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800";
    if (score >= 6)
      return "bg-sky-50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800";
    if (score >= 4)
      return "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800";
    return "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return "bg-emerald-500 dark:bg-emerald-600 text-white";
    if (score >= 6) return "bg-sky-500 dark:bg-sky-600 text-white";
    if (score >= 4) return "bg-amber-500 dark:bg-amber-600 text-white";
    return "bg-rose-500 dark:bg-rose-600 text-white";
  };

  // GSAP Animation: Initial page load với timeline mượt mà
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Header animation - slide down với bounce
      tl.fromTo(
        headerRef.current,
        {
          opacity: 0,
          y: -50,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "elastic.out(1, 0.6)",
        }
      )
        // Search bar - slide from left với smooth ease
        .fromTo(
          searchRef.current,
          {
            opacity: 0,
            x: -60,
            filter: "blur(10px)",
          },
          {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.5"
        );
    });

    return () => ctx.revert();
  }, []);

  // GSAP Animation: Cards với stagger effect cực mượt
  useEffect(() => {
    if (!isLoading && paginatedResults.length > 0 && cardsRef.current) {
      const cards = Array.from(cardsRef.current.children);

      // Set initial state
      gsap.set(cards, {
        opacity: 0,
        y: 60,
        rotationX: -15,
        scale: 0.8,
      });

      // Animate in với stagger
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        scale: 1,
        duration: 0.8,
        stagger: {
          each: 0.1,
          ease: "power2.out",
        },
        ease: "expo.out",
        clearProps: "all",
      });
    }
  }, [paginatedResults, isLoading, currentPage]);

  // GSAP Animation: Pagination với smooth fade
  useEffect(() => {
    if (!isLoading && filteredResults.length > 0 && paginationRef.current) {
      gsap.fromTo(
        paginationRef.current,
        {
          opacity: 0,
          y: 30,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.5)",
          delay: 0.4,
        }
      );
    }
  }, [filteredResults, isLoading, currentPage]);

  // GSAP: Hover animation cho cards
  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.03,
      y: -5,
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      y: 0,
      boxShadow: "0 0 0 rgba(0,0,0,0)",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const QuizResultListItem = ({ result }: { result: QuizResult }) => {
    const itemColor = getScoreColor(result.score);
    const badgeColor = getScoreBadgeColor(result.score);
    const displayScore = Number.isInteger(result.score)
      ? result.score
      : result.score.toFixed(1);

    return (
      <div
        className={`${itemColor} border-2 rounded-xl p-4 cursor-pointer will-change-transform`}
        onClick={() =>
          router.push(`/dashboard/student/quizzes/result/${result.result_id}`)
        }
        onMouseEnter={handleCardHover}
        onMouseLeave={handleCardLeave}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: Score Badge */}
          <div
            className={`flex-shrink-0 w-16 h-16 rounded-lg ${badgeColor} flex flex-col items-center justify-center`}
          >
            <span className="text-2xl font-bold">{displayScore}</span>
            <span className="text-[10px] opacity-90">điểm</span>
          </div>

          {/* Middle: Quiz info */}
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold text-base mb-1.5 truncate"
              title={result.Quiz.name}
            >
              {result.Quiz.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(result.update_time)}</span>
            </div>
          </div>

          {/* Right: Icon */}
          <div className="flex-shrink-0">
            <BarChart className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  };

  const QuizEmptyState = () => {
    return (
      <Card className="border bg-muted/5">
        <div className="py-12 sm:py-16 md:py-20 text-center">
          <div className="mx-auto max-w-sm sm:max-w-md">
            <div className="mb-6 flex justify-center">
              <BarChart className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold mb-3">
              {searchTerm
                ? "Không tìm thấy kết quả bài kiểm tra"
                : "Chưa có kết quả bài kiểm tra nào"}
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {searchTerm
                ? "Không có kết quả bài kiểm tra nào phù hợp với từ khóa tìm kiếm"
                : "Hãy làm bài kiểm tra để xem kết quả tại đây"}
            </p>
            <Button
              onClick={() => router.push("/dashboard/student/quizzes")}
              className="bg-primary hover:bg-primary/90"
            >
              Đi đến danh sách bài kiểm tra
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div ref={headerRef}>
        <PageHeader
          title="Kết Quả Bài Kiểm Tra"
          description="Xem tất cả kết quả bài kiểm tra của bạn"
          variant="quizzes"
        />
      </div>

      {/* Search và thông tin */}
      <div ref={searchRef} className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center mb-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên bài kiểm tra..."
              className="pl-10 h-10 text-sm border-2 border-border/60 rounded-lg focus-visible:ring-primary/20 bg-background"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* Thống kê */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tổng cộng có</span>
            <Badge className="bg-emerald-500 text-white">
              {quizResults.length}
            </Badge>
            <span className="text-sm text-muted-foreground">
              kết quả bài kiểm tra
            </span>
            {filteredResults.length !== quizResults.length && (
              <>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">Hiển thị</span>
                <Badge className="bg-blue-500 text-white">
                  {filteredResults.length}
                </Badge>
                <span className="text-sm text-muted-foreground">kết quả</span>
              </>
            )}
          </div>
        </div>

        {/* Active search display */}
        {searchTerm && (
          <div className="flex items-center gap-2 pt-3 border-t border-border/30">
            <Badge variant="secondary" className="text-xs">
              Tìm kiếm: &quot;{searchTerm}&quot;
            </Badge>
            <span className="text-xs text-muted-foreground">
              ({filteredResults.length} kết quả)
            </span>
          </div>
        )}

        {/* Pagination info */}
        {filteredResults.length > 0 && totalPages > 1 && (
          <div className="flex items-center gap-2 pt-3 border-t border-border/30">
            <span className="text-xs text-muted-foreground">
              Trang {currentPage} / {totalPages} • Hiển thị{" "}
              {(currentPage - 1) * 6 + 1}-
              {Math.min(currentPage * 6, filteredResults.length)} trong{" "}
              {filteredResults.length} kết quả
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {/* Search skeleton */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center mb-4">
            <div className="relative flex-1 max-w-md">
              <div className="h-10 w-full bg-muted dark:bg-muted/50 animate-pulse rounded-lg" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-32 bg-muted dark:bg-muted/50 animate-pulse rounded" />
            </div>
          </div>

          {/* Quiz results skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border-2 rounded-xl p-4 bg-gradient-to-br from-white to-slate-50/50 dark:from-card dark:to-card/80"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-muted dark:bg-muted/50 animate-pulse rounded-lg" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-5 w-3/4 bg-muted dark:bg-muted/50 animate-pulse rounded" />
                    <div className="h-4 w-1/2 bg-muted dark:bg-muted/50 animate-pulse rounded" />
                  </div>
                  <div className="flex-shrink-0 w-5 h-5 bg-muted dark:bg-muted/50 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <div className="text-2xl text-red-500 mb-4">
            {error instanceof Error
              ? error.message
              : "Đã xảy ra lỗi khi tải danh sách kết quả bài kiểm tra"}
          </div>
          <Button onClick={() => window.location.reload()}>
            Tải lại trang
          </Button>
        </div>
      ) : filteredResults.length === 0 ? (
        <QuizEmptyState />
      ) : (
        <>
          <div ref={cardsRef} className="space-y-3">
            {paginatedResults.map((result) => (
              <QuizResultListItem key={result.result_id} result={result} />
            ))}
          </div>

          {/* THAY ĐỔI: Sử dụng PaginationWithInfo */}
          <div ref={paginationRef}>
            <PaginationWithInfo
              currentPage={currentPage}
              totalPages={totalPages}
              total={totalItems}
              limit={itemsPerPage}
              onPageChange={setCurrentPage}
              className="mt-8"
            />
          </div>
        </>
      )}
    </div>
  );
}
