// frontend/src/components/features/admin/relationships/LOChapterAssociationMatrix.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
// THAY ĐỔI: Import hook mới
import {
  useChaptersBySubject,
  useUpdateChapterLOs,
} from "@/lib/hooks/use-chapters";
import { useLOs } from "@/lib/hooks/use-los";
import { Checkbox } from "@/components/ui/forms";
import { Button } from "@/components/ui/forms";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/display";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { AssociationMatrixSkeleton } from "./AssociationMatrixSkeleton";

interface LOChapterAssociationMatrixProps {
  subjectId: number;
}

export function LOChapterAssociationMatrix({
  subjectId,
}: LOChapterAssociationMatrixProps) {
  // Lấy tất cả chapters và LOs không phân trang
  const {
    data: chapters,
    isLoading: chaptersLoading,
    refetch: refetchChapters,
  } = useChaptersBySubject(subjectId, 1, 1000);

  // THAY ĐỔI: Sử dụng useLOs với filter subject_id và limit cao
  const { data: losResponse, isLoading: losLoading } = useLOs({
    subject_id: subjectId,
    limit: 1000,
  });

  // THAY ĐỔI: Sử dụng hook mới
  const updateChapterLOsMutation = useUpdateChapterLOs();

  const [associations, setAssociations] = useState<Map<number, Set<number>>>(
    new Map()
  );
  const [initialAssociations, setInitialAssociations] = useState<
    Map<number, Set<number>>
  >(new Map());
  const [isSaving, setIsSaving] = useState(false);

  // Trích xuất dữ liệu LOs từ response
  const los = useMemo(() => {
    const data = losResponse?.data;
    if (!data) return [];
    // Xử lý cả 2 trường hợp: data.los hoặc data trực tiếp là array
    return Array.isArray(data) ? data : data.los || [];
  }, [losResponse]);

  useEffect(() => {
    if (chapters && chapters.length > 0) {
      const initialMap = new Map<number, Set<number>>();
      chapters.forEach((chapter) => {
        const loIds = new Set<number>(
          chapter.LOs?.map((lo: any) => lo.lo_id) || []
        );
        initialMap.set(chapter.chapter_id, loIds);
      });
      setAssociations(new Map(initialMap));
      setInitialAssociations(new Map(initialMap));
    }
  }, [chapters]);

  const handleToggle = (chapterId: number, loId: number) => {
    setAssociations((prev) => {
      const newMap = new Map(prev);
      const loIds = new Set(newMap.get(chapterId) || []);
      if (loIds.has(loId)) {
        loIds.delete(loId);
      } else {
        loIds.add(loId);
      }
      newMap.set(chapterId, loIds);
      return newMap;
    });
  };

  // THAY ĐỔI: Logic lưu trữ được cập nhật hoàn toàn
  const handleSave = async () => {
    setIsSaving(true);
    const promises: Promise<any>[] = [];
    const changedChaptersMap = new Map<number, number[]>();

    // So sánh trạng thái hiện tại và ban đầu để tìm các chapter đã thay đổi
    associations.forEach((currentLoIdsSet, chapterId) => {
      const initialLoIdsSet = initialAssociations.get(chapterId) || new Set();
      // Chuyển Set thành mảng đã sắp xếp để so sánh
      const currentLoIds = Array.from(currentLoIdsSet).sort();
      const initialLoIds = Array.from(initialLoIdsSet).sort();

      if (JSON.stringify(currentLoIds) !== JSON.stringify(initialLoIds)) {
        changedChaptersMap.set(chapterId, currentLoIds);
      }
    });

    // Xử lý các chapter mà tất cả liên kết đã bị xóa
    initialAssociations.forEach((initialLoIdsSet, chapterId) => {
      if (!associations.has(chapterId) && initialLoIdsSet.size > 0) {
        changedChaptersMap.set(chapterId, []);
      }
    });

    if (changedChaptersMap.size === 0) {
      toast.info("Không có thay đổi nào để lưu.");
      setIsSaving(false);
      return;
    }

    // Tạo các promise để cập nhật
    changedChaptersMap.forEach((loIds, chapterId) => {
      promises.push(
        updateChapterLOsMutation.mutateAsync({ chapterId, loIds, subjectId })
      );
    });

    try {
      await Promise.all(promises);
      toast.success("Đã lưu các liên kết thành công!");
      // Tải lại dữ liệu sau khi lưu để cập nhật trạng thái ban đầu
      await refetchChapters();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu một vài thay đổi.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = useMemo(() => {
    if (initialAssociations.size !== associations.size) return true;
    for (const [chapterId, initialLoIds] of initialAssociations.entries()) {
      const currentLoIds = associations.get(chapterId);
      if (!currentLoIds || currentLoIds.size !== initialLoIds.size) return true;
      for (const loId of initialLoIds) {
        if (!currentLoIds.has(loId)) return true;
      }
      for (const loId of currentLoIds) {
        if (!initialLoIds.has(loId)) return true;
      }
    }
    return false;
  }, [associations, initialAssociations]);

  if (chaptersLoading || losLoading) {
    return (
      <AssociationMatrixSkeleton
        title="Ma trận liên kết LO - Chapter"
        description="Đánh dấu để tạo liên kết giữa Chuẩn đầu ra môn học (hàng) và Chương (cột)."
        rows={6}
        cols={4}
      />
    );
  }

  if (!chapters || chapters.length === 0 || !los || los.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6 text-center text-muted-foreground">
          <AlertCircle className="mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-medium">Thiếu Dữ Liệu</h3>
          <p className="mt-2 text-sm">
            Môn học này cần có ít nhất một Chương và một Chuẩn đầu ra (LO) để
            thiết lập liên kết.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          Ma trận liên kết Chapter - LO
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Đánh dấu vào các ô để tạo liên kết giữa Chương (hàng) và Chuẩn đầu ra
          (cột). Nhấn "Lưu thay đổi" để áp dụng.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {/* Desktop view - Table */}
        <div className="hidden lg:block overflow-x-auto border rounded-lg">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-slate-100 dark:bg-muted/50">
                <TableHead className="min-w-[300px] sticky left-0 bg-slate-100 dark:bg-muted/50 z-10 font-semibold text-foreground">
                  Chương học (Chapter)
                </TableHead>
                {los.map((lo: any) => (
                  <TableHead
                    key={lo.lo_id}
                    className="text-center min-w-[150px] font-semibold text-foreground"
                    title={lo.description}
                  >
                    {lo.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {chapters.map((chapter: any) => (
                <TableRow key={chapter.chapter_id}>
                  <TableCell className="font-medium sticky left-0 bg-background/95 z-10">
                    {chapter.name}
                  </TableCell>
                  {los.map((lo: any) => (
                    <TableCell key={lo.lo_id} className="text-center">
                      <Checkbox
                        className="h-5 w-5"
                        checked={
                          associations.get(chapter.chapter_id)?.has(lo.lo_id) ||
                          false
                        }
                        onCheckedChange={() =>
                          handleToggle(chapter.chapter_id, lo.lo_id)
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile view - Card list */}
        <div className="lg:hidden space-y-3">
          {chapters.map((chapter: any) => (
            <div
              key={chapter.chapter_id}
              className="border rounded-lg p-3 bg-muted/30"
            >
              <h4 className="font-semibold text-sm mb-3 pb-2 border-b">
                {chapter.name}
              </h4>
              <div className="space-y-2">
                {los.map((lo: any) => (
                  <label
                    key={lo.lo_id}
                    htmlFor={`mobile-ch${chapter.chapter_id}-lo${lo.lo_id}`}
                    className="flex items-center gap-3 p-2 rounded hover:bg-background cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={
                        associations.get(chapter.chapter_id)?.has(lo.lo_id) ||
                        false
                      }
                      onCheckedChange={() =>
                        handleToggle(chapter.chapter_id, lo.lo_id)
                      }
                      id={`mobile-ch${chapter.chapter_id}-lo${lo.lo_id}`}
                    />
                    <span className="text-sm flex-1">{lo.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4 sm:mt-6">
          <Button
            onClick={handleSave}
            disabled={
              !hasChanges || isSaving || updateChapterLOsMutation.isPending
            }
            size="sm"
            className="w-full sm:w-auto"
          >
            {(isSaving || updateChapterLOsMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
