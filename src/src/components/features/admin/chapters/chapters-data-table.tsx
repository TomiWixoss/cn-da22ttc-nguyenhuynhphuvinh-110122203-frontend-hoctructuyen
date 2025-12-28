"use client";

import React, { useState, useMemo } from "react";
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
import {
  useChaptersBySubject,
  useDeleteChapter,
} from "@/lib/hooks/use-chapters";
import { Chapter } from "@/lib/services/api/chapter.service";
import { PaginationWithInfo } from "@/components/ui/navigation";
import { ConfirmDialog } from "@/components/ui/feedback/confirm-dialog";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  MoreHorizontal,
  BookOpen,
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
import { Badge } from "@/components/ui/feedback";
import { ChaptersDataTableSkeleton } from "./ChaptersDataTableSkeleton";

interface ChaptersDataTableProps {
  subjectId: number;
  programId: number; // Make it required
  className?: string;
}

export function ChaptersDataTable({
  subjectId,
  programId,
  className,
}: ChaptersDataTableProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedChapters, setSelectedChapters] = useState<number[]>([]);
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);

  // Fetch chapters data
  const {
    data: allChapters = [],
    isLoading: loading,
    error,
    refetch,
  } = useChaptersBySubject(subjectId, 1, 1000);

  const deleteChapterMutation = useDeleteChapter();

  // Filter chapters based on search term
  const filteredChapters = useMemo(() => {
    if (!searchTerm) return allChapters;

    const searchLower = searchTerm.toLowerCase();
    return allChapters.filter(
      (chapter: Chapter) =>
        chapter.name.toLowerCase().includes(searchLower) ||
        (chapter.description &&
          chapter.description.toLowerCase().includes(searchLower))
    );
  }, [allChapters, searchTerm]);

  // Pagination
  const totalItems = filteredChapters.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayChapters = filteredChapters.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedChapters(
        displayChapters.map((chapter: Chapter) => chapter.chapter_id)
      );
    } else {
      setSelectedChapters([]);
    }
  };

  const handleSelectChapter = (chapterId: number, checked: boolean) => {
    if (checked) {
      setSelectedChapters([...selectedChapters, chapterId]);
    } else {
      setSelectedChapters(selectedChapters.filter((id) => id !== chapterId));
    }
  };

  // Navigation handlers
  const handleCreateClick = () => {
    router.push(
      `/dashboard/admin/programs/${programId}/subjects/${subjectId}/chapters/create`
    );
  };

  const handleEditClick = (chapter: Chapter) => {
    router.push(
      `/dashboard/admin/programs/${programId}/subjects/${subjectId}/chapters/${chapter.chapter_id}/edit`
    );
  };

  const handleViewClick = (chapter: Chapter) => {
    router.push(
      `/dashboard/admin/programs/${programId}/subjects/${subjectId}/chapters/${chapter.chapter_id}`
    );
  };

  // Delete handlers
  const handleDeleteChapter = () => {
    if (chapterToDelete) {
      deleteChapterMutation.mutate({
        chapterId: chapterToDelete.chapter_id,
        subjectId: subjectId,
      });
      setChapterToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedChapters.length === 0) return;

    try {
      // Delete chapters one by one (could be optimized with bulk delete API)
      for (const chapterId of selectedChapters) {
        await deleteChapterMutation.mutateAsync({
          chapterId,
          subjectId,
        });
      }
      setSelectedChapters([]);
      toast.success(`Đã xóa ${selectedChapters.length} chương thành công!`);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa chương");
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <ChaptersDataTableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center text-red-500 py-10 ${className || ""}`}>
        Lỗi: Không thể tải danh sách chương.
      </div>
    );
  }

  return (
    <div className={className || ""}>
      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        {/* Left: Search and Add Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm chương..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Button
            onClick={handleCreateClick}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Thêm chương mới</span>
            <span className="sm:hidden">Thêm mới</span>
          </Button>
        </div>

        {/* Right: Filters */}
        <div className="flex items-center gap-2 flex-wrap">
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

          {selectedChapters.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 flex-1 sm:flex-initial"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa ({selectedChapters.length})
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100 dark:bg-muted/50 hover:bg-slate-100 dark:hover:bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedChapters.length === displayChapters.length &&
                    displayChapters.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Tên chương</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Chuẩn đầu ra</TableHead>
              <TableHead className="w-[120px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayChapters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Không tìm thấy chương nào phù hợp"
                      : "Chưa có chương nào"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              displayChapters.map((chapter: Chapter) => (
                <TableRow key={chapter.chapter_id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedChapters.includes(chapter.chapter_id)}
                      onCheckedChange={(checked) =>
                        handleSelectChapter(
                          chapter.chapter_id,
                          checked as boolean
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">{chapter.name}</TableCell>
                  <TableCell className="max-w-[300px]">
                    {chapter.description ? (
                      <span className="text-sm text-muted-foreground line-clamp-2">
                        {chapter.description}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        Không có mô tả
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {chapter.LOs && chapter.LOs.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {chapter.LOs.slice(0, 3).map((lo) => (
                          <Badge
                            key={lo.lo_id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {lo.name}
                          </Badge>
                        ))}
                        {chapter.LOs.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{chapter.LOs.length - 3}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Chưa liên kết LO
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewClick(chapter)}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditClick(chapter)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setChapterToDelete(chapter)}
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
        <PaginationWithInfo
          currentPage={currentPage}
          totalPages={totalPages}
          total={totalItems}
          limit={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      <ConfirmDialog
        open={!!chapterToDelete}
        onOpenChange={() => setChapterToDelete(null)}
        title="Xác nhận xóa chương"
        description={`Bạn có chắc chắn muốn xóa chương "${chapterToDelete?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDeleteChapter}
        loading={deleteChapterMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
