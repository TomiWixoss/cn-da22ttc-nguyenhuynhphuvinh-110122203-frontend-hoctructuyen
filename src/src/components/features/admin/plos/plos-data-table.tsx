"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  CheckSquare,
  Target,
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
import { Badge, Skeleton } from "@/components/ui/feedback";
import { toast } from "sonner";

import { usePLOsByProgram, useDeletePLO } from "@/lib/hooks/use-plos";
import { usePOsByProgram } from "@/lib/hooks/use-pos";
import type { PLOWithRelations, PO } from "@/lib/types/program-management";
import { PLODeleteDialog } from "./plo-delete-dialog";

interface PLOsDataTableProps {
  className?: string;
  programId: number; // Yêu cầu programId
}

export function PLOsDataTable({ className, programId }: PLOsDataTableProps) {
  const router = useRouter();

  // State quản lý UI
  const [selectedPLOs, setSelectedPLOs] = useState<number[]>([]);
  const [ploToDelete, setPloToDelete] = useState<PLOWithRelations | null>(null);

  // State cho phân trang, tìm kiếm, sắp xếp
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [selectedPO, setSelectedPO] = useState<string>("all");

  // Debounce search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Lấy danh sách POs để lọc
  const { data: posData } = usePOsByProgram(programId);
  const posResponseData = posData?.data;
  const posForFilter = Array.isArray(posResponseData)
    ? posResponseData
    : posResponseData?.pos || [];

  // THAY ĐỔI LỚN: Sử dụng hook mới với bộ lọc từ backend
  const {
    data: ploResponse,
    isLoading: loading,
    refetch: refetchPLOs,
  } = usePLOsByProgram(programId, {
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchTerm || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
    po_id: selectedPO !== "all" ? parseInt(selectedPO) : undefined,
  });

  const deletePLOMutation = useDeletePLO();

  // Trích xuất dữ liệu từ response
  const responseData = ploResponse?.data;
  const plos = Array.isArray(responseData)
    ? responseData
    : (responseData as any)?.plos || [];
  const pagination = Array.isArray(responseData) ? null : (responseData as any);
  const totalItems = pagination?.totalItems || plos.length;
  const totalPages =
    pagination?.totalPages || Math.ceil(plos.length / pageSize);

  // Sử dụng dữ liệu đã được phân trang từ backend
  const paginatedPlos = plos;

  // Xử lý sắp xếp
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
    setCurrentPage(1);
  };

  // Xử lý chọn
  const handleSelectAll = (checked: boolean) => {
    setSelectedPLOs(checked ? paginatedPlos.map((plo: any) => plo.plo_id) : []);
  };

  const handleSelectPLO = (ploId: number, checked: boolean) => {
    setSelectedPLOs((prev) =>
      checked ? [...prev, ploId] : prev.filter((id) => id !== ploId)
    );
  };

  // Render icon sắp xếp
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortOrder === "ASC" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  // Xử lý xóa
  const handleDelete = async () => {
    if (!ploToDelete) return;

    deletePLOMutation.mutate(ploToDelete.plo_id, {
      onSuccess: () => {
        setPloToDelete(null);
        refetchPLOs();
      },
      onError: () => setPloToDelete(null),
    });
  };

  // Xử lý xóa hàng loạt
  const handleBulkDelete = async () => {
    toast.info("Tính năng xóa hàng loạt đang được phát triển.");
  };

  return (
    <>
      <div className={className}>
        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4 sm:mb-6">
          {/* Left side: Search + Add button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm PLO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Button
              onClick={() =>
                router.push(
                  `/dashboard/admin/programs/${programId}/plos/create`
                )
              }
              className="w-full sm:w-auto"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Thêm PLO mới</span>
              <span className="sm:hidden">Thêm mới</span>
            </Button>
          </div>

          {/* Right side: Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                Lọc PO:
              </span>
              <Select value={selectedPO} onValueChange={setSelectedPO}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả PO</SelectItem>
                  {posForFilter.map((po: PO) => (
                    <SelectItem key={po.po_id} value={po.po_id.toString()}>
                      {po.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                Hiển thị:
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(parseInt(value))}
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

            {selectedPLOs.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="flex-1 sm:flex-initial"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa ({selectedPLOs.length})
              </Button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100 dark:bg-muted/50 hover:bg-slate-100 dark:hover:bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedPLOs.length === paginatedPlos.length &&
                      paginatedPlos.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="min-w-[150px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="h-auto p-0 font-semibold text-xs sm:text-sm"
                  >
                    Tên PLO {renderSortIcon("name")}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[200px] hidden lg:table-cell">
                  Mô tả
                </TableHead>
                <TableHead className="min-w-[120px] hidden md:table-cell">
                  PO liên quan
                </TableHead>
                <TableHead className="min-w-[120px]">Môn học</TableHead>
                <TableHead className="w-16 sm:w-20">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedPlos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      {searchTerm || selectedPO !== "all"
                        ? "Không tìm thấy PLO nào"
                        : "Chưa có PLO nào"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPlos.map((plo: any) => (
                  <TableRow key={plo.plo_id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPLOs.includes(plo.plo_id)}
                        onCheckedChange={(checked) =>
                          handleSelectPLO(plo.plo_id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-xs sm:text-sm">
                        {plo.name}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs hidden lg:table-cell">
                      <div className="font-medium truncate text-xs sm:text-sm">
                        {plo.description}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {plo.POs && plo.POs.length > 0 ? (
                          <>
                            {plo.POs.slice(0, 2).map((po: any) => (
                              <Badge
                                key={po.po_id}
                                variant="outline"
                                className="text-[10px] sm:text-xs"
                              >
                                {po.name}
                              </Badge>
                            ))}
                            {plo.POs.length > 2 && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] sm:text-xs"
                              >
                                +{plo.POs.length - 2}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground text-xs sm:text-sm">
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {plo.Subjects && plo.Subjects.length > 0 ? (
                          <>
                            {plo.Subjects.slice(0, 2).map((subject: any) => (
                              <Badge
                                key={subject.subject_id}
                                variant="outline"
                                className="text-[10px] sm:text-xs"
                              >
                                {subject.name}
                              </Badge>
                            ))}
                            {plo.Subjects.length > 2 && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] sm:text-xs"
                              >
                                +{plo.Subjects.length - 2}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground text-xs sm:text-sm">
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboard/admin/programs/${programId}/plos/${plo.plo_id}/edit`
                              )
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setPloToDelete(plo)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Xóa
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
        {!loading && totalItems > 0 && (
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
      </div>
      {ploToDelete && (
        <PLODeleteDialog
          plo={ploToDelete}
          open={!!ploToDelete}
          onOpenChange={(open) => !open && setPloToDelete(null)}
          onConfirm={handleDelete}
          isDeleting={deletePLOMutation.isPending}
        />
      )}
    </>
  );
}
