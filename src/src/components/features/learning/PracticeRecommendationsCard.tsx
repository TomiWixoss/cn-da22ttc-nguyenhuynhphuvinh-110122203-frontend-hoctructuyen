"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import {
  Search,
  AlertTriangle,
  TrendingUp,
  Target,
  BookOpen,
  Play,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  X,
  SortAsc,
  SortDesc,
  GraduationCap,
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
import { cn } from "@/lib/utils";
import {
  practiceRecommendationService,
  type PracticeRecommendation,
  type PracticeRecommendationSummary,
} from "@/lib/services/api/practice-recommendation.service";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast-utils";

interface PracticeRecommendationsCardProps {
  className?: string;
  userId: number;
  courseId: number;
  onStartPractice?: (recommendation: PracticeRecommendation) => void;
}

const priorityConfig = {
  urgent: {
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    badgeVariant: "destructive" as const,
    label: "Khẩn cấp",
  },
  high: {
    icon: TrendingUp,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    badgeVariant: "secondary" as const,
    label: "Cao",
  },
  medium: {
    icon: Target,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    badgeVariant: "outline" as const,
    label: "Trung bình",
  },
  low: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    badgeVariant: "outline" as const,
    label: "Thấp",
  },
};

// Filter types
type PriorityFilter = "all" | "urgent" | "high" | "medium" | "low";
type SortBy = "priority" | "lo_name";
type SortOrder = "ASC" | "DESC";

interface FilterState {
  priority: PriorityFilter;
  search: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

export function PracticeRecommendationsCard({
  className,
  userId,
  courseId,
  onStartPractice,
}: PracticeRecommendationsCardProps) {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<
    PracticeRecommendation[]
  >([]);
  const [summary, setSummary] = useState<PracticeRecommendationSummary | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingPractice, setStartingPractice] = useState<number | null>(null);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priority: "all",
    search: "",
    sortBy: "priority",
    sortOrder: "DESC",
  });

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await practiceRecommendationService.getRecommendations({
        user_id: userId,
        course_id: courseId,
      });

      setRecommendations(response.data.recommendations);
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error fetching practice recommendations:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tải đề xuất luyện tập";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && courseId) {
      fetchRecommendations();
    }
  }, [userId, courseId]);

  const handleStartPractice = async (
    recommendation: PracticeRecommendation
  ) => {
    try {
      setStartingPractice(recommendation.lo_id);

      if (onStartPractice) {
        onStartPractice(recommendation);
      } else {
        console.warn("No onStartPractice callback provided");
      }
    } catch (error) {
      console.error("Error starting practice:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Không thể bắt đầu luyện tập";
      showErrorToast(errorMessage);
    } finally {
      // Reset state after a short delay
      setTimeout(() => {
        setStartingPractice(null);
      }, 1000);
    }
  };

  const handleToggleShowAll = () => {
    setShowAllRecommendations(!showAllRecommendations);
  };

  // Filter recommendations based on current filters
  const filteredRecommendations = recommendations.filter((recommendation) => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesName = recommendation.lo_name
        .toLowerCase()
        .includes(searchTerm);
      const matchesDescription = recommendation.lo_description
        ?.toLowerCase()
        .includes(searchTerm);
      const matchesSubject = recommendation.subject_name
        .toLowerCase()
        .includes(searchTerm);
      const matchesChapter = recommendation.chapter_name
        .toLowerCase()
        .includes(searchTerm);

      if (
        !matchesName &&
        !matchesDescription &&
        !matchesSubject &&
        !matchesChapter
      ) {
        return false;
      }
    }

    // Priority filter
    if (
      filters.priority !== "all" &&
      recommendation.priority !== filters.priority
    ) {
      return false;
    }

    return true;
  });

  // Sort filtered recommendations
  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    let compareValue = 0;

    switch (filters.sortBy) {
      case "priority":
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        compareValue =
          (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
        break;
      case "lo_name":
        compareValue = a.lo_name.localeCompare(b.lo_name);
        break;
      default:
        compareValue = 0;
    }

    return filters.sortOrder === "ASC" ? compareValue : -compareValue;
  });

  const resetFilters = () => {
    setFilters({
      priority: "all",
      search: "",
      sortBy: "priority",
      sortOrder: "DESC",
    });
  };

  const hasActiveFilters = filters.priority !== "all" || filters.search !== "";

  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Đang tải đề xuất luyện tập
            </h3>
            <p className="text-muted-foreground text-center">
              Vui lòng chờ trong giây lát...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("w-full", className)}>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Lỗi tải dữ liệu
            </h3>
            <p className="text-muted-foreground mb-4 text-center">{error}</p>
            <Button onClick={fetchRecommendations} variant="outline">
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className={cn("w-full", className)}>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Chưa có đề xuất luyện tập
            </h3>
            <p className="text-muted-foreground text-center">
              Hoàn thành một số quiz để nhận được đề xuất luyện tập cá nhân hóa
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Professional Filter Bar - QuizSearch Style */}
      <div className="mb-6">
        {/* Tìm kiếm và bộ lọc trên cùng 1 dòng */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center">
          {/* Search bar - với label và viền riêng */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Tìm kiếm
            </label>
            <div className="relative flex-1 min-w-[300px] max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm đề xuất luyện tập..."
                className="pl-10 h-10 text-sm border-2 border-border/60 rounded-lg focus-visible:ring-primary/20 bg-background"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Filters với thống kê tích hợp */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Priority Filter với thống kê và label */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Mức độ ưu tiên
              </label>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={filters.priority}
                  onValueChange={(value: PriorityFilter) =>
                    setFilters((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="w-[160px] bg-background border-2 border-border/60">
                    <SelectValue placeholder="Mức độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center justify-between w-full">
                        <span>Tất cả</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {recommendations.length}
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center justify-between w-full">
                        <span>Khẩn cấp</span>
                        <Badge
                          variant="outline"
                          className="ml-2 text-xs bg-red-50 text-red-600 border-red-200"
                        >
                          {
                            recommendations.filter(
                              (r) => r.priority === "urgent"
                            ).length
                          }
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center justify-between w-full">
                        <span>Cao</span>
                        <Badge
                          variant="outline"
                          className="ml-2 text-xs bg-orange-50 text-orange-600 border-orange-200"
                        >
                          {
                            recommendations.filter((r) => r.priority === "high")
                              .length
                          }
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center justify-between w-full">
                        <span>Trung bình</span>
                        <Badge
                          variant="outline"
                          className="ml-2 text-xs bg-yellow-50 text-yellow-600 border-yellow-200"
                        >
                          {
                            recommendations.filter(
                              (r) => r.priority === "medium"
                            ).length
                          }
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center justify-between w-full">
                        <span>Thấp</span>
                        <Badge
                          variant="outline"
                          className="ml-2 text-xs bg-green-50 text-green-600 border-green-200"
                        >
                          {
                            recommendations.filter((r) => r.priority === "low")
                              .length
                          }
                        </Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sort Options với viền và label */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Sắp xếp theo
              </label>
              <div className="flex items-center gap-2">
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: SortBy) =>
                    setFilters((prev) => ({ ...prev, sortBy: value }))
                  }
                >
                  <SelectTrigger className="w-[140px] bg-background border-2 border-border/60">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">Mức độ ưu tiên</SelectItem>
                    <SelectItem value="lo_name">Tên</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      sortOrder: prev.sortOrder === "ASC" ? "DESC" : "ASC",
                    }))
                  }
                  className="px-2 bg-background border-2 border-border/60"
                >
                  {filters.sortOrder === "ASC" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Clear filters button với viền - nằm cùng hàng với các bộ lọc */}
            {hasActiveFilters && (
              <div className="flex items-center pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs border-2 border-border/60 h-10"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-border/30 mt-4">
            {filters.priority !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Mức độ: {priorityConfig[filters.priority]?.label}
              </Badge>
            )}
            {filters.search && (
              <Badge variant="secondary" className="text-xs">
                Tìm kiếm: &quot;{filters.search}&quot;
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {sortedRecommendations.length === 0 ? (
          <div className="text-center py-8">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Không tìm thấy đề xuất phù hợp
            </h3>
            <p className="text-muted-foreground mb-4">
              Thử điều chỉnh bộ lọc để xem thêm đề xuất luyện tập
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
            {(showAllRecommendations
              ? sortedRecommendations
              : sortedRecommendations.slice(0, 6)
            ).map((recommendation, index) => {
              const config = priorityConfig[recommendation.priority];
              const Icon = config.icon;
              // Tạo unique key bằng cách kết hợp lo_id, priority và index để tránh duplicate
              const uniqueKey = `recommendation-${recommendation.lo_id}-${recommendation.priority}-${index}`;

              return (
                <div
                  key={uniqueKey}
                  className={cn(
                    "group relative overflow-hidden rounded-lg border bg-background transition-all duration-300 hover:border-primary/30",
                    config.borderColor
                  )}
                >
                  {/* Priority Accent Strip */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-1",
                      recommendation.priority === "urgent"
                        ? "bg-red-500"
                        : recommendation.priority === "high"
                        ? "bg-orange-500"
                        : recommendation.priority === "medium"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    )}
                  />

                  <div className="p-5">
                    {/* Header with title and difficulty badge */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors duration-200 flex-1 pr-2">
                          {recommendation.lo_name}
                        </h4>
                        <Badge
                          variant={config.badgeVariant}
                          className="text-xs font-medium flex-shrink-0"
                        >
                          {config.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Description Section */}
                    {recommendation.lo_description && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {recommendation.lo_description}
                        </p>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-border/40 mb-4"></div>

                    {/* Course and Chapter Info - Separate lines */}
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-muted-foreground">
                          {recommendation.subject_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">
                          {recommendation.chapter_name}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => handleStartPractice(recommendation)}
                      disabled={startingPractice === recommendation.lo_id}
                      className="w-full transition-all duration-200 group-hover:scale-[1.02]"
                      size="sm"
                    >
                      {startingPractice === recommendation.lo_id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Đang tạo bài luyện tập...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Bắt đầu luyện tập
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {sortedRecommendations.length > 6 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleShowAll}
              className="transition-all duration-200 hover:scale-105"
            >
              {showAllRecommendations
                ? "Thu gọn"
                : `Xem thêm ${sortedRecommendations.length - 6} đề xuất`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
