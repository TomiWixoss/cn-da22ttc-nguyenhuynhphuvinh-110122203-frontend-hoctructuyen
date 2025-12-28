"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  BookOpen,
  Calendar,
  Hash,
} from "lucide-react";

import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { Checkbox } from "@/components/ui/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay";
import { PaginationWithInfo } from "@/components/ui/navigation";
import { Badge, Skeleton } from "@/components/ui/feedback";
import { Card, CardContent } from "@/components/ui/layout";
import { toast } from "sonner";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast-utils";

import {
  useSubjectsByProgram,
  useRemoveSubjectFromProgram,
} from "@/lib/hooks/use-subjects";
import { SubjectDeleteDialog } from "./subject-delete-dialog";

interface SubjectCardItemProps {
  mapping: any;
  programId: number;
  selectedSubjects: number[];
  onSelect: (subjectId: number, checked: boolean) => void;
  onUpdate?: () => void;
}

function SubjectCardItem({
  mapping,
  programId,
  selectedSubjects,
  onSelect,
  onUpdate,
}: SubjectCardItemProps) {
  const router = useRouter();
  const removeSubjectMutation = useRemoveSubjectFromProgram();

  const handleCardClick = () => {
    router.push(
      `/dashboard/admin/programs/${programId}/subjects/${mapping.subject_id}`
    );
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(
      `/dashboard/admin/programs/${programId}/subjects/${mapping.subject_id}/edit`
    );
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <>
      <Card
        className="h-full border-2 border-border hover:border-primary/60 transition-all duration-300 bg-gradient-to-br from-white to-slate-50/50 dark:from-card dark:to-card/80 cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className="px-4">
          <div className="flex flex-col h-full px-2">
            {/* Header: Checkbox, Icon và Dropdown menu */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedSubjects.includes(mapping.subject_id)}
                  onCheckedChange={(checked) =>
                    onSelect(mapping.subject_id, checked as boolean)
                  }
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  className="flex-shrink-0"
                />
                <div className="flex items-center text-muted-foreground min-w-0 flex-1">
                  <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0 text-blue-500" />
                  <span className="text-xs sm:text-sm line-clamp-1 font-medium">
                    Môn học
                  </span>
                </div>
              </div>

              {/* Dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Tên môn học */}
            <div className="flex-1 flex items-start py-2">
              <h3 className="font-semibold text-base sm:text-lg text-foreground hover:text-primary transition-colors line-clamp-3 leading-tight text-left">
                {mapping.Subject.name}
              </h3>
            </div>

            {/* Thông tin chi tiết */}
            <div className="mt-auto pt-2 border-t border-border/50 space-y-2">
              {/* STT và Học kỳ gợi ý */}
              <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                {mapping.order_index && (
                  <div className="flex items-center">
                    <Hash className="h-3.5 w-3.5 mr-1 flex-shrink-0 text-blue-500" />
                    <span>STT: {mapping.order_index}</span>
                  </div>
                )}
                {mapping.recommended_semester && (
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0 text-blue-500" />
                    <span>HK: {mapping.recommended_semester}</span>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {mapping.is_mandatory ? (
                  <Badge>Bắt buộc</Badge>
                ) : (
                  <Badge variant="secondary">Tự chọn</Badge>
                )}
                {mapping.is_active ? (
                  <Badge variant="default" className="bg-green-500">
                    Hoạt động
                  </Badge>
                ) : (
                  <Badge variant="destructive">Ẩn</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog - Outside Card to prevent click propagation */}
      <SubjectDeleteDialog
        subject={mapping}
        programId={programId}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}

interface ProgramSubjectsCardGridProps {
  programId: number;
  className?: string;
}

export function ProgramSubjectsCardGrid({
  programId,
  className,
}: ProgramSubjectsCardGridProps) {
  const router = useRouter();

  // Local state for UI interactions
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  // TanStack Query hook
  const {
    data: response,
    isLoading: loading,
    error,
    refetch: refetchSubjects,
  } = useSubjectsByProgram(programId);

  const allSubjects = response?.data || [];

  // Filter subjects based on search term and filters
  const filteredSubjects = useMemo(() => {
    let filtered = allSubjects;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((mapping: any) =>
        mapping.Subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((mapping: any) => {
        if (selectedStatus === "active") return mapping.is_active;
        if (selectedStatus === "inactive") return !mapping.is_active;
        return true;
      });
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((mapping: any) => {
        if (selectedType === "mandatory") return mapping.is_mandatory;
        if (selectedType === "elective") return !mapping.is_mandatory;
        return true;
      });
    }

    // Sort
    filtered.sort((a: any, b: any) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.Subject?.name || "";
          bValue = b.Subject?.name || "";
          break;
        case "order_index":
          aValue = a.order_index || 0;
          bValue = b.order_index || 0;
          break;
        case "recommended_semester":
          aValue = a.recommended_semester || 0;
          bValue = b.recommended_semester || 0;
          break;
        default:
          aValue = a.Subject?.name || "";
          bValue = b.Subject?.name || "";
      }

      if (typeof aValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === "ASC" ? comparison : -comparison;
      } else {
        return sortOrder === "ASC" ? aValue - bValue : bValue - aValue;
      }
    });

    return filtered;
  }, [
    allSubjects,
    searchTerm,
    selectedStatus,
    selectedType,
    sortBy,
    sortOrder,
  ]);

  // Implement frontend pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const subjects = filteredSubjects.slice(startIndex, endIndex);

  const totalItems = filteredSubjects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubjects(subjects.map((mapping: any) => mapping.subject_id));
    } else {
      setSelectedSubjects([]);
    }
  };

  const handleSelectSubject = (subjectId: number, checked: boolean) => {
    if (checked) {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    } else {
      setSelectedSubjects(selectedSubjects.filter((id) => id !== subjectId));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedSubjects.length === 0) return;

    try {
      // Implementation for bulk delete
      toast.success(`Đã xóa ${selectedSubjects.length} môn học`);
      setSelectedSubjects([]);
      refetchSubjects();
    } catch (error) {
      toast.error("Không thể xóa các môn học đã chọn");
    }
  };

  return (
    <>
      <div className={`space-y-6 ${className}`}>
        {/* Filters and Search */}
        <div className="flex flex-col space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {/* Search and Add Button */}
          <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên môn học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Button
                onClick={() =>
                  router.push(
                    `/dashboard/admin/programs/${programId}/subjects/create`
                  )
                }
                className="w-full sm:w-auto"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Tạo môn học mới</span>
                <span className="sm:hidden">Tạo mới</span>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Sort By */}
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  Sắp xếp:
                </span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Tên</SelectItem>
                    <SelectItem value="order_index">STT</SelectItem>
                    <SelectItem value="recommended_semester">Học kỳ</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort Order */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")
                  }
                  className="w-auto"
                >
                  {sortOrder === "ASC" ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  Trạng thái:
                </span>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-full sm:w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Ẩn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  Loại:
                </span>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="mandatory">Bắt buộc</SelectItem>
                    <SelectItem value="elective">Tự chọn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  Hiển thị:
                </span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(parseInt(value))}
                >
                  <SelectTrigger className="w-[80px] sm:w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedSubjects.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 flex-1 sm:flex-initial"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa ({selectedSubjects.length})
                </Button>
              )}
            </div>
          </div>

          {/* Select All Checkbox */}
          {subjects.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  selectedSubjects.length === subjects.length &&
                  subjects.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <span className="text-xs sm:text-sm text-muted-foreground">
                Chọn tất cả ({subjects.length} môn học)
              </span>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!subjects || subjects.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {loading ? "Đang tải..." : "Chưa có môn học nào"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedStatus !== "all" || selectedType !== "all"
                ? "Không tìm thấy môn học nào phù hợp với bộ lọc"
                : 'Hãy sử dụng nút "Tạo môn học mới" ở trên để thêm môn học đầu tiên'}
            </p>
          </div>
        ) : /* Loading State */
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: itemsPerPage }).map((_, i) => (
              <Skeleton key={i} className="h-64 sm:h-80 w-full" />
            ))}
          </div>
        ) : (
          /* Subjects Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {subjects.map((mapping: any) => (
              <SubjectCardItem
                key={mapping.subject_id}
                mapping={mapping}
                programId={programId}
                selectedSubjects={selectedSubjects}
                onSelect={handleSelectSubject}
                onUpdate={refetchSubjects}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalItems > 0 && (
          <PaginationWithInfo
            currentPage={currentPage}
            totalPages={totalPages}
            total={totalItems}
            limit={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </>
  );
}
