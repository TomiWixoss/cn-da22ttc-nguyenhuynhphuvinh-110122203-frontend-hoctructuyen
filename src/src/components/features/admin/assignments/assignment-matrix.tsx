"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
} from "@/components/ui/display";
import { TableHead, TableRow } from "@/components/ui/display/table";

import { Button } from "@/components/ui/forms";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { CardFooter } from "@/components/ui/layout/card";
import { Skeleton } from "@/components/ui/feedback";
import { Save, Users, Calendar, AlertCircle, RotateCcw } from "lucide-react";
import {
  useSubjectsAndTeachersForAssignment,
  useBulkAssignTeachers,
} from "@/lib/hooks/use-assignments";
import { Checkbox } from "@/components/ui/forms/checkbox";
import { Semester } from "@/lib/services/api/semester.service";
import { toast } from "sonner";

interface AssignmentMatrixProps {
  selectedSemester: Semester | null;
  batchId: number;
}

export function AssignmentMatrix({
  selectedSemester,
  batchId,
}: AssignmentMatrixProps) {
  const semesterId = selectedSemester?.semester_id || 0;

  const {
    data: assignmentData,
    isLoading,
    error,
    refetch,
  } = useSubjectsAndTeachersForAssignment(batchId, semesterId);

  const bulkAssignMutation = useBulkAssignTeachers();

  // State to hold the current assignment selections: { [subjectId]: teacherId[] }
  const [assignments, setAssignments] = useState<Record<number, number[]>>({});
  const [initialAssignments, setInitialAssignments] = useState<
    Record<number, number[]>
  >({});

  // Populate initial state when data is fetched
  useEffect(() => {
    if (assignmentData?.data?.subjects && selectedSemester) {
      // Lấy danh sách phân công từ semester
      const semesterAssignments = selectedSemester.TeacherAssignments || [];

      // Tạo map: subject_id -> teacher_ids[]
      const assignmentMap: Record<number, number[]> = {};

      // Khởi tạo tất cả subjects với mảng rỗng
      assignmentData.data.subjects.forEach((subject) => {
        assignmentMap[subject.subject_id] = [];
      });

      // Điền các giảng viên đã được phân công
      semesterAssignments.forEach((assignment: any) => {
        const subjectId = assignment.subject_id;
        const teacherId = assignment.teacher_id;

        if (assignmentMap[subjectId]) {
          if (!assignmentMap[subjectId].includes(teacherId)) {
            assignmentMap[subjectId].push(teacherId);
          }
        }
      });

      setAssignments(assignmentMap);
      setInitialAssignments(assignmentMap);
    }
  }, [assignmentData, selectedSemester]);

  const handleAssignmentChange = (subjectId: number, teacherId: number) => {
    const currentAssigned = assignments[subjectId] || [];
    const newAssigned = currentAssigned.includes(teacherId)
      ? currentAssigned.filter((id) => id !== teacherId) // Uncheck: remove
      : [...currentAssigned, teacherId]; // Check: add
    setAssignments((prev) => ({
      ...prev,
      [subjectId]: newAssigned,
    }));
  };

  const handleSaveChanges = () => {
    if (!selectedSemester) return;

    const assignmentsPayload = Object.entries(assignments).flatMap(
      ([subjectId, teacherIds]) =>
        teacherIds.map((teacherId) => ({
          subject_id: parseInt(subjectId, 10),
          teacher_id: teacherId,
        }))
    );

    bulkAssignMutation.mutate(
      {
        batch_id: batchId,
        semester_id: semesterId,
        assignments: assignmentsPayload,
      },
      {
        onSuccess: () => {
          refetch(); // Refetch data to update initial state
        },
      }
    );
  };

  const handleResetChanges = () => {
    setAssignments(initialAssignments);
    toast.info("Đã hủy các thay đổi chưa lưu.");
  };

  const hasChanges = useMemo(() => {
    return JSON.stringify(assignments) !== JSON.stringify(initialAssignments);
  }, [assignments, initialAssignments]);

  const { subjects = [], teachers = [] } = assignmentData?.data || {};

  if (isLoading) {
    return (
      <div className="space-y-2 py-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center text-destructive py-10">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p>Lỗi khi tải dữ liệu phân công.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {subjects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>Không có môn học nào trong học kỳ này để phân công.</p>
        </div>
      ) : (
        <>
          {/* Desktop view - Table */}
          <div className="hidden lg:block border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100 dark:bg-muted/50">
                  <TableHead className="sticky left-0 bg-slate-100 dark:bg-muted/50 z-10 w-[250px] min-w-[250px]">
                    Môn học
                  </TableHead>
                  {teachers.map((teacher) => (
                    <TableHead
                      key={teacher.user_id}
                      className="text-center min-w-[150px]"
                    >
                      {teacher.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.subject_id}>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">
                      {subject.name}
                    </TableCell>
                    {teachers.map((teacher) => (
                      <TableCell key={teacher.user_id} className="text-center">
                        <Checkbox
                          checked={
                            assignments[subject.subject_id]?.includes(
                              teacher.user_id
                            ) ?? false
                          }
                          onCheckedChange={() =>
                            handleAssignmentChange(
                              subject.subject_id,
                              teacher.user_id
                            )
                          }
                          id={`s${subject.subject_id}-t${teacher.user_id}`}
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
            {subjects.map((subject) => (
              <div
                key={subject.subject_id}
                className="border rounded-lg p-3 sm:p-4 bg-muted/30"
              >
                <h4 className="font-semibold text-sm sm:text-base mb-3 pb-2 border-b">
                  {subject.name}
                </h4>
                <div className="space-y-2">
                  {teachers.map((teacher) => (
                    <label
                      key={teacher.user_id}
                      htmlFor={`mobile-s${subject.subject_id}-t${teacher.user_id}`}
                      className="flex items-center gap-3 p-2 rounded hover:bg-background cursor-pointer transition-colors"
                    >
                      <Checkbox
                        checked={
                          assignments[subject.subject_id]?.includes(
                            teacher.user_id
                          ) ?? false
                        }
                        onCheckedChange={() =>
                          handleAssignmentChange(
                            subject.subject_id,
                            teacher.user_id
                          )
                        }
                        id={`mobile-s${subject.subject_id}-t${teacher.user_id}`}
                      />
                      <span className="text-sm flex-1">{teacher.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {hasChanges && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start sm:items-center gap-2 text-xs sm:text-sm text-blue-800 dark:text-blue-400 font-medium">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span>
              Bạn có thay đổi chưa được lưu. Vui lòng nhấn "Lưu thay đổi" để cập
              nhật.
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
        {hasChanges && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetChanges}
            disabled={bulkAssignMutation.isPending}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Hủy thay đổi
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSaveChanges}
          disabled={!hasChanges || bulkAssignMutation.isPending}
          className="w-full sm:w-auto"
        >
          <Save className="h-4 w-4 mr-2" />
          {bulkAssignMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  );
}
