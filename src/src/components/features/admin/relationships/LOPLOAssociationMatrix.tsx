// frontend/src/components/features/admin/relationships/LOPLOAssociationMatrix.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  useLOs,
  useAddPLOsToLO,
  useRemovePLOsFromLO,
} from "@/lib/hooks/use-los";
import { usePLOsByProgram } from "@/lib/hooks/use-plos";
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

interface LOPLOAssociationMatrixProps {
  subjectId: number;
  programId: number;
}

export function LOPLOAssociationMatrix({
  subjectId,
  programId,
}: LOPLOAssociationMatrixProps) {
  // 1. Tải dữ liệu LOs và PLOs
  // THAY ĐỔI: Sử dụng hook useLOs với filter theo subject_id để đảm bảo nhận được dữ liệu PLOs
  const {
    data: losResponse,
    isLoading: losLoading,
    refetch: refetchLos,
  } = useLOs({
    subject_id: subjectId,
    limit: 1000, // Lấy tất cả LOs của môn học này
  });
  const { data: plosResponse, isLoading: plosLoading } = usePLOsByProgram(
    programId,
    { limit: 1000 }
  );
  usePLOsByProgram(programId);

  // 2. Sử dụng mutations
  const addPLOsMutation = useAddPLOsToLO();
  const removePLOsMutation = useRemovePLOsFromLO();

  // 3. State quản lý ma trận
  const [associations, setAssociations] = useState<Map<number, Set<number>>>(
    new Map()
  );
  const [initialAssociations, setInitialAssociations] = useState<
    Map<number, Set<number>>
  >(new Map());
  const [isSaving, setIsSaving] = useState(false);

  const los = useMemo(() => losResponse?.data?.los || [], [losResponse]);
  const plos = useMemo(() => {
    const plosData = plosResponse?.success
      ? (plosResponse.data as any).plos || plosResponse.data
      : [];
    return Array.isArray(plosData) ? plosData : [];
  }, [plosResponse]);

  // 4. Khởi tạo trạng thái ma trận
  useEffect(() => {
    if (los.length > 0) {
      const initialMap = new Map<number, Set<number>>();
      los.forEach((lo: any) => {
        const ploIds = new Set<number>(
          lo.PLOs?.map((plo: any) => plo.plo_id) || []
        );
        initialMap.set(lo.lo_id, ploIds);
      });
      setAssociations(new Map(initialMap));
      setInitialAssociations(new Map(initialMap));
    }
  }, [los]);

  // 5. Xử lý tick/un-tick
  const handleToggle = (loId: number, ploId: number) => {
    setAssociations((prev) => {
      const newMap = new Map(prev);
      const ploIds = new Set(newMap.get(loId) || []);
      if (ploIds.has(ploId)) {
        ploIds.delete(ploId);
      } else {
        ploIds.add(ploId);
      }
      newMap.set(loId, ploIds);
      return newMap;
    });
  };

  // 6. Xử lý lưu thay đổi
  const handleSave = async () => {
    setIsSaving(true);
    const promises = [];

    for (const [loId, currentPloIds] of associations.entries()) {
      const initialPloIds = initialAssociations.get(loId) || new Set();

      const addedPloIds = [...currentPloIds].filter(
        (id) => !initialPloIds.has(id)
      );
      const removedPloIds = [...initialPloIds].filter(
        (id) => !currentPloIds.has(id)
      );

      if (addedPloIds.length > 0) {
        promises.push(
          addPLOsMutation.mutateAsync({ loId, ploIds: addedPloIds })
        );
      }
      if (removedPloIds.length > 0) {
        promises.push(
          removePLOsMutation.mutateAsync({ loId, ploIds: removedPloIds })
        );
      }
    }

    if (promises.length === 0) {
      toast.info("Không có thay đổi nào để lưu.");
      setIsSaving(false);
      return;
    }

    try {
      await Promise.all(promises);
      toast.success("Đã lưu các liên kết thành công!");
      await refetchLos();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu thay đổi.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = useMemo(() => {
    if (initialAssociations.size !== associations.size) return true;
    for (const [loId, initialPloIds] of initialAssociations.entries()) {
      const currentPloIds = associations.get(loId) || new Set();
      if (currentPloIds.size !== initialPloIds.size) return true;
      for (const ploId of initialPloIds) {
        if (!currentPloIds.has(ploId)) return true;
      }
    }
    return false;
  }, [associations, initialAssociations]);

  if (losLoading || plosLoading) {
    return (
      <AssociationMatrixSkeleton
        title="Ma trận liên kết LO - PLO"
        description="Đánh dấu để tạo liên kết giữa Chuẩn đầu ra môn học (hàng) và Chuẩn đầu ra chương trình (cột)."
        rows={6}
        cols={5}
      />
    );
  }

  if (los.length === 0 || plos.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6 text-center text-muted-foreground">
          <AlertCircle className="mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-medium">Thiếu Dữ Liệu</h3>
          <p className="mt-2 text-sm">
            Cần có ít nhất một Chuẩn đầu ra môn học (LO) và một Chuẩn đầu ra
            chương trình (PLO) để thiết lập liên kết.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          Ma trận liên kết LO - PLO
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Đánh dấu vào các ô để tạo liên kết giữa Chuẩn đầu ra môn học (hàng) và
          Chuẩn đầu ra chương trình (cột).
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {/* Desktop view - Table */}
        <div className="hidden lg:block overflow-x-auto border rounded-lg">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-slate-100 dark:bg-muted/50">
                <TableHead className="min-w-[300px] sticky left-0 bg-slate-100 dark:bg-muted/50 z-10 font-semibold text-foreground">
                  Chuẩn đầu ra môn học (LO)
                </TableHead>
                {plos.map((plo: any) => (
                  <TableHead
                    key={plo.plo_id}
                    className="text-center min-w-[150px] font-semibold text-foreground"
                  >
                    {plo.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {los.map((lo: any) => (
                <TableRow key={lo.lo_id}>
                  <TableCell className="font-medium sticky left-0 bg-background/95 z-10">
                    {lo.name}
                  </TableCell>
                  {plos.map((plo: any) => (
                    <TableCell key={plo.plo_id} className="text-center">
                      <Checkbox
                        className="h-5 w-5"
                        checked={
                          associations.get(lo.lo_id)?.has(plo.plo_id) || false
                        }
                        onCheckedChange={() =>
                          handleToggle(lo.lo_id, plo.plo_id)
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
          {los.map((lo: any) => (
            <div key={lo.lo_id} className="border rounded-lg p-3 bg-muted/30">
              <h4 className="font-semibold text-sm mb-3 pb-2 border-b">
                {lo.name}
              </h4>
              <div className="space-y-2">
                {plos.map((plo: any) => (
                  <label
                    key={plo.plo_id}
                    htmlFor={`mobile-lo${lo.lo_id}-plo${plo.plo_id}`}
                    className="flex items-center gap-3 p-2 rounded hover:bg-background cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={
                        associations.get(lo.lo_id)?.has(plo.plo_id) || false
                      }
                      onCheckedChange={() => handleToggle(lo.lo_id, plo.plo_id)}
                      id={`mobile-lo${lo.lo_id}-plo${plo.plo_id}`}
                    />
                    <span className="text-sm flex-1">{plo.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4 sm:mt-6">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            size="sm"
            className="w-full sm:w-auto"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
