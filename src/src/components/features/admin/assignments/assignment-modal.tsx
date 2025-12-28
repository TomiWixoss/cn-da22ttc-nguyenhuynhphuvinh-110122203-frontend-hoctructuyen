"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/forms";
import { Textarea } from "@/components/ui/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/feedback/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms";
import { type TeacherAssignment } from "@/lib/services/api/assignment.service";
import { type Semester } from "@/lib/services/api/semester.service";
import { SubjectService } from "@/lib/services/api/subject.service";
import {
  useCreateAssignment,
  useUpdateAssignment,
  useAvailableTeachers,
  useSubjectsByProgram,
} from "@/lib/hooks/use-assignments";
import { usePrograms } from "@/lib/hooks/use-programs";
import { useSemesters } from "@/lib/hooks/use-semesters";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type AssignmentModalMode = "create" | "edit";

interface AssignmentModalProps {
  mode: AssignmentModalMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  defaultSemester?: Semester | null;
  assignment?: TeacherAssignment; // Required when mode is 'edit'
  batchId: number; // Thêm batchId để tạo phân công
}

const assignmentSchema = z.object({
  teacher_id: z.number().optional(),
  subject_id: z.number().optional(),
  semester_id: z.number().optional(),
  note: z.string().optional(),
  program_id: z.number().optional(),
});

type FormData = z.infer<typeof assignmentSchema>;

export function AssignmentModal({
  mode,
  open,
  onOpenChange,
  onSuccess,
  defaultSemester,
  assignment,
  batchId,
}: AssignmentModalProps) {
  // State để lưu program_id được chọn
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(
    null
  );
  // State loading cho việc chuẩn bị dữ liệu edit
  const [isPreloadingEditData, setIsPreloadingEditData] = useState(false);
  // State để track validation errors
  const [validationErrors, setValidationErrors] = useState<{
    program_id?: string;
    teacher_id?: string;
    subject_id?: string;
  }>({});

  // Use TanStack Query hooks
  const createAssignmentMutation = useCreateAssignment();
  const updateAssignmentMutation = useUpdateAssignment();
  const { data: semesters } = useSemesters();
  const { data: teachersResponse, isLoading: teachersLoading } =
    useAvailableTeachers();
  const { data: programsData, isLoading: programsLoading } = usePrograms();
  const { data: subjectsResponse, isLoading: subjectsLoading } =
    useSubjectsByProgram(selectedProgramId);

  const formDataOptions = {
    teachers: teachersResponse?.success ? teachersResponse.data : [],
    subjects: subjectsResponse?.success
      ? subjectsResponse.data
      : subjectsResponse?.data || [],
    programs: programsData?.data?.records || [],
    semesters: semesters?.data || [],
  };
  const formDataLoading = teachersLoading || programsLoading;

  const form = useForm<FormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      teacher_id: undefined,
      subject_id: undefined,
      semester_id: undefined,
      note: "",
      program_id: undefined,
    },
  });

  // Tách logic preload data cho edit mode
  useEffect(() => {
    const preloadEditData = async () => {
      if (mode === "edit" && assignment) {
        setIsPreloadingEditData(true);
        try {
          // Bước 1: Lấy thông tin chi tiết của môn học để tìm ra program_id
          const subjectResponse = await SubjectService.getSubjectById(
            assignment.subject_id
          );

          if (subjectResponse.success && subjectResponse.data) {
            const subjectDetails = subjectResponse.data;

            // Tìm program_id từ Course của Subject
            let programId = null;

            // Thử tìm program_id từ Course
            if (subjectDetails.Courses && subjectDetails.Courses.length > 0) {
              programId = (subjectDetails.Courses[0] as any).program_id;
            }

            // Nếu không có trong Courses array, thử tìm từ Course object
            if (!programId && (subjectDetails as any).Course) {
              programId = (subjectDetails as any).Course.program_id;
            }

            // Fallback: thử tìm trực tiếp từ subject
            if (!programId && (subjectDetails as any).program_id) {
              programId = (subjectDetails as any).program_id;
            }

            // Nếu vẫn không tìm thấy program_id, thử tìm ngược từ tất cả programs
            if (!programId && formDataOptions.programs.length > 0) {
              for (const program of formDataOptions.programs) {
                try {
                  const programSubjectsResponse =
                    await SubjectService.getSubjectsByProgram(
                      program.program_id
                    );
                  if (programSubjectsResponse?.data) {
                    const foundSubject = programSubjectsResponse.data.find(
                      (mapping: any) =>
                        mapping.subject_id === assignment.subject_id
                    );
                    if (foundSubject) {
                      programId = program.program_id;
                      break;
                    }
                  }
                } catch (error) {
                  // Tiếp tục tìm trong program khác
                  continue;
                }
              }
            }

            if (programId) {
              setSelectedProgramId(programId);

              // Bước 2: Reset form với đầy đủ dữ liệu
              form.reset({
                teacher_id: assignment.teacher_id,
                subject_id: assignment.subject_id,
                semester_id: assignment.semester_id,
                note: assignment.note || "",
                program_id: programId,
              });
            } else {
              toast.error(
                "Không tìm thấy chương trình đào tạo cho môn học này."
              );
              // Vẫn điền các thông tin khác
              form.reset({
                teacher_id: assignment.teacher_id,
                subject_id: assignment.subject_id,
                semester_id: assignment.semester_id,
                note: assignment.note || "",
              });
            }
          }
        } catch (error) {
          toast.error("Lỗi khi tải dữ liệu phân công để chỉnh sửa.");
          console.error(error);
        } finally {
          setIsPreloadingEditData(false);
        }
      } else {
        // Reset cho create mode
        form.reset({
          teacher_id: undefined,
          subject_id: undefined,
          semester_id: defaultSemester?.semester_id,
          note: "",
          program_id: undefined,
        });
        setSelectedProgramId(null);
      }
    };

    if (open) {
      preloadEditData();
    }
  }, [open, mode, assignment, defaultSemester, form]);

  const onSubmit = async (data: FormData) => {
    // Validate required fields
    const errors: typeof validationErrors = {};

    if (!data.program_id) {
      errors.program_id = "Vui lòng chọn chương trình đào tạo";
    }
    if (!data.teacher_id) {
      errors.teacher_id = "Vui lòng chọn giáo viên";
    }
    if (!data.subject_id) {
      errors.subject_id = "Vui lòng chọn môn học";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Clear validation errors if all fields are valid
    setValidationErrors({});

    if (mode === "create") {
      const createData = {
        teacher_id: data.teacher_id!,
        subject_id: data.subject_id!,
        semester_id: defaultSemester?.semester_id,
        batch_id: batchId, // Thêm batch_id vào request
        note: data.note || undefined,
      };

      createAssignmentMutation.mutate(createData, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          onSuccess();
        },
      });
    } else {
      if (!assignment) {
        toast.error("Không tìm thấy thông tin phân công");
        return;
      }

      const updateData = {
        teacher_id: data.teacher_id!,
        subject_id: data.subject_id!,
        semester_id: assignment.semester_id, // Keep the original semester_id
        batch_id: batchId, // Thêm batch_id vào request
        note: data.note || undefined,
      };

      updateAssignmentMutation.mutate(
        {
          assignmentId: assignment.assignment_id,
          data: updateData,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
            onSuccess();
          },
        }
      );
    }
  };

  // Dynamic content based on mode
  const modalTitle =
    mode === "create" ? "Tạo phân công mới" : "Chỉnh sửa phân công";
  const submitButtonText = mode === "create" ? "Tạo phân công" : "Cập nhật";
  const isLoading =
    createAssignmentMutation.isPending || updateAssignmentMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>
            Phân công giáo viên dạy môn học trong học kỳ
          </DialogDescription>
        </DialogHeader>

        {formDataLoading || isPreloadingEditData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">
              {isPreloadingEditData
                ? "Đang tải dữ liệu chỉnh sửa..."
                : "Đang tải dữ liệu..."}
            </span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="program_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chương trình đào tạo *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        const programId = parseInt(value);
                        field.onChange(programId);
                        setSelectedProgramId(programId);
                        form.setValue("subject_id", undefined); // Reset môn học khi đổi chương trình
                        // Clear validation error
                        setValidationErrors((prev) => ({
                          ...prev,
                          program_id: undefined,
                        }));
                      }}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chương trình đào tạo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formDataOptions.programs.map((program: any) => (
                          <SelectItem
                            key={program.program_id}
                            value={program.program_id.toString()}
                          >
                            {program.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teacher_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giáo viên *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(parseInt(value));
                        // Clear validation error
                        setValidationErrors((prev) => ({
                          ...prev,
                          teacher_id: undefined,
                        }));
                      }}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giáo viên" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formDataOptions?.teachers?.map((teacher: any) => (
                          <SelectItem
                            key={teacher.user_id || teacher.id}
                            value={
                              (teacher.user_id || teacher.id)?.toString() || ""
                            }
                          >
                            <div>
                              <div className="font-medium">
                                {teacher.fullName || teacher.name}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Môn học *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(parseInt(value));
                        // Clear validation error
                        setValidationErrors((prev) => ({
                          ...prev,
                          subject_id: undefined,
                        }));
                      }}
                      value={field.value?.toString() || ""}
                      disabled={!selectedProgramId || subjectsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !selectedProgramId
                                ? "Chọn chương trình trước"
                                : subjectsLoading
                                ? "Đang tải môn học..."
                                : "Chọn môn học"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formDataOptions?.subjects?.map((mapping: any) => (
                          <SelectItem
                            key={mapping.subject_id}
                            value={mapping.subject_id?.toString() || ""}
                          >
                            <div>
                              <div className="font-medium">
                                {mapping.Subject?.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {mapping.Subject?.code}{" "}
                                {mapping.Subject?.credits &&
                                  `• ${mapping.Subject.credits} tín chỉ`}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Semester field removed as per requirements */}
              {/* {mode !== "create" && (
                <FormField
                  control={form.control}
                  name="semester_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Học kỳ</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value ? parseInt(value) : undefined)
                        }
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn học kỳ (mặc định: học kỳ hiện tại)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {formDataOptions?.semesters?.map((semester: any) => (
                            <SelectItem
                              key={semester.semester_id || semester.id}
                              value={
                                (
                                  semester.semester_id || semester.id
                                )?.toString() || ""
                              }
                            >
                              <div className="flex items-center gap-2">
                                <span>{semester.name}</span>
                                {semester.is_active && (
                                  <span className="text-xs bg-primary text-primary-foreground px-1 rounded">
                                    Đang hoạt động
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )} */}

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ghi chú về phân công (tùy chọn)"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {submitButtonText}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
