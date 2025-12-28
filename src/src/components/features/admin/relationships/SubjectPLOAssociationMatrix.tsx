"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSubjectsByProgram } from "@/lib/hooks/use-subjects";
import { usePLOsByProgram } from "@/lib/hooks/use-plos";
import {
  useAddPLOsToSubject,
  useRemovePLOsFromSubject,
} from "@/lib/hooks/use-subjects";
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

interface SubjectPLOAssociationMatrixProps {
  programId: number;
}

export function SubjectPLOAssociationMatrix({
  programId,
}: SubjectPLOAssociationMatrixProps) {
  // Lấy tất cả subjects và PLOs không phân trang
  const { data: subjectsResponse, isLoading: subjectsLoading } =
    useSubjectsByProgram(programId);
  const {
    data: plosResponse,
    isLoading: plosLoading,
    refetch: refetchSubjects, // Dùng để tải lại cả subject (với PLOs)
  } = usePLOsByProgram(programId, { limit: 1000 });

  const addPLOsMutation = useAddPLOsToSubject();
  const removePLOsMutation = useRemovePLOsFromSubject();

  const [associations, setAssociations] = useState<Map<number, Set<number>>>(
    new Map()
  );
  const [initialAssociations, setInitialAssociations] = useState<
    Map<number, Set<number>>
  >(new Map());
  const [isSaving, setIsSaving] = useState(false);

  // THAY ĐỔI: Thêm log và logic trích xuất dữ liệu an toàn hơn
  const subjects = useMemo(() => {
    const subjectsData = subjectsResponse?.success
      ? subjectsResponse.data || []
      : [];
    return Array.isArray(subjectsData) ? subjectsData : [];
  }, [subjectsResponse]);

  const plos = useMemo(() => {
    let plosData: any[] = [];
    if (plosResponse?.success && plosResponse.data) {
      const data = plosResponse.data as any;
      if (Array.isArray(data)) {
        plosData = data;
      } else if (data.plos && Array.isArray(data.plos)) {
        plosData = data.plos;
      }
    }
    return plosData;
  }, [plosResponse]);

  useEffect(() => {
    if (subjects.length > 0) {
      const initialMap = new Map<number, Set<number>>();
      subjects.forEach((subject: any) => {
        const ploIds = new Set<number>();
        // Lấy PLOs từ subject.PLOs (nếu có)
        if (subject.PLOs && Array.isArray(subject.PLOs)) {
          subject.PLOs.forEach((plo: any) => {
            if (plo.plo_id) {
              ploIds.add(plo.plo_id);
            }
          });
        }
        // Hoặc lấy từ PLOs data nếu subject không có PLOs
        else if (plos.length > 0) {
          plos.forEach((plo: any) => {
            if (plo.Subjects && Array.isArray(plo.Subjects)) {
              const hasSubject = plo.Subjects.some(
                (s: any) => s.subject_id === subject.subject_id
              );
              if (hasSubject) {
                ploIds.add(plo.plo_id);
              }
            }
          });
        }
        initialMap.set(subject.subject_id, ploIds);
      });
      setAssociations(new Map(initialMap));
      setInitialAssociations(new Map(initialMap));
    }
  }, [subjects, plos]);

  const handleToggle = (subjectId: number, ploId: number) => {
    setAssociations((prev) => {
      const newMap = new Map(prev);
      const ploIds = new Set(newMap.get(subjectId) || []);
      if (ploIds.has(ploId)) {
        ploIds.delete(ploId);
      } else {
        ploIds.add(ploId);
      }
      newMap.set(subjectId, ploIds);
      return newMap;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const promises = [];

    for (const [subjectId, currentPloIds] of associations.entries()) {
      const initialPloIds = initialAssociations.get(subjectId) || new Set();
      const addedPloIds = [...currentPloIds].filter(
        (id) => !initialPloIds.has(id)
      );
      const removedPloIds = [...initialPloIds].filter(
        (id) => !currentPloIds.has(id)
      );

      if (addedPloIds.length > 0) {
        promises.push(
          addPLOsMutation.mutateAsync({
            subjectId,
            ploIds: addedPloIds,
            programId,
          })
        );
      }
      if (removedPloIds.length > 0) {
        promises.push(
          removePLOsMutation.mutateAsync({
            subjectId,
            ploIds: removedPloIds,
            programId,
          })
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
      // Tải lại dữ liệu subjects (bao gồm cả PLOs) để cập nhật trạng thái ban đầu
      await refetchSubjects();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu thay đổi.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = useMemo(() => {
    if (initialAssociations.size !== associations.size) return true;
    for (const [subjectId, initialPloIds] of initialAssociations.entries()) {
      const currentPloIds = associations.get(subjectId) || new Set();
      if (currentPloIds.size !== initialPloIds.size) return true;
      for (const ploId of initialPloIds) {
        if (!currentPloIds.has(ploId)) return true;
      }
      for (const ploId of currentPloIds) {
        if (!initialPloIds.has(ploId)) return true;
      }
    }
    return false;
  }, [associations, initialAssociations]);

  if (subjectsLoading || plosLoading) {
    return (
      <AssociationMatrixSkeleton
        title="Ma trận liên kết Môn học - PLO"
        description="Đánh dấu để tạo liên kết giữa Môn học (hàng) và PLO (cột)."
        rows={6}
        cols={5}
      />
    );
  }

  if (subjects.length === 0 || plos.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6 text-center text-muted-foreground">
          <AlertCircle className="mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-medium">Thiếu Dữ Liệu</h3>
          <p className="mt-2 text-sm">
            Chương trình này cần có ít nhất một Môn học và một Chuẩn đầu ra
            (PLO) để thiết lập liên kết.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          Ma trận liên kết Môn học - PLO
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Đánh dấu để tạo liên kết giữa Môn học (hàng) và PLO (cột).
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {/* Desktop view - Table */}
        <div className="hidden lg:block overflow-x-auto border rounded-lg">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-slate-100 dark:bg-muted/50">
                <TableHead className="min-w-[300px] sticky left-0 bg-slate-100 dark:bg-muted/50 z-10 font-semibold text-foreground">
                  Môn học (Subject)
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
              {subjects.map((subject: any) => (
                <TableRow key={subject.subject_id}>
                  <TableCell className="font-medium sticky left-0 bg-background/95 z-10">
                    {subject.Subject?.name ||
                      subject.name ||
                      `Subject ${subject.subject_id}`}
                  </TableCell>
                  {plos.map((plo: any) => (
                    <TableCell key={plo.plo_id} className="text-center">
                      <Checkbox
                        className="h-5 w-5"
                        checked={
                          associations
                            .get(subject.subject_id)
                            ?.has(plo.plo_id) || false
                        }
                        onCheckedChange={() =>
                          handleToggle(subject.subject_id, plo.plo_id)
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
          {subjects.map((subject: any) => (
            <div
              key={subject.subject_id}
              className="border rounded-lg p-3 bg-muted/30"
            >
              <h4 className="font-semibold text-sm mb-3 pb-2 border-b">
                {subject.Subject?.name ||
                  subject.name ||
                  `Subject ${subject.subject_id}`}
              </h4>
              <div className="space-y-2">
                {plos.map((plo: any) => (
                  <label
                    key={plo.plo_id}
                    htmlFor={`mobile-s${subject.subject_id}-plo${plo.plo_id}`}
                    className="flex items-center gap-3 p-2 rounded hover:bg-background cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={
                        associations.get(subject.subject_id)?.has(plo.plo_id) ||
                        false
                      }
                      onCheckedChange={() =>
                        handleToggle(subject.subject_id, plo.plo_id)
                      }
                      id={`mobile-s${subject.subject_id}-plo${plo.plo_id}`}
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
            disabled={
              !hasChanges ||
              isSaving ||
              addPLOsMutation.isPending ||
              removePLOsMutation.isPending
            }
            size="sm"
            className="w-full sm:w-auto"
          >
            {(isSaving ||
              addPLOsMutation.isPending ||
              removePLOsMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
