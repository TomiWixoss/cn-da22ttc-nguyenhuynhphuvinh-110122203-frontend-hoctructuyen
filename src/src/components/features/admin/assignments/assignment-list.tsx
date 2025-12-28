"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/forms";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/layout/card";
import { Badge } from "@/components/ui/feedback";
import { Skeleton } from "@/components/ui/feedback";
import {
  Plus,
  Users,
  BookOpen,
  Calendar,
  Edit,
  Trash2,
  GraduationCap,
} from "lucide-react";
import { type TeacherAssignment } from "@/lib/services/api/assignment.service";
import { type Semester } from "@/lib/services/api/semester.service";
import { toast } from "sonner";
import { AssignmentModal } from "./assignment-modal";
import { ConfirmDialog } from "@/components/ui/feedback/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import {
  useAssignmentsBySemester,
  useDeleteAssignment,
} from "@/lib/hooks/use-assignments";

interface AssignmentListProps {
  selectedSemester: Semester | null;
  batchId: number;
}

export function AssignmentList({
  selectedSemester,
  batchId,
}: AssignmentListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] =
    useState<TeacherAssignment | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<TeacherAssignment | null>(
    null
  );

  const semesterId = selectedSemester?.semester_id || selectedSemester?.id || 0;

  // Use TanStack Query hooks
  const {
    data: assignmentsResponse,
    isLoading: loading,
    error,
  } = useAssignmentsBySemester(semesterId);

  const deleteAssignmentMutation = useDeleteAssignment();

  const assignments = assignmentsResponse?.success
    ? assignmentsResponse.data
    : [];

  const handleDeleteAssignment = async (assignment: TeacherAssignment) => {
    const assignmentId = assignment.assignment_id;
    if (!assignmentId) return;

    deleteAssignmentMutation.mutate(assignmentId, {
      onSuccess: () => {
        setDeleteConfirm(null);
      },
      onError: () => {
        setDeleteConfirm(null);
      },
    });
  };

  // Trạng thái chờ khi chưa chọn học kỳ
  if (!selectedSemester) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4" />
          <p className="font-medium">Chọn một học kỳ</p>
          <p className="text-sm">
            Chọn một học kỳ từ danh sách bên trái để xem và quản lý phân công.
          </p>
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
              <Users className="h-5 w-5" />
              Phân công cho {selectedSemester.name}
            </CardTitle>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo phân công
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Chưa có phân công nào cho học kỳ này.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <Card
                  key={assignment.assignment_id}
                  className="hover:bg-muted/30"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {assignment.Subject?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          GV: {assignment.Teacher?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAssignment(assignment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(assignment)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AssignmentModal
        mode="create"
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        defaultSemester={selectedSemester}
        onSuccess={() => {
          setShowCreateModal(false);
        }}
        batchId={batchId}
      />
      {editingAssignment && (
        <AssignmentModal
          mode="edit"
          assignment={editingAssignment}
          open={!!editingAssignment}
          onOpenChange={(open: boolean) => !open && setEditingAssignment(null)}
          onSuccess={() => {
            setEditingAssignment(null);
          }}
          batchId={batchId}
        />
      )}
      {deleteConfirm && (
        <ConfirmDialog
          open={!!deleteConfirm}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
          title="Xác nhận xóa phân công"
          description={`Bạn có chắc muốn xóa phân công này?`}
          onConfirm={() => handleDeleteAssignment(deleteConfirm)}
          variant="destructive"
        />
      )}
    </>
  );
}
