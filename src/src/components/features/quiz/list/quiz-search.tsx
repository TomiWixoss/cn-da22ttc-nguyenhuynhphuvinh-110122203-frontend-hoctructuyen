import { Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/forms";
import { Button } from "@/components/ui/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { QuizMode } from "@/lib/types/quiz";
import { CourseSelectByAssignment } from "@/components/features/course/course-select-by-assignment";

interface QuizSearchProps {
  searchTerm: string;
  onChange: (value: string) => void;
  total: number;
  // Filter props
  status?: string;
  onStatusChange: (status: string) => void;
  courseId?: number;
  onCourseChange: (courseId: number | undefined) => void;
  quizMode?: QuizMode;
  onQuizModeChange: (mode: QuizMode | undefined) => void;
  // Sort props
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  sortOrder: "ASC" | "DESC";
  onSortOrderChange: (sortOrder: "ASC" | "DESC") => void;
  // Clear filters
  onClearFilters: () => void;
  // Statistics for each option
  statusCounts?: {
    pending: number;
    active: number;
    finished: number;
  };
  courseCounts?: { [courseId: number]: number };
  modeCounts?: {
    assessment: number;
    practice: number;
  };
}

export function QuizSearch({
  searchTerm,
  onChange,
  total,
  status,
  onStatusChange,
  courseId,
  onCourseChange,
  quizMode,
  onQuizModeChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
  statusCounts = { pending: 0, active: 0, finished: 0 },
  courseCounts = {},
  modeCounts = { assessment: 0, practice: 0 },
}: QuizSearchProps) {
  const hasActiveFilters = status || searchTerm || quizMode; // Không tính courseId nữa vì luôn có giá trị

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ bắt đầu";
      case "active":
        return "Đang diễn ra";
      case "finished":
        return "Đã kết thúc";
      default:
        return "Tất cả";
    }
  };

  const getQuizModeLabel = (mode: QuizMode | string) => {
    switch (mode) {
      case "assessment":
        return "Đánh giá";
      case "practice":
        return "Luyện tập";
      default:
        return "Tất cả";
    }
  };

  return (
    <div className="mb-6">
      {/* Tìm kiếm và bộ lọc trên cùng 1 dòng */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center">
        {/* Search bar - với label và viền riêng */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">
            Tìm kiếm
          </label>
          <div
            className={`relative flex-1 max-w-lg ${
              hasActiveFilters ? "min-w-[200px]" : "min-w-[300px]"
            }`}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bài kiểm tra theo tên..."
              className="pl-10 h-10 text-sm border-2 border-border/60 rounded-lg focus-visible:ring-primary/20 bg-background"
              value={searchTerm}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        </div>

        {/* Filters với thống kê tích hợp */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Status Filter với thống kê */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Trạng thái
            </label>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={status || "all"}
                onValueChange={(value) =>
                  onStatusChange(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-[160px] bg-background border-2 border-border/60">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center justify-between w-full">
                      <span>Tất cả</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {total}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center justify-between w-full">
                      <span>Chờ bắt đầu</span>
                      <Badge
                        variant="outline"
                        className="ml-2 text-xs bg-orange-50 text-orange-600 border-orange-200"
                      >
                        {statusCounts.pending}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="active">
                    <div className="flex items-center justify-between w-full">
                      <span>Đang diễn ra</span>
                      <Badge
                        variant="outline"
                        className="ml-2 text-xs bg-green-50 text-green-600 border-green-200"
                      >
                        {statusCounts.active}
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="finished">
                    <div className="flex items-center justify-between w-full">
                      <span>Đã kết thúc</span>
                      <Badge
                        variant="outline"
                        className="ml-2 text-xs bg-blue-50 text-blue-600 border-blue-200"
                      >
                        {statusCounts.finished}
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Course Filter using new component */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Khóa học
            </label>
            <CourseSelectByAssignment
              value={courseId}
              onValueChange={onCourseChange}
              placeholder="Chọn khóa học"
              className="w-[200px] bg-background border-2 border-border/60"
              showEmptyOption={false}
              autoSelectFirst={true}
            />
          </div>

          {/* Quiz Mode Filter với thống kê */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Chế độ
            </label>
            <Select
              value={quizMode || "all"}
              onValueChange={(value) =>
                onQuizModeChange(
                  value === "all" ? undefined : (value as QuizMode)
                )
              }
            >
              <SelectTrigger className="w-[160px] bg-background border-2 border-border/60">
                <SelectValue placeholder="Chế độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center justify-between w-full">
                    <span>Tất cả</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {total}
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="assessment">
                  <div className="flex items-center justify-between w-full">
                    <span>Đánh giá</span>
                    <Badge
                      variant="outline"
                      className="ml-2 text-xs bg-blue-50 text-blue-600 border-blue-200"
                    >
                      {modeCounts.assessment}
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="practice">
                  <div className="flex items-center justify-between w-full">
                    <span>Luyện tập</span>
                    <Badge
                      variant="outline"
                      className="ml-2 text-xs bg-emerald-50 text-emerald-600 border-emerald-200"
                    >
                      {modeCounts.practice}
                    </Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options với viền */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Sắp xếp theo
            </label>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={onSortByChange}>
                <SelectTrigger className="w-[140px] bg-background border-2 border-border/60">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="update_time">
                    Thời gian cập nhật
                  </SelectItem>
                  <SelectItem value="name">Tên</SelectItem>
                  <SelectItem value="status">Trạng thái</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onSortOrderChange(sortOrder === "ASC" ? "DESC" : "ASC")
                }
                className="px-2 bg-background border-2 border-border/60"
              >
                {sortOrder === "ASC" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Clear filters button với viền - nằm cùng hàng với các bộ lọc */}
          {hasActiveFilters && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground opacity-0">
                &nbsp;
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="text-xs border-2 border-border/60 h-10"
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display (không hiển thị courseId nữa) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-border/30 mt-4">
          {status && (
            <Badge variant="secondary" className="text-xs">
              Trạng thái: {getStatusLabel(status)}
            </Badge>
          )}
          {quizMode && (
            <Badge variant="secondary" className="text-xs">
              Chế độ: {getQuizModeLabel(quizMode)}
            </Badge>
          )}
          {searchTerm && (
            <Badge variant="secondary" className="text-xs">
              Tìm kiếm: &quot;{searchTerm}&quot;
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
