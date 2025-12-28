"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/forms";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Plus, Calendar, Loader2 } from "lucide-react";
import {
  SemesterService,
  type Semester,
} from "@/lib/services/api/semester.service";
import { toast } from "sonner";
import { SemesterModal } from "./semester-modal";
import { ConfirmDialog } from "@/components/ui/feedback/confirm-dialog";
import { SemesterCard } from "./semester-card"; // IMPORT COMPONENT MỚI
import { Skeleton } from "@/components/ui/feedback";
import { useSemestersByBatch } from "@/lib/hooks/use-semesters";

interface SemesterListProps {
  selectedSemesterId?: number | null;
  onSemesterSelect: (semester: Semester | null) => void;
  isLoadingParent?: boolean;
  batchId: number;
}

export function SemesterList({
  selectedSemesterId,
  onSemesterSelect,
  isLoadingParent = false,
  batchId,
}: SemesterListProps) {
  const [activating, setActivating] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Semester | null>(null);

  const {
    data: semesters = [],
    isLoading: loading,
    refetch,
  } = useSemestersByBatch(batchId);

  const handleActivateSemester = async (semesterId: number) => {
    try {
      setActivating(semesterId);
      const response = await SemesterService.activateSemester(semesterId);
      if (response.success) {
        toast.success("Đã kích hoạt học kỳ thành công");
        await refetch();
      }
    } catch (error) {
      toast.error("Không thể kích hoạt học kỳ");
    } finally {
      setActivating(null);
    }
  };

  const handleDeleteSemester = async (semester: Semester) => {
    const semesterId = semester.semester_id || semester.id;
    if (!semesterId) return;
    try {
      await SemesterService.deleteSemester(semesterId);
      toast.success("Đã xóa học kỳ thành công");
      onSemesterSelect(null); // Bỏ chọn học kỳ đã xóa
      await refetch();
    } catch (error) {
      toast.error("Không thể xóa học kỳ này");
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading || isLoadingParent) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Danh sách học kỳ
            </CardTitle>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {semesters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Chưa có học kỳ nào.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {semesters.map((semester) => (
                <SemesterCard
                  key={semester.semester_id || semester.id}
                  semester={semester}
                  isSelected={
                    (semester.semester_id || semester.id) === selectedSemesterId
                  }
                  onSelect={onSemesterSelect}
                  onEdit={setEditingSemester}
                  onDelete={setDeleteConfirm}
                  onActivate={handleActivateSemester}
                  isActivating={
                    activating === (semester.semester_id || semester.id)
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <SemesterModal
        mode="create"
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          setShowCreateModal(false);
          refetch();
        }}
        batchId={batchId}
      />
      {editingSemester && (
        <SemesterModal
          mode="edit"
          semester={editingSemester}
          open={!!editingSemester}
          onOpenChange={(open: boolean) => !open && setEditingSemester(null)}
          onSuccess={() => {
            setEditingSemester(null);
            refetch();
          }}
          batchId={batchId}
        />
      )}
      {deleteConfirm && (
        <ConfirmDialog
          open={!!deleteConfirm}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
          title="Xác nhận xóa học kỳ"
          description={`Bạn có chắc muốn xóa học kỳ "${deleteConfirm.name}"?`}
          onConfirm={() => handleDeleteSemester(deleteConfirm)}
          variant="destructive"
        />
      )}
    </>
  );
}
