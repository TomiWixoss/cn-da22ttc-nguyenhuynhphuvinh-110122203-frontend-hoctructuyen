"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Plus,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/display";
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
import { Skeleton } from "@/components/ui/feedback";

import { usePrograms, useDeleteProgram } from "@/lib/hooks/use-programs";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast-utils";
import type {
  ProgramWithRelations,
  ProgramFilterParams,
} from "@/lib/types/program-management";
import { ProgramDeleteDialog } from "./program-delete-dialog";

interface ProgramsDataTableProps {
  className?: string;
}

export function ProgramsDataTable({ className }: ProgramsDataTableProps) {
  const router = useRouter();

  // Local state for UI interactions
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([]);

  // Dialog state
  const [programToDelete, setProgramToDelete] =
    useState<ProgramWithRelations | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  // TanStack Query hooks
  const {
    data: programData,
    isLoading: loading,
    refetch: refetchPrograms,
  } = usePrograms({
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const deleteProgramMutation = useDeleteProgram();

  // Extract data from response
  const programs = programData?.data?.records || [];
  const totalPages = programData?.data?.pagination?.totalPages || 1;
  const totalItems = programData?.data?.pagination?.totalItems || 0;

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPrograms(programs.map((p) => p.program_id));
    } else {
      setSelectedPrograms([]);
    }
  };

  const handleSelectProgram = (programId: number, checked: boolean) => {
    if (checked) {
      setSelectedPrograms((prev) => [...prev, programId]);
    } else {
      setSelectedPrograms((prev) => prev.filter((id) => id !== programId));
    }
  };

  // Handle bulk actions
  const handleBulkDelete = async () => {
    if (selectedPrograms.length === 0) return;

    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa ${selectedPrograms.length} chương trình đã chọn?`
      )
    ) {
      return;
    }

    try {
      // Delete selected programs using mutation
      await Promise.all(
        selectedPrograms.map(
          (id) =>
            new Promise((resolve, reject) => {
              deleteProgramMutation.mutate(id, {
                onSuccess: resolve,
                onError: reject,
              });
            })
        )
      );

      showSuccessToast(
        `Đã xóa ${selectedPrograms.length} chương trình thành công`
      );
      setSelectedPrograms([]);
      refetchPrograms();
    } catch (error) {
      showErrorToast("Không thể xóa các chương trình đã chọn");
    }
  };

  const handleExportCSV = () => {
    // Simple CSV export implementation
    const csvContent = [
      ["Tên chương trình", "Mô tả", "Số POs", "Số PLOs", "Số Courses"],
      ...programs.map((program) => [
        program.name,
        program.description || "",
        program.POs?.length?.toString() || "0",
        program.PLOs?.length?.toString() || "0",
        program.Courses?.length?.toString() || "0",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `chuong-trinh-dao-tao-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  // Handle individual actions
  const handleView = (programId: number) => {
    router.push(`/dashboard/admin/programs/${programId}`);
  };

  const handleEdit = (programId: number) => {
    router.push(`/dashboard/admin/programs/${programId}/edit`);
  };

  const handleDelete = async (programId: number) => {
    const program = programs.find((p) => p.program_id === programId);
    if (!program) return;

    setProgramToDelete(program);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    showSuccessToast("Đã xóa chương trình thành công");
    refetchPrograms();
    setProgramToDelete(null);
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
  if (loading && programs.length === 0) {
    return (
      <div className={className}>
        <div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-80" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div>
        {/* Search and Controls */}
        <div className="flex flex-col space-y-4 mb-6">
          {/* Search and Add Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm chương trình..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => router.push("/dashboard/admin/programs/create")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm chương trình mới
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>

              {selectedPrograms.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa ({selectedPrograms.length})
                </Button>
              )}
            </div>
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
                      selectedPrograms.length === programs.length &&
                      programs.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="h-auto p-0 font-medium"
                  >
                    Tên chương trình
                    {renderSortIcon("name")}
                  </Button>
                </TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>POs</TableHead>
                <TableHead>PLOs</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Plus className="h-8 w-8" />
                      <p>Chưa có chương trình đào tạo nào</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push("/dashboard/admin/programs/create")
                        }
                      >
                        Tạo chương trình đầu tiên
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                programs.map((program) => (
                  <TableRow key={program.program_id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPrograms.includes(program.program_id)}
                        onCheckedChange={(checked) =>
                          handleSelectProgram(
                            program.program_id,
                            checked as boolean
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {program.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {program.description || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {program.POs?.length || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {program.PLOs?.length || 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {program.Courses?.length || 0}
                      </span>
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
                            onClick={() => handleView(program.program_id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(program.program_id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(program.program_id)}
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
          <div className="mt-4">
            <PaginationWithInfo
              currentPage={currentPage}
              totalPages={totalPages}
              total={totalItems}
              limit={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <ProgramDeleteDialog
        program={programToDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
