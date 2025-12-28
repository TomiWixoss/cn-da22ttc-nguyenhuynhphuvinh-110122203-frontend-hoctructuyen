// frontend/src/components/features/admin/los/los-data-table.tsx
"use client";

import React, { useState, useEffect } from "react"; // BỎ useMemo
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/display";
import { Button, Input, Checkbox } from "@/components/ui/forms";
import { toast } from "sonner";
import { LOWithRelations } from "@/lib/types/lo";
import { useLOs, useDeleteLO } from "@/lib/hooks/use-los";
import { loService } from "@/lib/services/api";
import { PaginationWithInfo } from "@/components/ui/navigation";
// THAY ĐỔI: Import components mới
import { LOActions } from "./lo-actions";
import { ConfirmDialog } from "@/components/ui/feedback/confirm-dialog"; // SỬ DỤNG LẠI ConfirmDialog CÓ SẴN
import { SubjectSelect } from "@/components/features/common/subject-select";
import { Search, ArrowUpDown, Trash2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { LOsDataTableSkeleton } from "./LOsDataTableSkeleton";

interface LOsDataTableProps {
  subjectId?: number;
  programId?: number;
  className?: string;
}

export function LOsDataTable({
  subjectId,
  programId,
  className,
}: LOsDataTableProps) {
  const router = useRouter();
  // Không cần state cho filteredLos, sẽ dùng useMemo
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<
    number | undefined
  >();
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sử dụng custom hook với server-side pagination
  const {
    data: losData,
    isLoading: loading,
    error,
    refetch,
  } = useLOs({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
    subject_id: subjectId || selectedSubjectId, // Sử dụng server-side filtering
  });

  // Extract response data with proper typing
  const responseData = (losData?.data || {}) as {
    los?: LOWithRelations[];
    totalItems?: number;
    totalPages?: number;
    currentPage?: number;
  };
  const allLos = responseData.los || [];
  const totalItems = responseData.totalItems || 0;
  const totalPages = responseData.totalPages || 1;
  const currentServerPage = responseData.currentPage || 1;

  // Use server pagination data directly (no client-side filtering needed)
  const displayLos = allLos;
  const [loToDelete, setLoToDelete] = useState<LOWithRelations | null>(null);

  // Selection state
  const [selectedLOs, setSelectedLOs] = useState<number[]>([]);

  // Logic xóa giờ sẽ do LOActions xử lý, chỉ cần hàm onUpdate
  const handleUpdate = () => {
    refetch();
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLOs(displayLos.map((lo: LOWithRelations) => lo.lo_id));
    } else {
      setSelectedLOs([]);
    }
  };

  const handleSelectLO = (loId: number, checked: boolean) => {
    if (checked) {
      setSelectedLOs((prev) => [...prev, loId]);
    } else {
      setSelectedLOs((prev) => prev.filter((id) => id !== loId));
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedLOs.length === 0) return;

    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa ${selectedLOs.length} chuẩn đầu ra đã chọn?`
      )
    ) {
      return;
    }

    try {
      await Promise.all(selectedLOs.map((id) => loService.deleteLO(id)));
      toast.success(`Đã xóa ${selectedLOs.length} chuẩn đầu ra thành công`);
      setSelectedLOs([]);
      refetch();
    } catch (error) {
      toast.error("Không thể xóa các chuẩn đầu ra đã chọn");
      console.error("Bulk delete error:", error);
    }
  };

  return (
    <div className={className}>
      <div className="mb-4 space-y-4">
        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          {/* Left: Search and Add Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Button
              onClick={() => {
                if (programId && subjectId) {
                  router.push(
                    `/dashboard/admin/programs/${programId}/subjects/${subjectId}/los/create`
                  );
                } else {
                  router.push("/dashboard/admin/los/create");
                }
              }}
              size="sm"
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Thêm CĐR mới</span>
              <span className="sm:hidden">Thêm mới</span>
            </Button>
          </div>

          {/* Right: Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {!subjectId && (
              <SubjectSelect
                value={selectedSubjectId}
                onValueChange={(newValue) => {
                  if (newValue !== selectedSubjectId) {
                    setSelectedSubjectId(newValue);
                    setCurrentPage(1);
                  }
                }}
                placeholder="Chọn môn học..."
              />
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                Hiển thị:
              </span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  const newValue = parseInt(value);
                  if (newValue !== itemsPerPage) {
                    setItemsPerPage(newValue);
                    setCurrentPage(1);
                  }
                }}
              >
                <SelectTrigger className="w-[80px] sm:w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedLOs.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="flex-1 sm:flex-initial"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa ({selectedLOs.length})
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="border rounded-lg overflow-x-auto mb-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100 dark:bg-muted/50 hover:bg-slate-100 dark:hover:bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedLOs.length === displayLos.length &&
                    displayLos.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Tên chuẩn đầu ra</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Chương</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <LOsDataTableSkeleton />
            ) : displayLos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            ) : (
              displayLos.map((lo: LOWithRelations) => (
                <TableRow key={lo.lo_id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedLOs.includes(lo.lo_id)}
                      onCheckedChange={(checked) =>
                        handleSelectLO(lo.lo_id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">{lo.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {lo.description || "Không có mô tả"}
                  </TableCell>
                  <TableCell>
                    {lo.Chapters && lo.Chapters.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {lo.Chapters.slice(0, 3).map((chapter) => (
                          <Badge
                            key={chapter.chapter_id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {chapter.name}
                          </Badge>
                        ))}
                        {lo.Chapters.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{lo.Chapters.length - 3}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Chưa liên kết chương
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {/* THAY ĐỔI: Sử dụng LOActions */}
                    <LOActions
                      lo={lo}
                      programId={programId}
                      subjectId={subjectId}
                      onUpdate={handleUpdate}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <PaginationWithInfo
        currentPage={currentPage}
        totalPages={totalPages}
        total={totalItems}
        limit={itemsPerPage}
        onPageChange={(page) => {
          setCurrentPage(page);
        }}
        className="mt-4"
      />
    </div>
  );
}
