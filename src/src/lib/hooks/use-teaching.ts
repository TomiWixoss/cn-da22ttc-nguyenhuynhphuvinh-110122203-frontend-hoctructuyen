import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizService, courseService } from "@/lib/services/api";
import { courseGradeService } from "@/lib/services/api/course-grade.service";
import studentManagementService from "@/lib/services/api/student-management.service";
import { toast } from "sonner";

// THÊM IMPORT NÀY
import { QuizMode } from "@/lib/types/quiz";

// Định nghĩa query keys cho Teaching Management
export const teachingKeys = {
  all: ["teaching"] as const,
  quizzes: (assignmentId?: string | number, paginationParams?: any) =>
    [...teachingKeys.all, "quizzes", assignmentId, paginationParams] as const,
  quiz: (id: number) => [...teachingKeys.all, "quiz", id] as const,
  courses: () => [...teachingKeys.all, "courses"] as const,
  course: (id: number) => [...teachingKeys.courses(), id] as const,
  students: (courseId?: number, params?: any) =>
    [...teachingKeys.courses(), courseId, "students", params] as const,
  gradeColumns: (courseId: number) =>
    [...teachingKeys.courses(), courseId, "gradeColumns"] as const,
  courseStudentsWithGrades: (courseId: number) =>
    [...teachingKeys.courses(), courseId, "studentsWithGrades"] as const,
  analytics: () => [...teachingKeys.all, "analytics"] as const,
  courseAnalytics: (courseId: number) =>
    [...teachingKeys.analytics(), "course", courseId] as const,
};

// Hook để lấy danh sách quiz của giáo viên
export function useTeacherQuizzes(assignmentId?: string | number) {
  return useQuery({
    queryKey: teachingKeys.quizzes(assignmentId),
    queryFn: async () => {
      // Nếu có assignmentId, lấy courses trong assignment trước
      if (assignmentId) {
        try {
          const startTime = Date.now();

          const coursesResponse = await courseService.getCoursesByAssignment(
            Number(assignmentId)
          );

          const coursesDuration = Date.now() - startTime;

          if (coursesResponse?.success && coursesResponse?.data?.courses) {
            const courseIds = coursesResponse.data.courses.map(
              (course: any) => course.course_id
            );

            // Lấy tất cả quiz và lọc theo course_id
            const quizStartTime = Date.now();

            const quizResponse = await quizService.getQuizzes();

            const quizDuration = Date.now() - quizStartTime;

            let allQuizzes = [];

            if (quizResponse?.success && quizResponse?.data) {
              allQuizzes = Array.isArray(quizResponse.data)
                ? quizResponse.data
                : quizResponse.data.quizzes;
            } else if (Array.isArray(quizResponse)) {
              allQuizzes = quizResponse;
            }

            // Lọc quiz theo course_id trong assignment
            const filteredQuizzes = allQuizzes.filter(
              (quiz: any) =>
                quiz.course_id && courseIds.includes(quiz.course_id)
            );

            return filteredQuizzes;
          }

          return [];
        } catch (error) {
          console.error(
            `❌ [DEBUG] Error fetching quizzes by assignment ${assignmentId}:`,
            error
          );
          console.error(`❌ [DEBUG] Error details:`, {
            name: (error as any)?.name,
            message: (error as any)?.message,
            stack: (error as any)?.stack,
            fullError: error,
          });
          return [];
        }
      }

      // Nếu không có assignmentId, lấy tất cả quiz
      const allQuizStartTime = Date.now();

      const response = await quizService.getQuizzes();

      const allQuizDuration = Date.now() - allQuizStartTime;

      if (response?.success && response?.data) {
        const quizzes = Array.isArray(response.data)
          ? response.data
          : response.data.quizzes;
        return quizzes;
      }
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook để lấy danh sách quiz của giáo viên với pagination
export function useTeacherQuizzesWithPagination(
  assignmentId?: string | number,
  paginationParams?: {
    page?: number;
    limit?: number;
    status?: string;
    course_id?: number;
    search?: string;
    sort_by?: string;
    sort_order?: "ASC" | "DESC";
  }
) {
  return useQuery({
    queryKey: teachingKeys.quizzes(assignmentId, paginationParams),
    queryFn: async () => {
      // Nếu có assignmentId, lấy courses trong assignment trước
      if (assignmentId) {
        try {
          const coursesStartTime = Date.now();

          const coursesResponse = await courseService.getCoursesByAssignment(
            Number(assignmentId)
          );

          const coursesDuration = Date.now() - coursesStartTime;

          if (coursesResponse?.success && coursesResponse?.data?.courses) {
            const courseIds = coursesResponse.data.courses.map(
              (course: any) => course.course_id
            );

            // Lấy quiz với pagination parameters
            const quizStartTime = Date.now();

            const quizResponse = await quizService.getQuizzes(paginationParams);

            const quizDuration = Date.now() - quizStartTime;

            let allQuizzes = [];
            let paginationInfo = null;

            if (quizResponse?.success && quizResponse?.data) {
              allQuizzes = Array.isArray(quizResponse.data)
                ? quizResponse.data
                : quizResponse.data.quizzes;
              // Lấy thông tin pagination từ response
              paginationInfo =
                (quizResponse as any)?.data?.pagination ||
                (quizResponse as any)?.pagination;
            } else if (Array.isArray(quizResponse)) {
              allQuizzes = quizResponse;
            }

            // Lọc quiz theo course_id trong assignment
            const filteredQuizzes = allQuizzes.filter(
              (quiz: any) =>
                quiz.course_id && courseIds.includes(quiz.course_id)
            );

            // ⚠️ VẤN ĐỀ PHÂN TRANG: Khi lọc quiz theo assignment,
            // pagination info từ server không còn chính xác
            // Cần thông báo cho user rằng đang áp dụng filter assignment

            // Trả về object có cấu trúc tương tự như API response gốc để component có thể xử lý pagination
            return {
              quizzes: filteredQuizzes,
              pagination: {
                ...paginationInfo,
                // Cập nhật thông tin pagination cho filtered data
                filteredTotal: filteredQuizzes.length,
                isFiltered: true,
                note: `Đã lọc ${filteredQuizzes.length}/${
                  paginationInfo?.total || 0
                } quiz theo assignment ${assignmentId}`,
              },
            };
          }
          return [];
        } catch (error) {
          console.error(
            `❌ [DEBUG] Error fetching quizzes by assignment ${assignmentId}:`,
            error
          );
          console.error(`❌ [DEBUG] Error details:`, {
            name: (error as any)?.name,
            message: (error as any)?.message,
            stack: (error as any)?.stack,
            fullError: error,
          });
          return [];
        }
      }

      // Nếu không có assignmentId, lấy tất cả quiz với pagination
      const allQuizStartTime = Date.now();

      const response = await quizService.getQuizzes(paginationParams);

      const allQuizDuration = Date.now() - allQuizStartTime;

      if (response?.success && response?.data) {
        const quizzes = Array.isArray(response.data)
          ? response.data
          : response.data.quizzes;
        const paginationInfo =
          (response as any)?.data?.pagination || (response as any)?.pagination;

        // Trả về object có cấu trúc đầy đủ cho pagination
        return {
          quizzes: quizzes,
          pagination: paginationInfo,
        };
      }
      if (Array.isArray(response)) {
        // Trả về với cấu trúc pagination mặc định cho legacy response
        return {
          quizzes: response,
          pagination: {
            total: response.length,
            totalPages: 1,
            currentPage: 1,
            limit: response.length,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      }
      return {
        quizzes: [],
        pagination: {
          total: 0,
          totalPages: 0,
          currentPage: 1,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook chuyên dụng để lấy quiz theo course_id với pagination chính xác
export function useQuizzesByCourse(
  courseId?: number,
  paginationParams?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sort_by?: string;
    sort_order?: "ASC" | "DESC";
  }
) {
  return useQuery({
    queryKey: [
      ...teachingKeys.all,
      "quizzesByCourse",
      courseId,
      paginationParams,
    ],
    queryFn: async () => {
      if (!courseId) {
        return {
          quizzes: [],
          pagination: {
            total: 0,
            totalPages: 0,
            currentPage: 1,
            limit: 10,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      }

      // Thêm course_id vào pagination params để server lọc đúng
      const paramsWithCourse = {
        ...paginationParams,
        course_id: courseId,
      };

      const startTime = Date.now();

      const response = await quizService.getQuizzes(paramsWithCourse);

      const duration = Date.now() - startTime;

      if (response?.success && response?.data) {
        const quizzes = Array.isArray(response.data)
          ? response.data
          : response.data.quizzes;
        const paginationInfo =
          (response as any)?.data?.pagination || (response as any)?.pagination;

        // Kiểm tra xem có quiz nào không thuộc về course này không
        const wrongCourseQuizzes = quizzes.filter(
          (quiz: any) => quiz.course_id !== courseId
        );
        if (wrongCourseQuizzes.length > 0) {
          console.warn(
            `⚠️ [DEBUG] Found ${wrongCourseQuizzes.length} quizzes with wrong course_id:`,
            wrongCourseQuizzes
          );
        }

        return {
          quizzes: quizzes,
          pagination: paginationInfo,
        };
      }

      if (Array.isArray(response)) {
        const filteredQuizzes = response.filter(
          (quiz: any) => quiz.course_id === courseId
        );

        return {
          quizzes: filteredQuizzes,
          pagination: {
            total: filteredQuizzes.length,
            totalPages: 1,
            currentPage: 1,
            limit: filteredQuizzes.length,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      }

      return {
        quizzes: [],
        pagination: {
          total: 0,
          totalPages: 0,
          currentPage: 1,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook để lấy chi tiết một quiz kèm mode info
export function useQuizDetail(quizId: number) {
  return useQuery({
    queryKey: teachingKeys.quiz(quizId),
    queryFn: async () => {
      // Gọi cả 2 API cùng lúc
      const startTime = Date.now();

      const [quizResponse, modeResponse] = await Promise.all([
        quizService.getQuizById(quizId),
        quizService.getQuizModeInfo(quizId),
      ]);

      const duration = Date.now() - startTime;

      if (quizResponse?.success && quizResponse?.data) {
        const result = {
          quiz: quizResponse.data.quiz || quizResponse.data,
          quizModeInfo: modeResponse,
        };
        return result;
      }

      if (quizResponse && !(quizResponse as any).hasOwnProperty("success")) {
        const result = {
          quiz: quizResponse,
          quizModeInfo: modeResponse,
        };
        return result;
      }

      console.error(`❌ [DEBUG] Failed to fetch quiz details for ${quizId}:`, {
        quizResponse,
        modeResponse,
      });

      throw new Error(
        (quizResponse as any)?.message || "Không thể tải thông tin quiz"
      );
    },
    enabled: !!quizId,
  });
}

// Hook để tạo quiz mới
export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizData: {
      title: string;
      description?: string;
      course_id: number;
      time_limit?: number;
      question_count?: number;
      difficulty_level?: string;
    }) => {
      // Transform data to match API expectations
      const createData = {
        course_id: quizData.course_id,
        name: quizData.title,
        duration: quizData.time_limit || 60,
        quiz_mode: "assessment" as const,
        question_criteria: {
          loIds: [],
          totalQuestions: quizData.question_count || 10,
          difficultyRatio: {
            easy: 0.3,
            medium: 0.5,
            hard: 0.2,
          },
        },
      };

      const startTime = Date.now();

      const response = await quizService.createQuiz(createData);

      const duration = Date.now() - startTime;

      if (response?.success) {
        return response.data;
      }

      console.error(`❌ [DEBUG] Failed to create quiz:`, response);
      throw new Error(response?.message || "Không thể tạo quiz");
    },
    onSuccess: () => {
      // Invalidate tất cả quiz queries để đảm bảo danh sách được cập nhật
      queryClient.invalidateQueries({ queryKey: teachingKeys.all });
      toast.success("Tạo quiz thành công!");
    },
    onError: (error: any) => {
      console.error(`❌ [DEBUG] Create quiz error:`, error);
      toast.error(error.message || "Lỗi khi tạo quiz");
    },
  });
}

// Hook để cập nhật quiz
export function useUpdateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...quizData
    }: {
      id: number;
      title?: string;
      description?: string;
      time_limit?: number;
      question_count?: number;
      difficulty_level?: string;
    }) => {
      // Transform data to match API expectations
      const updateData = {
        name: quizData.title,
        duration: quizData.time_limit,
        question_criteria: {
          loIds: [],
          totalQuestions: quizData.question_count || 10,
          difficultyRatio: {
            easy: 0.3,
            medium: 0.5,
            hard: 0.2,
          },
        },
      };

      const startTime = Date.now();

      const response = await quizService.updateQuiz(id, updateData);

      const duration = Date.now() - startTime;

      if (response?.success) {
        return response.data;
      }

      console.error(`❌ [DEBUG] Failed to update quiz ${id}:`, response);
      throw new Error(response?.message || "Không thể cập nhật quiz");
    },
    onSuccess: (data, variables) => {
      // Invalidate tất cả quiz queries để đảm bảo danh sách được cập nhật
      queryClient.invalidateQueries({ queryKey: teachingKeys.all });
      queryClient.invalidateQueries({
        queryKey: teachingKeys.quiz(variables.id),
      });
      toast.success("Cập nhật quiz thành công!");
    },
    onError: (error: any) => {
      console.error(`❌ [DEBUG] Update quiz error:`, error);
      toast.error(error.message || "Lỗi khi cập nhật quiz");
    },
  });
}

// Hook để clone quiz
export function useCloneQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quizId,
      cloneData,
    }: {
      quizId: number;
      cloneData: {
        new_name?: string;
        new_course_id?: number;
        clone_questions: boolean;
        clone_settings: boolean;
        clone_mode_config: boolean;
        reset_pin: boolean;
        reset_status: boolean;
      };
    }) => {
      const startTime = Date.now();

      const response = await quizService.cloneQuiz(quizId, cloneData);

      const duration = Date.now() - startTime;

      if (response?.cloned_quiz) {
        return response;
      }

      console.error(`❌ [DEBUG] Failed to clone quiz ${quizId}:`, response);
      throw new Error("Không thể sao chép quiz");
    },
    onSuccess: (data) => {
      // Invalidate tất cả quiz queries để đảm bảo danh sách được cập nhật
      queryClient.invalidateQueries({ queryKey: teachingKeys.all });
      toast.success(
        `Sao chép quiz thành công! ID mới: ${data.cloned_quiz.quiz_id}`
      );
    },
    onError: (error: any) => {
      console.error(`❌ [DEBUG] Clone quiz error:`, error);
      toast.error(error.message || "Lỗi khi sao chép quiz");
    },
  });
}

// Hook để xóa quiz
export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId: number) => {
      const startTime = Date.now();

      try {
        const response = await quizService.deleteQuiz(quizId);

        const duration = Date.now() - startTime;

        if (
          response?.success ||
          response?.message === "Quiz deleted successfully"
        ) {
          return response.data || response;
        }

        console.error(`❌ [DEBUG] Failed to delete quiz ${quizId}:`, response);
        throw new Error(response?.message || "Không thể xóa quiz");
      } catch (error: any) {
        const duration = Date.now() - startTime;

        // Kiểm tra nếu đây là lỗi 404 với message thành công
        // hoặc nếu response data chứa thông tin thành công
        const responseData = error.response?.data;
        if (
          (error.response?.status === 404 &&
            responseData?.message === "Quiz deleted successfully") ||
          (error.message &&
            error.message.includes("Quiz deleted successfully")) ||
          (responseData && responseData.message === "Quiz deleted successfully")
        ) {
          return { message: "Quiz deleted successfully", success: true };
        }

        console.error(`❌ [DEBUG] Actual delete quiz error:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate tất cả quiz queries để đảm bảo danh sách được cập nhật
      queryClient.invalidateQueries({ queryKey: teachingKeys.all });
      toast.success("Xóa quiz thành công!");
    },
    onError: (error: any) => {
      console.error(`❌ [DEBUG] Delete quiz mutation error:`, error);
      // Chỉ hiển thị error toast nếu không phải là trường hợp xóa thành công
      const responseData = error.response?.data;
      const isActuallySuccess =
        (error.response?.status === 404 &&
          responseData?.message === "Quiz deleted successfully") ||
        (error.message &&
          error.message.includes("Quiz deleted successfully")) ||
        (responseData && responseData.message === "Quiz deleted successfully");

      if (!isActuallySuccess) {
        toast.error(error.message || "Lỗi khi xóa quiz");
      }
    },
  });
}

// Hook để lấy danh sách courses của teacher
export const useTeacherCourses = (assignmentId?: string | number) => {
  return useQuery({
    queryKey: [...teachingKeys.courses(), assignmentId],
    queryFn: async () => {
      if (assignmentId) {
        // Lấy courses từ assignment
        const response = await courseService.getCoursesByAssignment(
          Number(assignmentId)
        );
        if (response?.success && response?.data?.courses) {
          return response.data.courses;
        }
        return [];
      }

      // Lấy tất cả courses của teacher
      const response = await courseService.getCourses();
      if (response?.success && response?.data) {
        return Array.isArray(response.data)
          ? response.data
          : response.data.courses || [];
      }
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });
};

// Hook để lấy danh sách students trong course
export const useTeacherStudents = (
  courseId?: number,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
  }
) => {
  return useQuery({
    queryKey: teachingKeys.students(courseId, params),
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID is required");
      const students = await studentManagementService.getCourseStudents(
        courseId,
        params || {}
      );
      return students;
    },
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook để lấy chi tiết khóa học
export function useCourseDetail(courseId: number) {
  return useQuery({
    queryKey: teachingKeys.course(courseId),
    queryFn: async () => {
      const response = await courseService.getCourseById(courseId);

      // Handle wrapped response
      if (response?.success && response?.data) {
        return response.data;
      }

      // Handle direct response (fallback for older API structure)
      if (response && typeof response === "object" && "course_id" in response) {
        return response as any;
      }

      console.error("❌ [DEBUG] Failed to fetch course details:", response);
      throw new Error(
        (response as any)?.message || "Không thể tải thông tin khóa học"
      );
    },
    enabled: !!courseId,
  });
}

// Hook để lấy danh sách sinh viên trong khóa học
export function useCourseStudents(courseId: number) {
  return useQuery({
    queryKey: teachingKeys.students(courseId),
    queryFn: async () => {
      const response = await courseService.getCourseStudents(courseId);
      if (response?.success && response?.data) {
        return Array.isArray(response.data)
          ? response.data
          : (response.data as any).students;
      }
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    },
    enabled: !!courseId,
  });
}

// Hook để lấy cột điểm của khóa học
export function useCourseGradeColumns(courseId: number) {
  return useQuery({
    queryKey: teachingKeys.gradeColumns(courseId),
    queryFn: async () => {
      const response = await courseGradeService.getGradeColumns(courseId);
      if (response?.success && response?.data) {
        return response.data.grade_columns || [];
      }
      return [];
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook để lấy dữ liệu export (course + grade columns + students)
export function useCourseExportData(courseId: number) {
  return useQuery({
    queryKey: teachingKeys.courseStudentsWithGrades(courseId),
    queryFn: async () => {
      // Fetch tất cả dữ liệu cần thiết song song
      const [courseResponse, gradeColumnsResponse, studentsResponse] =
        await Promise.all([
          courseService.getCourseById(courseId),
          courseGradeService.getGradeColumns(courseId),
          courseService.getCourseStudents(courseId),
        ]);

      // Validate course response
      if (!courseResponse?.success) {
        throw new Error(
          courseResponse?.message || "Không thể tải thông tin khóa học"
        );
      }

      // Validate grade columns response
      if (!gradeColumnsResponse?.success) {
        throw new Error("Không thể tải cột điểm");
      }

      // Validate students response
      if (!studentsResponse?.success) {
        throw new Error("Không thể tải danh sách sinh viên");
      }

      return {
        course: courseResponse.data,
        gradeColumns: gradeColumnsResponse.data.grade_columns || [],
        students: studentsResponse.data || [],
      };
    },
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook để lấy analytics của khóa học
export function useCourseAnalytics(courseId: number) {
  return useQuery({
    queryKey: teachingKeys.courseAnalytics(courseId),
    queryFn: async () => {
      // Note: getCourseAnalytics method may not exist, using placeholder
      const response = { success: true, data: null };
      if (response?.success && response?.data) {
        return response.data;
      }
      if (response && !(response as any).hasOwnProperty("success")) {
        return response;
      }
      throw new Error(
        (response as any)?.message || "Không thể tải dữ liệu phân tích khóa học"
      );
    },
    enabled: !!courseId,
  });
}

// Hook để thêm sinh viên vào khóa học
export function useAddStudentToCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { courseId: number; studentId: number }) => {
      const response = await studentManagementService.enrollStudent({
        courseId: params.courseId,
        studentId: params.studentId,
      });
      // KIỂM TRA MẠNH MẼ HƠN - chấp nhận response có message thành công
      if (response?.success !== false && response?.message) {
        return response;
      }
      throw new Error(
        response?.message || "Không thể thêm sinh viên vào khóa học"
      );
    },
    onSuccess: (data, variables) => {
      // Invalidate students queries for this course
      queryClient.invalidateQueries({
        queryKey: teachingKeys.students(variables.courseId),
      });
      // Invalidate course students with grades
      queryClient.invalidateQueries({
        queryKey: teachingKeys.courseStudentsWithGrades(variables.courseId),
      });
      // Invalidate courses list
      queryClient.invalidateQueries({
        queryKey: teachingKeys.courses(),
      });
      toast.success("Thêm sinh viên vào khóa học thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi thêm sinh viên");
    },
  });
}

// Hook để xóa sinh viên khỏi khóa học
export function useRemoveStudentFromCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { courseId: number; studentId: number }) => {
      const response = await studentManagementService.unenrollStudent(
        params.studentId,
        params.courseId
      );
      // KIỂM TRA MẠNH MẼ HƠN - chấp nhận response có message thành công
      if (response?.success !== false && response?.message) {
        return response;
      }
      throw new Error(
        response?.message || "Không thể xóa sinh viên khỏi khóa học"
      );
    },
    onSuccess: (data, variables) => {
      // Invalidate students queries for this course
      queryClient.invalidateQueries({
        queryKey: teachingKeys.students(variables.courseId),
      });
      // Invalidate course students with grades
      queryClient.invalidateQueries({
        queryKey: teachingKeys.courseStudentsWithGrades(variables.courseId),
      });
      // Invalidate courses list
      queryClient.invalidateQueries({
        queryKey: teachingKeys.courses(),
      });
      toast.success("Xóa sinh viên khỏi khóa học thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi xóa sinh viên");
    },
  });
}

// Hook để tạo sinh viên mới
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentData: any) => {
      const response = await studentManagementService.createStudent(
        studentData
      );
      // KIỂM TRA MẠNH MẼ HƠN - chấp nhận response có message thành công
      if (response?.success !== false && response?.message) {
        return response;
      }
      throw new Error(response?.message || "Không thể tạo sinh viên");
    },
    onSuccess: () => {
      // Invalidate tất cả student queries
      queryClient.invalidateQueries({
        queryKey: teachingKeys.all,
      });
      // Invalidate các queries liên quan khác
      queryClient.invalidateQueries({
        queryKey: ["courses"],
      });
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      toast.success("Tạo sinh viên thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi tạo sinh viên");
    },
  });
}

// Hook để cập nhật sinh viên
export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: number; studentData: any }) => {
      const startTime = Date.now();

      const response = await studentManagementService.updateUser(
        params.id,
        params.studentData
      );

      const duration = Date.now() - startTime;

      // KIỂM TRA MẠNH MẼ HƠN:
      // Nếu có trường 'success' thì dùng nó. Nếu không, kiểm tra xem có 'data' hoặc có dữ liệu trong response không,
      // và 'success' không phải là false một cách tường minh.
      if (
        response?.success === true ||
        ((response?.data || (response as any)?.user) &&
          response?.success !== false)
      ) {
        return response;
      }

      // Nếu không thành công, throw lỗi với message từ API
      console.error(`❌ [DEBUG] Update student ${params.id} failed:`, response);
      throw new Error(response?.message || "Không thể cập nhật sinh viên");
    },
    onSuccess: (data) => {
      // Invalidate tất cả student queries
      queryClient.invalidateQueries({
        queryKey: teachingKeys.all,
      });
      // Invalidate các queries liên quan khác
      queryClient.invalidateQueries({
        queryKey: ["courses"],
      });
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      toast.success("Cập nhật sinh viên thành công!");
    },
    onError: (error: any) => {
      console.error(
        `❌ [DEBUG] useUpdateStudent onError called with error:`,
        error
      );
      console.error(`❌ [DEBUG] Error details:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error,
      });
      toast.error(error.message || "Lỗi khi cập nhật sinh viên");
    },
  });
}

// Hook để xóa sinh viên
export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: number) => {
      const response = await studentManagementService.deleteUser(studentId);
      // KIỂM TRA MẠNH MẼ HƠN - chấp nhận response có message thành công
      if (response?.success !== false && response?.message) {
        return response;
      }
      throw new Error(response?.message || "Không thể xóa sinh viên");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teachingKeys.all,
      });
      toast.success("Xóa sinh viên thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi xóa sinh viên");
    },
  });
}

// Hook để xóa nhiều sinh viên cùng lúc
export function useBulkRemoveStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { courseId: number; studentIds: number[] }) => {
      const promises = params.studentIds.map((studentId) =>
        studentManagementService.unenrollStudent(studentId, params.courseId)
      );
      await Promise.all(promises);
      return { success: true };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: teachingKeys.students(variables.courseId),
      });
      toast.success(
        `Đã xóa ${variables.studentIds.length} sinh viên thành công!`
      );
    },
    onError: (error: any) => {
      toast.error(error.message || "Không thể xóa sinh viên");
    },
  });
}

// Hook để cập nhật điểm thi cuối kỳ
export function useUpdateFinalExamScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      courseId: number;
      studentId: number;
      finalExamScore: number;
    }) => {
      const response = await courseGradeService.updateFinalExamScore(
        params.courseId,
        {
          student_id: params.studentId,
          final_exam_score: params.finalExamScore,
        }
      );
      // KIỂM TRA MẠNH MẼ HƠN - chấp nhận response có message thành công
      if (response?.success !== false && response?.message) {
        return response.data;
      }
      throw new Error(
        response?.message || "Không thể cập nhật điểm thi cuối kỳ"
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: teachingKeys.courseStudentsWithGrades(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: teachingKeys.students(variables.courseId),
      });
      toast.success("Cập nhật điểm thi cuối kỳ thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi cập nhật điểm thi cuối kỳ");
    },
  });
}

// Hook để tính lại điểm
export function useRecalculateGrades() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      courseId: number;
      studentIds: number[];
      recalculateAll?: boolean;
    }) => {
      const response = await courseGradeService.recalculateAllGrades(
        params.courseId,
        {
          student_ids: params.studentIds,
          recalculate_all: params.recalculateAll || false,
        }
      );
      // KIỂM TRA MẠNH MẼ HƠN - chấp nhận response có message thành công
      if (response?.success !== false && response?.message) {
        return response.data;
      }
      throw new Error(response?.message || "Không thể tính lại điểm");
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: teachingKeys.courseStudentsWithGrades(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: teachingKeys.students(variables.courseId),
      });
      toast.success("Tính lại điểm thành công!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi tính lại điểm");
    },
  });
}

// THÊM HOOK MỚI NÀY VÀO CUỐI TỆP
// Hook để chuyển đổi chế độ quiz
export function useSwitchQuizMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quizId,
      newMode,
    }: {
      quizId: number;
      newMode: QuizMode;
    }) => {
      const response = await quizService.switchQuizMode(quizId, newMode);
      if (response?.success || response?.quiz_mode) {
        return response;
      }
      throw new Error(
        (response as any)?.message || "Không thể chuyển đổi chế độ quiz"
      );
    },
    onSuccess: (data, variables) => {
      const modeLabel =
        variables.newMode === "assessment" ? "Đánh giá" : "Luyện tập";
      toast.success(`Đã chuyển sang chế độ ${modeLabel} thành công`);
      // Vô hiệu hóa và refetch dữ liệu chi tiết của quiz này
      queryClient.invalidateQueries({
        queryKey: teachingKeys.quiz(variables.quizId),
      });
      // Vô hiệu hóa tất cả quiz list queries để cập nhật danh sách
      queryClient.invalidateQueries({
        queryKey: teachingKeys.all,
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Lỗi khi chuyển đổi chế độ quiz");
    },
  });
}

// Utility functions
export const getQuizStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "active":
    case "hoạt động":
      return "bg-green-100 text-green-800";
    case "inactive":
    case "không hoạt động":
      return "bg-red-100 text-red-800";
    case "draft":
    case "nháp":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getCourseStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "active":
    case "đang diễn ra":
      return "bg-green-100 text-green-800";
    case "completed":
    case "hoàn thành":
      return "bg-blue-100 text-blue-800";
    case "upcoming":
    case "sắp diễn ra":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const formatStudentCount = (count: number): string => {
  if (count === 0) return "Chưa có sinh viên";
  if (count === 1) return "1 sinh viên";
  return `${count} sinh viên`;
};
