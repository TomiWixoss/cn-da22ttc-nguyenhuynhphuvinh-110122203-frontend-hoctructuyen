"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/forms/button";
import { Input } from "@/components/ui/forms/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/display/table";
import { Dialog, DialogContent } from "@/components/ui/feedback/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import { Badge } from "@/components/ui/feedback/badge";
import { Checkbox } from "@/components/ui/forms/checkbox";
import {
  Plus,
  Search,
  Trash2,
  Users,
  BookOpen,
  Upload,
  Filter,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import studentManagementService, {
  Student,
  CreateStudentRequest,
  UpdateStudentRequest,
  CourseStudent,
} from "@/lib/services/api/student-management.service";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";
import {
  useTeacherCourses,
  useTeacherStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  useRemoveStudentFromCourse,
  useBulkRemoveStudents,
  useAddStudentToCourse,
} from "@/lib/hooks/use-teaching";
import { Course } from "@/lib/types/course";
import CreateStudentForm from "@/components/features/student-management/create-student-form";
import ImportStudentsDialog from "@/components/features/student-management/import-students-dialog";
import { CourseSelectByAssignment } from "@/components/features/course/course-select-by-assignment";
import { PageHeader } from "@/components/ui/layout";
import { StudentDeleteDialog } from "@/components/features/student-management/student-delete-dialog";
import { StudentActions } from "@/components/features/student-management/student-actions";
import { StudentManagementSkeleton } from "@/components/features/student-management/StudentManagementSkeleton";

export default function StudentManagementPage() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentAssignmentId } = useAssignmentContext();

  // Use custom hooks for data fetching
  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useTeacherCourses(currentAssignmentId || undefined);

  const {
    data: courseStudents,
    isLoading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useTeacherStudents(selectedCourse || undefined, {
    page: 1,
    limit: 50,
    search: searchTerm,
  });

  // Use mutation hooks
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const deleteStudentMutation = useDeleteStudent();
  const removeStudentMutation = useRemoveStudentFromCourse();
  const bulkRemoveStudentsMutation = useBulkRemoveStudents();
  const addStudentToCourse = useAddStudentToCourse();

  // Extract courses from API response with memoization
  const courses = useMemo(() => {
    return Array.isArray(coursesData)
      ? coursesData
      : (coursesData as any)?.data?.courses ||
          (coursesData as any)?.courses ||
          [];
  }, [coursesData]);

  const loading = coursesLoading || studentsLoading;

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Auto-select first course when courses are loaded
  useEffect(() => {
    if (courses.length > 0 && selectedCourse === null) {
      setSelectedCourse(courses[0].course_id);
    }
  }, [courses.length, selectedCourse]); // Include selectedCourse but check for null specifically

  // Handle errors
  useEffect(() => {
    if (coursesError) {
      toast.error("Có lỗi xảy ra khi tải danh sách khóa học");
    }
    if (studentsError) {
      toast.error("Có lỗi xảy ra khi tải danh sách sinh viên");
    }
  }, [coursesError, studentsError]);

  const handleCreateStudent = async (studentData: CreateStudentRequest) => {
    try {
      const response = await createStudentMutation.mutateAsync(studentData);

      // Nếu có khóa học được chọn, tự động thêm sinh viên vào khóa học
      if (selectedCourse && response.data?.id) {
        try {
          await addStudentToCourse.mutateAsync({
            studentId: response.data.id,
            courseId: selectedCourse,
          });
          toast.success("Tạo sinh viên và thêm vào khóa học thành công!");
        } catch (enrollError) {
          console.error("Error enrolling student:", enrollError);
          toast.warning(
            "Tạo sinh viên thành công nhưng không thể thêm vào khóa học"
          );
        }
      }

      setCreateDialogOpen(false);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error("Error creating student:", error);
    }
  };

  const handleUpdateStudent = async (
    id: number,
    studentData: UpdateStudentRequest
  ) => {
    try {
      await updateStudentMutation.mutateAsync({
        id,
        studentData,
      });
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sinh viên này?")) return;

    try {
      await deleteStudentMutation.mutateAsync(studentId);
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const [studentToDelete, setStudentToDelete] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleUnenrollStudent = async (studentId: number, courseId: number) => {
    const student = (
      (courseStudents as any)?.data?.students ||
      (courseStudents as any)?.students ||
      []
    ).find((s: any) => s.user_id === studentId);

    if (!student) return;

    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setStudentToDelete(null);
    refetchStudents();
  };

  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  // Handle checkbox selection
  const handleSelectStudent = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    const students =
      (courseStudents as any)?.data?.students ||
      (courseStudents as any)?.students ||
      [];
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s: any) => s.user_id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;

    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa ${selectedStudents.length} sinh viên đã chọn?`
      )
    )
      return;

    try {
      await bulkRemoveStudentsMutation.mutateAsync({
        courseId: selectedCourse!,
        studentIds: selectedStudents,
      });
      setSelectedStudents([]);
    } catch (error) {
      console.error("Error bulk deleting students:", error);
    }
  };

  const handleImportSuccess = () => {
    setImportDialogOpen(false);
    refetchStudents();
    toast.success("Import sinh viên thành công!");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="Quản lý Sinh viên"
          description="Quản lý sinh viên và đăng ký khóa học"
          variant="default"
        />
        <StudentManagementSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Quản lý Sinh viên"
        description="Quản lý sinh viên và đăng ký khóa học"
        variant="default"
      />

      {/* Controls Section */}
      <div className="flex flex-col space-y-4 mb-6">
        {/* Mobile layout */}
        <div className="sm:hidden flex flex-col gap-3">
          <CourseSelectByAssignment
            value={selectedCourse || undefined}
            onValueChange={(courseId) => setSelectedCourse(courseId || null)}
            placeholder="Chọn khóa học"
            className="w-full"
            showEmptyOption={false}
          />
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sinh viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          {selectedCourse && (
            <>
              <Button
                className="w-full flex items-center justify-center gap-2"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Thêm Sinh viên
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setImportDialogOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Excel
              </Button>

              {selectedStudents.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa ({selectedStudents.length})
                </Button>
              )}
            </>
          )}
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sinh viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            {selectedCourse && (
              <Button
                className="flex items-center gap-2"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Thêm Sinh viên
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                Khóa học:
              </span>
              <CourseSelectByAssignment
                value={selectedCourse || undefined}
                onValueChange={(courseId) =>
                  setSelectedCourse(courseId || null)
                }
                placeholder="Chọn khóa học"
                className="w-64"
                showEmptyOption={false}
              />
            </div>
            {selectedCourse && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImportDialogOpen(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Excel
                </Button>

                {selectedStudents.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa ({selectedStudents.length})
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      {!selectedCourse ? (
        <div className="rounded-md border p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <BookOpen className="w-12 h-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">
                Chọn khóa học để bắt đầu
              </h3>
              <p className="text-muted-foreground">
                Vui lòng chọn khóa học từ danh sách trên để quản lý sinh viên
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100 dark:bg-muted/50 hover:bg-slate-100 dark:hover:bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedStudents.length ===
                        (
                          (courseStudents as any)?.data?.students ||
                          (courseStudents as any)?.students ||
                          []
                        ).length &&
                      (
                        (courseStudents as any)?.data?.students ||
                        (courseStudents as any)?.students ||
                        []
                      ).length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Mã SV</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ngày đăng ký</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(
                (courseStudents as any)?.data?.students ||
                (courseStudents as any)?.students ||
                []
              )
                .map((student: any, index: number) => {
                  // Ensure student has required properties
                  if (!student || !student.user_id) {
                    return null;
                  }

                  return (
                    <TableRow key={student.user_id || index}>
                      <TableCell>
                        <Checkbox
                          checked={selectedStudents.includes(student.user_id)}
                          onCheckedChange={() =>
                            handleSelectStudent(student.user_id)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.student_code || "N/A"}
                      </TableCell>
                      <TableCell>{student.student_name || "N/A"}</TableCell>
                      <TableCell>{student.email || "N/A"}</TableCell>
                      <TableCell>
                        {student.enrollment_date
                          ? new Date(
                              student.enrollment_date
                            ).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Đang học</Badge>
                      </TableCell>
                      <TableCell>
                        <StudentActions
                          student={student}
                          onEdit={(s) => {}}
                          onDelete={(studentId) =>
                            handleUnenrollStudent(studentId, selectedCourse!)
                          }
                          onUpdate={handleUpdateStudent}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
                .filter(Boolean)}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Student Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <CreateStudentForm
            onSubmit={handleCreateStudent}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Import Students Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <ImportStudentsDialog
            onSuccess={handleImportSuccess}
            onCancel={() => setImportDialogOpen(false)}
            defaultCourseId={selectedCourse || undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Student Dialog */}
      {selectedCourse && (
        <StudentDeleteDialog
          student={studentToDelete}
          courseId={selectedCourse}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
