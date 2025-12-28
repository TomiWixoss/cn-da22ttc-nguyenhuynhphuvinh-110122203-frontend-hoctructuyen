"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTrainingBatches } from "@/lib/hooks/use-training-batches";
import { Skeleton } from "@/components/ui/feedback";
import { Card, CardContent } from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { Archive, Plus, Search, ArrowUp, ArrowDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import { PaginationWithInfo } from "@/components/ui/navigation";
import { TrainingBatchCard } from "./training-batch-card";
import type { TrainingBatchWithRelations } from "@/lib/types/training-batch";
import Link from "next/link";

export function TrainingBatchesCardGrid() {
  const router = useRouter();
  const { data: batchData, isLoading, error, refetch } = useTrainingBatches();

  // Local state for filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Handle different API response formats
  const allBatches = Array.isArray(batchData)
    ? batchData
    : batchData?.data?.records || [];

  // Filter and sort batches
  const filteredBatches = useMemo(() => {
    let filtered = allBatches;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((batch: TrainingBatchWithRelations) =>
        batch.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort(
      (a: TrainingBatchWithRelations, b: TrainingBatchWithRelations) => {
        let aValue, bValue;

        switch (sortBy) {
          case "name":
            aValue = a.name || "";
            bValue = b.name || "";
            break;
          case "start_year":
            aValue = a.start_year || 0;
            bValue = b.start_year || 0;
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
      }
    );

    return filtered;
  }, [allBatches, searchTerm, sortBy, sortOrder]);

  // Implement frontend pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const batches = filteredBatches.slice(startIndex, endIndex);

  const totalItems = filteredBatches.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Filters Skeleton */}
        <div className="flex flex-col gap-2 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Skeleton className="h-10 w-full sm:w-64" />
            <Skeleton className="h-10 w-full sm:w-auto" />
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-full">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Lỗi tải dữ liệu</h3>
        <p className="text-muted-foreground mb-4">
          Không thể tải danh sách khóa đào tạo
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
              placeholder="Tìm kiếm theo tên khóa đào tạo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <Button asChild className="w-full sm:w-auto" size="sm">
            <Link href="/dashboard/admin/training-batches/create">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Thêm khóa đào tạo</span>
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
                <SelectItem value="start_year">Năm bắt đầu</SelectItem>
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
      {!batches || batches.length === 0 ? (
        <div className="text-center py-12">
          <Archive className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {isLoading ? "Đang tải..." : "Chưa có khóa đào tạo nào"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "Không tìm thấy khóa đào tạo nào phù hợp với bộ lọc"
              : 'Hãy sử dụng nút "Thêm khóa đào tạo" ở trên để tạo khóa đào tạo đầu tiên'}
          </p>
        </div>
      ) : (
        /* Batches Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {batches.map((batch: TrainingBatchWithRelations) => (
            <TrainingBatchCard
              key={batch.batch_id}
              batch={batch}
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
