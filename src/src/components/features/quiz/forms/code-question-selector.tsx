"use client";

import { useState, useEffect, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { CreateQuizFormData } from "@/lib/types/quiz";
import { questionService } from "@/lib/services/api/question.service";
import { QuestionWithRelations } from "@/lib/types/question";
import { Checkbox } from "@/components/ui/forms/checkbox";
import { Badge } from "@/components/ui/feedback/badge";
import { Card, CardContent } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/feedback/skeleton";
import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import { showErrorToast } from "@/lib/utils/toast-utils";
import {
  Code2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeQuestionSelectorProps {
  form: UseFormReturn<CreateQuizFormData>;
  courseId: number;
}

export function CodeQuestionSelector({
  form,
  courseId,
}: CodeQuestionSelectorProps) {
  const [questions, setQuestions] = useState<QuestionWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Filter and sort states
  const [searchText, setSearchText] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterLO, setFilterLO] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "level">("name");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCodeQuestions();
  }, [courseId]);

  const fetchCodeQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionService.getQuestions({
        question_type_id: 4, // code_exercise type
        limit: 100,
      });

      setQuestions(response.data?.questions || []);
    } catch (error) {
      showErrorToast("Không thể tải danh sách câu hỏi code");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleQuestion = (questionId: number) => {
    const newSelectedIds = selectedIds.includes(questionId)
      ? selectedIds.filter((id) => id !== questionId)
      : [...selectedIds, questionId];

    setSelectedIds(newSelectedIds);
    form.setValue("question_ids", newSelectedIds);
  };

  const handleSelectAll = () => {
    const allIds = questions.map((q) => q.question_id);
    setSelectedIds(allIds);
    form.setValue("question_ids", allIds);
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
    form.setValue("question_ids", []);
  };

  // Get unique levels and LOs for filters
  const uniqueLevels = useMemo(() => {
    const levels = questions
      .map((q) => q.Level)
      .filter((level): level is NonNullable<typeof level> => level != null);
    return Array.from(new Map(levels.map((l) => [l.level_id, l])).values());
  }, [questions]);

  const uniqueLOs = useMemo(() => {
    const los = questions
      .map((q) => q.LO)
      .filter((lo): lo is NonNullable<typeof lo> => lo != null);
    return Array.from(new Map(los.map((l) => [l.lo_id, l])).values());
  }, [questions]);

  // Get unique tags for filter
  const uniqueTags = useMemo(() => {
    const allTags = questions
      .flatMap((q) => q.tags || [])
      .filter((tag) => tag && tag.trim() !== "");
    return Array.from(new Set(allTags)).sort();
  }, [questions]);

  // Filter and sort questions
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questions;

    // Search filter
    if (searchText) {
      filtered = filtered.filter((q) =>
        q.question_text.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Level filter
    if (filterLevel !== "all") {
      filtered = filtered.filter(
        (q) => q.Level?.level_id.toString() === filterLevel
      );
    }

    // LO filter
    if (filterLO !== "all") {
      filtered = filtered.filter((q) => q.LO?.lo_id.toString() === filterLO);
    }

    // Tag filter
    if (filterTag !== "all") {
      filtered = filtered.filter((q) => q.tags && q.tags.includes(filterTag));
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return a.question_text.localeCompare(b.question_text);
      } else {
        // Sort by level
        const levelA = a.Level?.level_id || 0;
        const levelB = b.Level?.level_id || 0;
        return levelA - levelB;
      }
    });

    return sorted;
  }, [questions, searchText, filterLevel, filterLO, filterTag, sortBy]);

  // Pagination
  const totalPages = Math.ceil(
    filteredAndSortedQuestions.length / itemsPerPage
  );
  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedQuestions.slice(startIndex, endIndex);
  }, [filteredAndSortedQuestions, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterLevel, filterLO, filterTag, sortBy]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Code2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Chưa có câu hỏi code nào cho khóa học này</p>
          <p className="text-sm mt-1">Vui lòng tạo câu hỏi code trước</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="p-6">
        <div className="flex flex-col space-y-3 sm:space-y-4">
          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm câu hỏi..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả độ khó</SelectItem>
                  {uniqueLevels.map((level) => (
                    <SelectItem
                      key={level.level_id}
                      value={level.level_id.toString()}
                    >
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterLO} onValueChange={setFilterLO}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Learning Outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả LO</SelectItem>
                  {uniqueLOs.map((lo) => (
                    <SelectItem key={lo.lo_id} value={lo.lo_id.toString()}>
                      {lo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger>
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Nhãn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nhãn</SelectItem>
                  {uniqueTags.length > 0 ? (
                    uniqueTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Không có nhãn
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as "name" | "level")}
              >
                <SelectTrigger>
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Theo tên</SelectItem>
                  <SelectItem value="level">Theo độ khó</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
            <Badge
              variant="outline"
              className="bg-primary/5 px-2 py-1 h-auto text-xs sm:text-sm"
            >
              {selectedIds.length} / {filteredAndSortedQuestions.length} được
              chọn
            </Badge>

            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredAndSortedQuestions.length === 0}
                className="h-8 text-xs flex-1 sm:flex-none sm:text-sm cursor-pointer"
              >
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                Chọn tất cả
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={selectedIds.length === 0}
                className="h-8 text-xs flex-1 sm:flex-none sm:text-sm cursor-pointer"
              >
                <XCircle className="mr-1 h-3.5 w-3.5" />
                Bỏ chọn
              </Button>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredAndSortedQuestions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Code2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Không tìm thấy câu hỏi phù hợp</p>
                  <p className="text-sm mt-1">
                    Thử thay đổi bộ lọc hoặc tìm kiếm
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {paginatedQuestions.map((question) => {
                  const isSelected = selectedIds.includes(question.question_id);

                  return (
                    <div
                      key={question.question_id}
                      className={cn(
                        "rounded-lg border p-4 transition-all duration-200 cursor-pointer",
                        isSelected
                          ? "bg-primary/8 border-primary/40"
                          : "hover:bg-primary/5 hover:border-primary"
                      )}
                      onClick={() => handleToggleQuestion(question.question_id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() =>
                            handleToggleQuestion(question.question_id)
                          }
                          className="mt-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="space-y-2 w-full">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium leading-relaxed text-foreground line-clamp-2">
                              {question.question_text
                                .split("\n")[0]
                                .replace(/^#\s*/, "")}
                            </p>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {question.Level && (
                              <Badge
                                variant="outline"
                                className="text-xs h-6 px-2 py-1 bg-orange-50 text-orange-700 border-orange-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {question.Level.name}
                              </Badge>
                            )}
                            {question.LO && (
                              <Badge
                                variant="outline"
                                className="text-xs h-6 px-2 py-1 bg-blue-50 text-blue-700 border-blue-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {question.LO.name}
                              </Badge>
                            )}
                            {question.tags &&
                              question.tags.length > 0 &&
                              question.tags.map((tag, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs h-6 px-2 py-1 bg-purple-50 text-purple-700 border-purple-200"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {tag}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Trang {currentPage} / {totalPages} (
                      {filteredAndSortedQuestions.length} câu hỏi)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="h-8 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="h-8 cursor-pointer"
                      >
                        Sau
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
