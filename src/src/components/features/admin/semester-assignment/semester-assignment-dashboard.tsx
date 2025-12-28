"use client";

import { useState, useEffect } from "react";
import { AssignmentMatrix } from "../assignments";
import { SemesterModal, SemesterCard } from "../semesters";
import {
  SemesterService,
  type Semester,
} from "@/lib/services/api/semester.service";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/layout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay";
import { ScrollArea, ScrollBar } from "@/components/ui/layout/scroll-area";
import { Button } from "@/components/ui/forms";
import {
  Plus,
  Calendar,
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  PlayCircle,
} from "lucide-react";
import {
  useSemestersByBatch,
  useActivateSemester,
  useDeleteSemester,
} from "@/lib/hooks/use-semesters";
import { ConfirmDialog } from "@/components/ui/feedback/confirm-dialog";
import { Badge } from "@/components/ui/feedback";
import { SemesterAssignmentDashboardSkeleton } from "./SemesterAssignmentDashboardSkeleton";

interface SemesterAssignmentDashboardProps {
  batchId: number;
}

export function SemesterAssignmentDashboard({
  batchId,
}: SemesterAssignmentDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("");
  // State cho các modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Semester | null>(null);

  const {
    data: semesters = [],
    isLoading,
    refetch,
  } = useSemestersByBatch(batchId);

  // Hooks cho các hành động
  const activateMutation = useActivateSemester();
  const deleteMutation = useDeleteSemester();

  // Lấy học kỳ đang hoạt động để tự động chọn khi vào trang
  useEffect(() => {
    if (semesters.length > 0 && !activeTab) {
      const activeSemester = semesters.find((s) => s.is_active);
      if (activeSemester) {
        setActiveTab(activeSemester.semester_id.toString());
      } else {
        // Nếu không có học kỳ active, chọn học kỳ đầu tiên
        setActiveTab(semesters[0].semester_id.toString());
      }
    }
  }, [semesters, activeTab]);

  const handleSuccess = () => {
    setEditingSemester(null);
    setShowCreateModal(false);
    refetch();
  };

  const handleActivate = (semesterId: number) => {
    activateMutation.mutate(semesterId, {
      onSuccess: () => refetch(),
    });
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    const semesterId = deleteConfirm.semester_id || deleteConfirm.id;
    if (!semesterId) return;

    deleteMutation.mutate(semesterId, {
      onSuccess: () => {
        setDeleteConfirm(null);
        // Nếu học kỳ bị xóa đang được chọn, chuyển về tab đầu tiên
        if (activeTab === semesterId.toString()) setActiveTab("");
      },
    });
  };

  if (isLoading) {
    return <SemesterAssignmentDashboardSkeleton />;
  }

  return (
    <>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-4 sm:space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
          <ScrollArea className="flex-1 whitespace-nowrap rounded-md pb-2">
            <TabsList className="inline-flex w-max space-x-1">
              {semesters.map((semester) => (
                <TabsTrigger
                  key={semester.semester_id}
                  value={semester.semester_id.toString()}
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  {semester.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Tạo học kỳ</span>
            <span className="sm:hidden">Tạo mới</span>
          </Button>
        </div>

        {semesters.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Chưa có học kỳ nào</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Hãy bắt đầu bằng cách tạo học kỳ đầu tiên cho khóa đào tạo này.
            </p>
          </div>
        ) : (
          semesters.map((semester) => (
            <TabsContent
              key={semester.semester_id}
              value={semester.semester_id.toString()}
              className="mt-0"
            >
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <CardTitle className="text-base sm:text-lg">
                        {semester.name}
                      </CardTitle>
                      {semester.is_active && (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800 text-xs"
                        >
                          Đang hoạt động
                        </Badge>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!semester.is_active && (
                          <DropdownMenuItem
                            onClick={() => handleActivate(semester.semester_id)}
                            disabled={activateMutation.isPending}
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Kích hoạt
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => setEditingSemester(semester)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteConfirm(semester)}
                          disabled={semester.is_active}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <AssignmentMatrix
                    selectedSemester={semester}
                    batchId={batchId}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))
        )}
      </Tabs>
      <SemesterModal
        mode="create"
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleSuccess}
        batchId={batchId}
      />
      {editingSemester && (
        <SemesterModal
          mode="edit"
          semester={editingSemester}
          open={!!editingSemester}
          onOpenChange={(open) => !open && setEditingSemester(null)}
          onSuccess={handleSuccess}
          batchId={batchId}
        />
      )}
      {deleteConfirm && (
        <ConfirmDialog
          open={!!deleteConfirm}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
          title="Xác nhận xóa học kỳ"
          description={`Bạn có chắc muốn xóa học kỳ "${deleteConfirm.name}"? Tất cả phân công liên quan cũng sẽ bị xóa.`}
          onConfirm={handleDelete}
          loading={deleteMutation.isPending}
          variant="destructive"
        />
      )}
    </>
  );
}
