// frontend/src/components/features/admin/relationships/POPLOAssociationMatrix.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePOsByProgram } from "@/lib/hooks/use-pos";
import { usePLOsByProgram } from "@/lib/hooks/use-plos";
import {
  useAssociatePLOWithPO,
  useDisassociatePLOFromPO,
} from "@/lib/hooks/use-plos";
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

interface POPLOAssociationMatrixProps {
  programId: number;
}

export function POPLOAssociationMatrix({
  programId,
}: POPLOAssociationMatrixProps) {
  // 1. Tải dữ liệu POs và PLOs cho chương trình hiện tại (lấy tất cả không phân trang)
  const { data: posResponse, isLoading: posLoading } = usePOsByProgram(
    programId,
    { limit: 1000 }
  );
  const {
    data: plosResponse,
    isLoading: plosLoading,
    refetch: refetchPlos,
  } = usePLOsByProgram(programId, { limit: 1000 });

  // 2. Sử dụng mutations để thực hiện việc liên kết và hủy liên kết
  const associateMutation = useAssociatePLOWithPO();
  const disassociateMutation = useDisassociatePLOFromPO();

  // 3. State để quản lý ma trận liên kết
  const [associations, setAssociations] = useState<Map<number, Set<number>>>(
    new Map()
  );
  const [initialAssociations, setInitialAssociations] = useState<
    Map<number, Set<number>>
  >(new Map());
  const [isSaving, setIsSaving] = useState(false);

  // ✅ SỬA LỖI QUAN TRỌNG: Truy cập dữ liệu đúng cấu trúc từ các hook
  const pos = useMemo(() => {
    const posData = posResponse?.success
      ? (posResponse.data as any).pos || posResponse.data
      : [];
    return Array.isArray(posData) ? posData : [];
  }, [posResponse]);

  const plos = useMemo(() => {
    const plosData = plosResponse?.success
      ? (plosResponse.data as any).plos || plosResponse.data
      : [];
    return Array.isArray(plosData) ? plosData : [];
  }, [plosResponse]);

  // 4. Khởi tạo trạng thái ma trận khi dữ liệu được tải về
  useEffect(() => {
    if (plos.length > 0) {
      const initialMap = new Map<number, Set<number>>();
      plos.forEach((plo) => {
        // Mỗi PLO có một mảng POs liên kết với nó
        const poIds = new Set<number>(
          (plo as any).POs?.map((po: any) => po.po_id) || []
        );
        initialMap.set(plo.plo_id, poIds);
      });
      setAssociations(new Map(initialMap));
      setInitialAssociations(new Map(initialMap));
    }
  }, [plos]); // Phụ thuộc vào `plos` đã được xử lý

  // 5. Hàm xử lý khi người dùng tick/un-tick một checkbox
  const handleToggle = (ploId: number, poId: number) => {
    setAssociations((prev) => {
      const newMap = new Map(prev);
      const poIds = new Set(newMap.get(ploId) || []);
      if (poIds.has(poId)) {
        poIds.delete(poId);
      } else {
        poIds.add(poId);
      }
      newMap.set(ploId, poIds);
      return newMap;
    });
  };

  // 6. Hàm xử lý khi nhấn nút "Lưu thay đổi"
  const handleSave = async () => {
    setIsSaving(true);
    const additions: { ploId: number; poId: number }[] = [];
    const removals: { ploId: number; poId: number }[] = [];

    // So sánh trạng thái hiện tại và ban đầu để tìm ra thay đổi
    associations.forEach((currentPoIds, ploId) => {
      const initialPoIds = initialAssociations.get(ploId) || new Set();
      currentPoIds.forEach((poId) => {
        if (!initialPoIds.has(poId)) {
          additions.push({ ploId, poId });
        }
      });
      initialPoIds.forEach((poId) => {
        if (!currentPoIds.has(poId)) {
          removals.push({ ploId, poId });
        }
      });
    });

    if (additions.length === 0 && removals.length === 0) {
      toast.info("Không có thay đổi nào để lưu.");
      setIsSaving(false);
      return;
    }

    // Truyền đủ 3 tham số vào mutation
    const promises = [
      ...additions.map((add) =>
        associateMutation.mutateAsync({ programId, ...add })
      ),
      ...removals.map((rem) =>
        disassociateMutation.mutateAsync({ programId, ...rem })
      ),
    ];

    try {
      await Promise.all(promises);
      toast.success("Đã lưu các liên kết thành công!");
      await refetchPlos(); // Tải lại dữ liệu sau khi lưu để cập nhật trạng thái ban đầu
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu thay đổi.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = useMemo(() => {
    if (initialAssociations.size !== associations.size) return true;
    for (const [ploId, initialPoIds] of initialAssociations.entries()) {
      const currentPoIds = associations.get(ploId);
      if (!currentPoIds || currentPoIds.size !== initialPoIds.size) return true;
      for (const poId of initialPoIds) {
        if (!currentPoIds.has(poId)) return true;
      }
    }
    // Check for additions not present in initial
    for (const [ploId, currentPoIds] of associations.entries()) {
      const initialPoIds = initialAssociations.get(ploId) || new Set();
      for (const poId of currentPoIds) {
        if (!initialPoIds.has(poId)) return true;
      }
    }
    return false;
  }, [associations, initialAssociations]);

  if (posLoading || plosLoading) {
    return (
      <AssociationMatrixSkeleton
        title="Ma trận liên kết PO - PLO"
        description="Đánh dấu vào các ô để tạo liên kết giữa Mục tiêu đào tạo (cột) và Chuẩn đầu ra (hàng)."
        rows={5}
        cols={5}
      />
    );
  }

  if (pos.length === 0 || plos.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6 text-center text-muted-foreground">
          <AlertCircle className="mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-medium">Thiếu Dữ Liệu</h3>
          <p className="mt-2 text-sm">
            Chương trình này cần có ít nhất một Mục tiêu đào tạo (PO) và một
            Chuẩn đầu ra (PLO) để thiết lập liên kết.
          </p>
          <p className="mt-1 text-sm">
            Vui lòng thêm PO và PLO trong các tab tương ứng.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          Ma trận liên kết PO - PLO
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Đánh dấu vào các ô để tạo liên kết giữa Mục tiêu đào tạo (cột) và
          Chuẩn đầu ra (hàng). Nhấn "Lưu thay đổi" để áp dụng.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {/* Desktop view - Table */}
        <div className="hidden lg:block overflow-x-auto border rounded-lg">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-slate-100 dark:bg-muted/50">
                <TableHead className="min-w-[300px] sticky left-0 bg-slate-100 dark:bg-muted/50 z-10 font-semibold text-foreground">
                  Chuẩn đầu ra (PLO)
                </TableHead>
                {pos.map((po: any) => (
                  <TableHead
                    key={po.po_id}
                    className="text-center min-w-[150px] font-semibold text-foreground"
                  >
                    {po.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {plos.map((plo: any) => (
                <TableRow key={plo.plo_id}>
                  <TableCell className="font-medium sticky left-0 bg-background/95 z-10">
                    {plo.name}
                  </TableCell>
                  {pos.map((po: any) => (
                    <TableCell key={po.po_id} className="text-center">
                      <Checkbox
                        className="h-5 w-5"
                        checked={
                          associations.get(plo.plo_id)?.has(po.po_id) || false
                        }
                        onCheckedChange={() =>
                          handleToggle(plo.plo_id, po.po_id)
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
          {plos.map((plo: any) => (
            <div key={plo.plo_id} className="border rounded-lg p-3 bg-muted/30">
              <h4 className="font-semibold text-sm mb-3 pb-2 border-b">
                {plo.name}
              </h4>
              <div className="space-y-2">
                {pos.map((po: any) => (
                  <label
                    key={po.po_id}
                    htmlFor={`mobile-plo${plo.plo_id}-po${po.po_id}`}
                    className="flex items-center gap-3 p-2 rounded hover:bg-background cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={
                        associations.get(plo.plo_id)?.has(po.po_id) || false
                      }
                      onCheckedChange={() => handleToggle(plo.plo_id, po.po_id)}
                      id={`mobile-plo${plo.plo_id}-po${po.po_id}`}
                    />
                    <span className="text-sm flex-1">{po.name}</span>
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
              !hasChanges ||
              isSaving ||
              associateMutation.isPending ||
              disassociateMutation.isPending
            }
            size="sm"
            className="w-full sm:w-auto"
          >
            {(isSaving ||
              associateMutation.isPending ||
              disassociateMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
