"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/display/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/forms/button";
import { Checkbox } from "@/components/ui/forms/checkbox";
import { Skeleton } from "@/components/ui/feedback/skeleton";
import { toast } from "sonner";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  HelpCircle,
  Filter,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/feedback/badge";
import { PaginationWithInfo } from "@/components/ui/navigation";
import type {
  QuestionWithRelations,
  QuestionType,
  Level,
} from "@/lib/types/question";
import type { LOResponse } from "@/lib/services/api/lo.service";
import { questionService } from "@/lib/services/api/question.service";
import { loService } from "@/lib/services/api/lo.service";
import { AssignmentService } from "@/lib/services/api/assignment.service";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";
import { QuestionDeleteDialog } from "./question-delete-dialog";
import { ImportQuestionsDialog } from "./import-questions-dialog";
import { QuestionsDataTableSkeleton } from "./QuestionsDataTableSkeleton";

interface QuestionsDataTableProps {
  className?: string;
}

// Interface cho câu hỏi được lấy từ LO API
interface QuestionFromLO {
  question_id: number;
  question_text: string;
  explanation?: string;
  QuestionType?: {
    question_type_id: number;
    name: string;
  };
  Level?: {
    level_id: number;
    name: string;
  };
  Answers?: Array<{
    answer_id: number;
    answer_text: string;
    is_correct: boolean;
  }>;
  lo_id: number;
  question_type_id: number;
  level_id: number;
}

export function QuestionsDataTable({ className }: QuestionsDataTableProps) {
  const router = useRouter();
  const { getUser } = useAuthStatus();
  const { currentAssignmentId, assignments, createTeacherUrl } =
    useAssignmentContext();

  // State management
  const [allQuestions, setAllQuestions] = useState<QuestionWithRelations[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<
    QuestionWithRelations[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);

  // Reference data
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [learningOutcomes, setLearningOutcomes] = useState<LOResponse[]>([]);

  // Current assignment data
  const [currentAssignment, setCurrentAssignment] = useState<any>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("question_text");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [filterLevelId, setFilterLevelId] = useState<string>("");
  const [filterQuestionTypeId, setFilterQuestionTypeId] = useState<string>("");
  const [filterLOId, setFilterLOId] = useState<string>("");

  // Dialog state
  const [questionToDelete, setQuestionToDelete] =
    useState<QuestionWithRelations | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Import refresh handler
  const handleImportSuccess = () => {
    fetchQuestions();
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get current assignment data when assignment ID changes
  useEffect(() => {
    if (currentAssignmentId && assignments.length > 0) {
      const assignment = assignments.find(
        (a) => a.assignment_id.toString() === currentAssignmentId
      );
      setCurrentAssignment(assignment || null);
    }
  }, [currentAssignmentId, assignments]);

  // Filter questions when search term or filters change
  useEffect(() => {
    filterQuestions(
      debouncedSearchTerm,
      filterLevelId,
      filterQuestionTypeId,
      filterLOId
    );
  }, [
    debouncedSearchTerm,
    filterLevelId,
    filterQuestionTypeId,
    filterLOId,
    allQuestions,
    pageSize,
  ]);

  // Update pagination when pageSize changes
  useEffect(() => {
    if (filteredQuestions.length > 0) {
      const newTotalPages = Math.ceil(filteredQuestions.length / pageSize);
      setTotalPages(newTotalPages);
      // Reset to page 1 if current page exceeds new total pages
      if (currentPage > newTotalPages) {
        setCurrentPage(1);
      }
    }
  }, [pageSize, filteredQuestions.length, currentPage]);

  // Fetch questions when assignment changes
  useEffect(() => {
    if (currentAssignment?.subject_id) {
      Promise.all([fetchQuestions(), fetchReferenceData()]);
    }
  }, [currentAssignment?.subject_id]);

  // Filter questions based on search term and filters
  const filterQuestions = (
    search: string,
    levelId: string,
    questionTypeId: string,
    loId: string
  ) => {
    let filtered = allQuestions;

    // Apply text search
    if (search.trim()) {
      filtered = filtered.filter(
        (question) =>
          question.question_text.toLowerCase().includes(search.toLowerCase()) ||
          question.explanation?.toLowerCase().includes(search.toLowerCase()) ||
          question.LO?.name.toLowerCase().includes(search.toLowerCase()) ||
          question.QuestionType?.name
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    // Apply level filter
    if (levelId && levelId !== "all") {
      filtered = filtered.filter(
        (question) => question.level_id.toString() === levelId
      );
    }

    // Apply question type filter
    if (questionTypeId && questionTypeId !== "all") {
      filtered = filtered.filter(
        (question) => question.question_type_id.toString() === questionTypeId
      );
    }

    // Apply LO filter
    if (loId && loId !== "all") {
      filtered = filtered.filter(
        (question) => question.lo_id.toString() === loId
      );
    }

    setFilteredQuestions(filtered);
    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1);
  };

  // Get questions for current page
  const getCurrentPageQuestions = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredQuestions.slice(startIndex, endIndex);
  };

  // Fetch reference data
  const fetchReferenceData = async () => {
    try {
      const [questionTypesResponse, levelsResponse, losResponse] =
        await Promise.all([
          questionService.getQuestionTypes({ limit: 100 }),
          questionService.getLevels({ limit: 100 }),
          loService.getAllLOs({ limit: 100 }),
        ]);

      if (questionTypesResponse.success && questionTypesResponse.data) {
        setQuestionTypes(questionTypesResponse.data.questionTypes || []);
      }

      if (levelsResponse.success && levelsResponse.data) {
        setLevels(levelsResponse.data.levels || []);
      }

      if (losResponse.success && losResponse.data) {
        setLearningOutcomes(losResponse.data.los || []);
      }
    } catch (error) {
      console.error("Error fetching reference data:", error);
    }
  };

  // Fetch questions data
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const currentUser = getUser();

      if (!currentUser?.user_id) {
        toast.error("Không thể xác định thông tin người dùng");
        return;
      }

      // Kiểm tra nếu không có assignment được chọn
      if (!currentAssignment?.subject_id) {
        console.warn("Không có assignment hoặc subject_id");
        setAllQuestions([]);
        setFilteredQuestions([]);
        setTotalItems(0);
        setTotalPages(0);
        return;
      }

      // Lấy danh sách LO theo subject với include_questions=true
      const response = await loService.getLOsBySubject(
        currentAssignment.subject_id,
        true // include_questions
      );

      if (response.success && response.data) {
        // Tổng hợp tất cả câu hỏi từ các LO
        const allQuestionsFromLOs: QuestionWithRelations[] = [];

        response.data.los.forEach((lo) => {
          if (lo.Questions && Array.isArray(lo.Questions)) {
            lo.Questions.forEach((question: any) => {
              // Transform question từ LO API thành format QuestionWithRelations
              const transformedQuestion: QuestionWithRelations = {
                question_id: question.question_id,
                question_text: question.question_text,
                explanation: question.explanation || "",
                lo_id: question.lo_id || lo.lo_id,
                question_type_id: question.question_type_id,
                level_id: question.level_id,
                created_at: new Date().toISOString(), // Placeholder
                updated_at: new Date().toISOString(), // Placeholder
                QuestionType: question.QuestionType,
                Level: question.Level,
                Answers:
                  question.Answers?.map((answer: any) => ({
                    answer_id: answer.answer_id,
                    answer_text: answer.answer_text,
                    iscorrect: answer.is_correct,
                    question_id: question.question_id,
                  })) || [],
                LO: {
                  lo_id: lo.lo_id,
                  name: lo.name,
                  description: lo.description,
                },
              };
              allQuestionsFromLOs.push(transformedQuestion);
            });
          }
        });

        setAllQuestions(allQuestionsFromLOs);
        setFilteredQuestions(allQuestionsFromLOs);

        // Update learning outcomes list
        setLearningOutcomes(response.data.los);

        // Calculate pagination
        const totalPages = Math.ceil(allQuestionsFromLOs.length / pageSize);
        setTotalPages(totalPages);
        setTotalItems(allQuestionsFromLOs.length);
        setCurrentPage(1);
      } else {
        throw new Error(response.message || "Không thể tải danh sách câu hỏi");
      }
    } catch (error: unknown) {
      console.error("Error loading questions:", error);
      let errorMessage = "Có lỗi xảy ra khi tải danh sách câu hỏi";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      setAllQuestions([]);
      setFilteredQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Load reference data on component mount
  useEffect(() => {
    fetchReferenceData();
  }, []);

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  };

  // Sort questions
  const sortedQuestions = useMemo(() => {
    const questions = getCurrentPageQuestions();
    return [...questions].sort((a, b) => {
      let aValue: any = a[sortBy as keyof QuestionWithRelations];
      let bValue: any = b[sortBy as keyof QuestionWithRelations];

      // Handle nested properties
      if (sortBy === "question_type_name") {
        aValue = a.QuestionType?.name || "";
        bValue = b.QuestionType?.name || "";
      } else if (sortBy === "level_name") {
        aValue = a.Level?.name || "";
        bValue = b.Level?.name || "";
      } else if (sortBy === "lo_name") {
        aValue = a.LO?.name || "";
        bValue = b.LO?.name || "";
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "ASC"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "ASC" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [getCurrentPageQuestions(), sortBy, sortOrder]);

  // Handle selection
  const handleSelectQuestion = (questionId: number, checked: boolean) => {
    if (checked) {
      setSelectedQuestions([...selectedQuestions, questionId]);
    } else {
      setSelectedQuestions(selectedQuestions.filter((id) => id !== questionId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuestions(
        getCurrentPageQuestions().map((question) => question.question_id)
      );
    } else {
      setSelectedQuestions([]);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) return;

    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa ${selectedQuestions.length} câu hỏi đã chọn?`
      )
    ) {
      return;
    }

    try {
      await questionService.deleteMultipleQuestions({
        question_ids: selectedQuestions,
      });
      toast.success(`Đã xóa ${selectedQuestions.length} câu hỏi thành công`);
      setSelectedQuestions([]);
      fetchQuestions();
    } catch (error) {
      toast.error("Không thể xóa một số câu hỏi");
    }
  };

  // Handle export CSV
  const handleExportCSV = () => {
    const csvData = filteredQuestions.map((question) => ({
      "Câu hỏi": question.question_text,
      "Loại câu hỏi": question.QuestionType?.name || "",
      "Độ khó": question.Level?.name || "",
      "Chuẩn đầu ra": getLODisplayText(question.LO),
      "Giải thích": question.explanation || "",
      "Số câu trả lời": question.Answers?.length || 0,
      "Ngày tạo": new Date(question.created_at).toLocaleDateString("vi-VN"),
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cau-hoi-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Handle individual actions
  const handleView = (questionId: number) => {
    const url = createTeacherUrl(`/dashboard/teaching/questions/${questionId}`);
    router.push(url);
  };

  const handleEdit = (questionId: number) => {
    const url = createTeacherUrl(
      `/dashboard/teaching/questions/${questionId}/edit`
    );
    router.push(url);
  };

  const handleDelete = (questionId: number) => {
    const question = filteredQuestions.find(
      (q) => q.question_id === questionId
    );
    if (!question) return;

    setQuestionToDelete(question);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = async () => {
    // Refresh data after successful deletion
    await fetchQuestions();
    setQuestionToDelete(null);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterLevelId("");
    setFilterQuestionTypeId("");
    setFilterLOId("");
  };

  // Get LO display text
  const getLODisplayText = (questionLO: any) => {
    if (!questionLO?.name) return "—";

    // Find the full LO data from learningOutcomes
    const fullLO = learningOutcomes.find((lo) => lo.lo_id === questionLO.lo_id);

    if (fullLO) {
      return `${fullLO.name}${
        fullLO.description ? ` - ${fullLO.description}` : ""
      }`;
    }

    // Fallback to question LO data
    return `${questionLO.name}${
      questionLO.description ? ` - ${questionLO.description}` : ""
    }`;
  };

  // Get level badge color
  const getLevelBadgeColor = (levelName: string) => {
    switch (levelName.toLowerCase()) {
      case "easy":
      case "dễ":
        return "bg-green-100 text-green-800 hover:bg-green-200 transition-colors";
      case "medium":
      case "trung bình":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors";
      case "hard":
      case "khó":
        return "bg-red-100 text-red-800 hover:bg-red-200 transition-colors";
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors";
    }
  };

  // Render sort icon
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === "ASC" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  // Loading skeleton
  if (loading && allQuestions.length === 0) {
    return (
      <div className={className}>
        <QuestionsDataTableSkeleton />
      </div>
    );
  }

  // Show message when no assignment is selected
  if (!currentAssignment?.subject_id) {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Chưa có phân công được chọn
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Vui lòng chọn một phân công môn học từ menu để xem danh sách câu
            hỏi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Search and Controls */}
      <div className="flex flex-col space-y-4 mb-6">
        {/* Mobile: Search full width */}
        <div className="sm:hidden relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm câu hỏi..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-10 w-full"
          />
        </div>

        {/* Mobile: Action buttons */}
        <div className="sm:hidden flex flex-col gap-2">
          <Link
            href={createTeacherUrl("/dashboard/teaching/questions/create")}
            className="w-full"
          >
            <Button className="w-full flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm câu hỏi mới
            </Button>
          </Link>
          <ImportQuestionsDialog onImportSuccess={handleImportSuccess}>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import câu hỏi
            </Button>
          </ImportQuestionsDialog>
        </div>

        {/* Desktop: Search and Add Button */}
        <div className="hidden sm:flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm câu hỏi..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                className="pl-10"
              />
            </div>
            <Link
              href={createTeacherUrl("/dashboard/teaching/questions/create")}
            >
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Thêm câu hỏi mới
              </Button>
            </Link>
            <ImportQuestionsDialog onImportSuccess={handleImportSuccess}>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import câu hỏi
              </Button>
            </ImportQuestionsDialog>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={pageSize.toString()}
              onValueChange={(value: string) => {
                setPageSize(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / trang</SelectItem>
                <SelectItem value="25">25 / trang</SelectItem>
                <SelectItem value="50">50 / trang</SelectItem>
                <SelectItem value="100">100 / trang</SelectItem>
              </SelectContent>
            </Select>

            {selectedQuestions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa ({selectedQuestions.length})
              </Button>
            )}
          </div>
        </div>

        {/* Mobile: Filters */}
        <div className="sm:hidden flex flex-col gap-2">
          <Select
            value={filterQuestionTypeId}
            onValueChange={setFilterQuestionTypeId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tất cả loại câu hỏi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại câu hỏi</SelectItem>
              {questionTypes.map((type) => (
                <SelectItem
                  key={type.question_type_id}
                  value={type.question_type_id.toString()}
                >
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterLevelId} onValueChange={setFilterLevelId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tất cả độ khó" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả độ khó</SelectItem>
              {levels.map((level) => (
                <SelectItem
                  key={level.level_id}
                  value={level.level_id.toString()}
                >
                  {level.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterLOId} onValueChange={setFilterLOId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tất cả chuẩn đầu ra" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chuẩn đầu ra</SelectItem>
              {learningOutcomes.map((lo) => (
                <SelectItem key={lo.lo_id} value={lo.lo_id.toString()}>
                  {lo.name}
                  {lo.description ? ` - ${lo.description}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Select
              value={pageSize.toString()}
              onValueChange={(value: string) => {
                setPageSize(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / trang</SelectItem>
                <SelectItem value="25">25 / trang</SelectItem>
                <SelectItem value="50">50 / trang</SelectItem>
                <SelectItem value="100">100 / trang</SelectItem>
              </SelectContent>
            </Select>

            {(filterQuestionTypeId ||
              filterLevelId ||
              filterLOId ||
              searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex-shrink-0"
              >
                Xóa lọc
              </Button>
            )}
          </div>

          {selectedQuestions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="w-full bg-red-50 border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa ({selectedQuestions.length})
            </Button>
          )}
        </div>

        {/* Desktop: Filters */}
        <div className="hidden sm:flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Lọc:
            </span>
          </div>

          <Select
            value={filterQuestionTypeId}
            onValueChange={setFilterQuestionTypeId}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tất cả loại câu hỏi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại câu hỏi</SelectItem>
              {questionTypes.map((type) => (
                <SelectItem
                  key={type.question_type_id}
                  value={type.question_type_id.toString()}
                >
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterLevelId} onValueChange={setFilterLevelId}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tất cả độ khó" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả độ khó</SelectItem>
              {levels.map((level) => (
                <SelectItem
                  key={level.level_id}
                  value={level.level_id.toString()}
                >
                  {level.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterLOId} onValueChange={setFilterLOId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tất cả chuẩn đầu ra" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chuẩn đầu ra</SelectItem>
              {learningOutcomes.map((lo) => (
                <SelectItem key={lo.lo_id} value={lo.lo_id.toString()}>
                  {lo.name}
                  {lo.description ? ` - ${lo.description}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filterQuestionTypeId ||
            filterLevelId ||
            filterLOId ||
            searchTerm) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100 dark:bg-muted/50 hover:bg-slate-100 dark:hover:bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedQuestions.length ===
                      getCurrentPageQuestions().length &&
                    getCurrentPageQuestions().length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("question_text")}
                  className="h-auto p-0 font-medium"
                >
                  Câu hỏi
                  {renderSortIcon("question_text")}
                </Button>
              </TableHead>
              <TableHead className="w-48">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("question_type_name")}
                  className="h-auto p-0 font-medium"
                >
                  Loại
                  {renderSortIcon("question_type_name")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("level_name")}
                  className="h-auto p-0 font-medium"
                >
                  Độ khó
                  {renderSortIcon("level_name")}
                </Button>
              </TableHead>
              <TableHead className="w-20">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("lo_name")}
                  className="h-auto p-0 font-medium"
                >
                  Chuẩn đầu ra
                  {renderSortIcon("lo_name")}
                </Button>
              </TableHead>
              <TableHead className="w-36 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <HelpCircle className="h-8 w-8" />
                    <p>
                      {searchTerm ||
                      filterLevelId ||
                      filterQuestionTypeId ||
                      filterLOId
                        ? "Không tìm thấy câu hỏi nào phù hợp với bộ lọc"
                        : "Chưa có câu hỏi nào"}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          createTeacherUrl(
                            "/dashboard/teaching/questions/create"
                          )
                        )
                      }
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tạo câu hỏi đầu tiên
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedQuestions.map((question) => (
                <TableRow key={question.question_id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedQuestions.includes(question.question_id)}
                      onCheckedChange={(checked: boolean) =>
                        handleSelectQuestion(
                          question.question_id,
                          checked as boolean
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-md">
                    <div className="truncate" title={question.question_text}>
                      {question.question_text}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {question.QuestionType?.name || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={getLevelBadgeColor(question.Level?.name || "")}
                    >
                      {question.Level?.name || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-20">
                    <div className="truncate text-xs" title={question.LO?.name}>
                      {getLODisplayText(question.LO)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleView(question.question_id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEdit(question.question_id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(question.question_id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <PaginationWithInfo
            currentPage={currentPage}
            totalPages={totalPages}
            total={totalItems}
            limit={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Question Delete Dialog */}
      <QuestionDeleteDialog
        question={questionToDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
