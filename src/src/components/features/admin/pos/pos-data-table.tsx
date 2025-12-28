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

import { usePOsByProgram, useDeletePO } from "@/lib/hooks/use-pos";
import type { POWithRelations } from "@/lib/types/program-management";
import { PODeleteDialog } from "./po-delete-dialog";

interface POsDataTableProps {
  className?: string;
  programId: number; // Yêu cầu programId
}

export function POsDataTable({ className, programId }: POsDataTableProps) {
  const router = useRouter();

  // State quản lý UI
  const [selectedPOs, setSelectedPOs] = useState<number[]>([]);
  const [poToDelete, setPoToDelete] = useState<POWithRelations | null>(null);

  // State cho phân trang, tìm kiếm, sắp xếp
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  // Debounce search term để tránh gọi API liên tục
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // THAY ĐỔI LỚN: Sử dụng hook mới với bộ lọc từ backend
  const {
    data: poResponse,
    isLoading: loading,
    refetch: refetchPOs,
  } = usePOsByProgram(programId, {
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchTerm || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const deletePOMutation = useDeletePO();

  // Trích xuất dữ liệu từ response của API
  const responseData = poResponse?.data;
  const pos = Array.isArray(responseData)
    ? responseData
    : responseData?.pos || [];
  const pagination = Array.isArray(responseData) ? null : responseData;
  const totalItems = pagination?.totalItems || pos.length;
  const totalPages = pagination?.totalPages || Math.ceil(pos.length / pageSize);

  // Xử lý sắp xếp
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
    setCurrentPage(1); // Reset về trang đầu khi sắp xếp
  };

  // Xử lý chọn
  const handleSelectAll = (checked: boolean) => {
    setSelectedPOs(checked ? pos.map((po: any) => po.po_id) : []);
  };

  const handleSelectPO = (poId: number, checked: boolean) => {
    setSelectedPOs((prev) =>
      checked ? [...prev, poId] : prev.filter((id) => id !== poId)
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
    if (!poToDelete) return;

    deletePOMutation.mutate(poToDelete.po_id, {
      onSuccess: () => {
        setPoToDelete(null);
        refetchPOs();
      },
      onError: () => setPoToDelete(null),
    });
  };

  // Xử lý xóa hàng loạt
  const handleBulkDelete = async () => {
    if (selectedPOs.length === 0) return;
    // (Logic xóa hàng loạt sẽ được triển khai nếu có API hỗ trợ)
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
                placeholder="Tìm kiếm theo tên PO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Button
              onClick={() =>
                router.push(`/dashboard/admin/programs/${programId}/pos/create`)
              }
              className="w-full sm:w-auto"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Thêm PO mới</span>
              <span className="sm:hidden">Thêm mới</span>
            </Button>
          </div>

          {/* Right side: Filters */}
          <div className="flex items-center gap-2 flex-wrap">
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

            {selectedPOs.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="flex-1 sm:flex-initial"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa ({selectedPOs.length})
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
                      selectedPOs.length === pos.length && pos.length > 0
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
                    Tên PO {renderSortIcon("name")}
                  </Button>
                </TableHead>
                <TableHead className="min-w-[200px] hidden md:table-cell">
                  Mô tả
                </TableHead>
                <TableHead className="min-w-[120px]">PLOs</TableHead>
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
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8" />
                    </TableCell>
                  </TableRow>
                ))
              ) : pos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      {searchTerm ? "Không tìm thấy PO nào" : "Chưa có PO nào"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                pos.map((po: any) => (
                  <TableRow key={po.po_id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedPOs.includes(po.po_id)}
                        onCheckedChange={(checked) =>
                          handleSelectPO(po.po_id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium text-xs sm:text-sm">
                      {po.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs sm:text-sm hidden md:table-cell">
                      {po.description || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {po.PLOs && po.PLOs.length > 0 ? (
                          <>
                            {po.PLOs.slice(0, 2).map((plo: any) => (
                              <Badge
                                key={plo.plo_id}
                                variant="outline"
                                className="text-[10px] sm:text-xs"
                              >
                                PLO{plo.plo_id}
                              </Badge>
                            ))}
                            {po.PLOs.length > 2 && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] sm:text-xs"
                              >
                                +{po.PLOs.length - 2}
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
                                `/dashboard/admin/programs/${programId}/pos/${po.po_id}/edit`
                              )
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setPoToDelete(po)}
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
      {poToDelete && (
        <PODeleteDialog
          po={poToDelete}
          open={!!poToDelete}
          onOpenChange={(open) => !open && setPoToDelete(null)}
          onConfirm={handleDelete}
          isDeleting={deletePOMutation.isPending}
        />
      )}
    </>
  );
}
