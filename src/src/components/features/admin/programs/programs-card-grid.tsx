"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePrograms } from "@/lib/hooks/use-programs";
import { Skeleton } from "@/components/ui/feedback";
import type { ProgramWithRelations } from "@/lib/types/program-management";
import { Card, CardContent } from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import {
  BookOpen,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Search,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
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
import { programService } from "@/lib/services/api";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast-utils";
import { ProgramDeleteDialog } from "./program-delete-dialog";
import Link from "next/link";
import { ProgramsCardGridSkeleton } from "./ProgramsCardGridSkeleton";

interface ProgramCardItemProps {
  program: ProgramWithRelations;
  onUpdate?: () => void;
}

function ProgramCardItem({ program, onUpdate }: ProgramCardItemProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/dashboard/admin/programs/${program.program_id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    router.push(`/dashboard/admin/programs/${program.program_id}/edit`);
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    showSuccessToast("Đã xóa chương trình thành công");
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
            {/* Header: Icon, tên chương trình và dropdown menu */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center text-muted-foreground min-w-0 flex-1">
                <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0 text-blue-500" />
                <span className="text-xs sm:text-sm line-clamp-1 font-medium">
                  Chương trình đào tạo
                </span>
              </div>

              {/* Dropdown menu ở góc trên bên phải */}
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

            {/* Tên chương trình - được ưu tiên hiển thị */}
            <div className="flex-1 flex items-start py-2">
              <h3 className="font-semibold text-base sm:text-lg text-foreground hover:text-primary transition-colors line-clamp-3 leading-tight text-left">
                {program.name}
              </h3>
            </div>

            {/* Mô tả chương trình */}
            {program.description && (
              <div className="mt-auto pt-2 border-t border-border/50">
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {program.description}
                </p>
              </div>
            )}

            {/* Duration nếu có */}
            {program.duration_years && (
              <div className="flex items-center text-muted-foreground mt-2">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0 text-blue-500" />
                <span className="text-xs sm:text-sm font-medium">
                  {program.duration_years} năm
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog - Outside Card to prevent click propagation */}
      <ProgramDeleteDialog
        program={program}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}

export function ProgramsCardGrid() {
  const router = useRouter();
  const { data: programData, isLoading, error, refetch } = usePrograms();

  // Local state for filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Handle different API response formats
  // Sometimes API returns array directly, sometimes wrapped in data.records
  const allPrograms = Array.isArray(programData)
    ? programData
    : programData?.data?.records || [];

  // Filter and sort programs
  const filteredPrograms = useMemo(() => {
    let filtered = allPrograms;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((program: ProgramWithRelations) =>
        program.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a: ProgramWithRelations, b: ProgramWithRelations) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name || "";
          bValue = b.name || "";
          break;
        case "duration":
          aValue = a.duration_years || 0;
          bValue = b.duration_years || 0;
          break;
        default:
          aValue = a.name || "";
          bValue = b.name || "";
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === "ASC" ? comparison : -comparison;
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "ASC" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

    return filtered;
  }, [allPrograms, searchTerm, sortBy, sortOrder]);

  // Implement frontend pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const programs = filteredPrograms.slice(startIndex, endIndex);

  const totalItems = filteredPrograms.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (isLoading) {
    return <ProgramsCardGridSkeleton itemsPerPage={itemsPerPage} />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Lỗi tải dữ liệu</h3>
        <p className="text-muted-foreground mb-4">
          Không thể tải danh sách chương trình đào tạo
        </p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        {/* Left: Search and Add Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên chương trình..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Button asChild className="w-full sm:w-auto" size="sm">
            <Link href="/dashboard/admin/programs/create">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Thêm chương trình</span>
              <span className="sm:hidden">Thêm mới</span>
            </Link>
          </Button>
        </div>

        {/* Right: Sort and Display */}
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
                <SelectItem value="duration">Thời gian</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")}
              className="w-auto"
            >
              {sortOrder === "ASC" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
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
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!programs || programs.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {isLoading ? "Đang tải..." : "Chưa có chương trình nào"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "Không tìm thấy chương trình nào phù hợp với bộ lọc"
              : 'Hãy sử dụng nút "Thêm chương trình" ở trên để tạo chương trình đào tạo đầu tiên'}
          </p>
        </div>
      ) : (
        /* Programs Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {programs.map((program: ProgramWithRelations) => (
            <ProgramCardItem
              key={program.program_id}
              program={program}
              onUpdate={refetch}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalItems > 0 && (
        <PaginationWithInfo
          currentPage={currentPage}
          totalPages={totalPages}
          total={totalItems}
          limit={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
