"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { AssignmentService } from "@/lib/services/api/assignment.service";
import { useAuthStatus } from "@/lib/hooks/use-auth";

interface Assignment {
  assignment_id: number;
  teacher_id: number;
  subject_id: number;
  semester_id?: number;
  workload_hours?: number;
  note?: string;
  is_active?: boolean;
  assigned_at?: string;
  Subject?: {
    subject_id: number;
    name: string;
    description?: string;
  };
  Semester?: {
    semester_id: string;
    name: string;
    academic_year: string;
    start_date: string;
    end_date: string;
  };
  Courses?: Array<{
    course_id: string;
    name: string;
  }>;
  can_create_course?: boolean;
  course_count?: number;
}

interface AssignmentContextType {
  currentAssignmentId: string | null;
  assignments: Assignment[];
  setCurrentAssignmentId: (id: string) => void;
  createTeacherUrl: (path: string) => string;
  isLoading: boolean;
  isTeacher: boolean;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(
  undefined
);

export function AssignmentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentAssignmentId, setCurrentAssignmentIdState] = useState<
    string | null
  >(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStatus();

  // Chỉ fetch assignments khi user là teacher
  const isTeacher = user?.role === "teacher";

  // Fetch assignments khi component mount và user đã load
  useEffect(() => {
    if (!authLoading) {
      if (isTeacher) {
        fetchAssignments();
      } else {
        // Nếu không phải teacher, set loading = false và không fetch
        setIsLoading(false);
        setAssignments([]);
        setCurrentAssignmentIdState(null);
      }
    }
  }, [authLoading, isTeacher]);

  // Sync với URL params và auto-select assignment từ localStorage hoặc first assignment
  useEffect(() => {
    if (!isTeacher || assignments.length === 0) return;

    const assignmentIdFromUrl = searchParams.get("assignment_id");
    const lastSelectedId = localStorage.getItem("last_selected_assignment_id");

    if (assignmentIdFromUrl && assignments.length > 0) {
      // Nếu có assignment_id trong URL và assignments đã load, set theo URL
      const assignmentExists = assignments.some(
        (a) => a.assignment_id.toString() === assignmentIdFromUrl
      );
      if (assignmentExists) {
        setCurrentAssignmentIdState(assignmentIdFromUrl);
        // Lưu vào localStorage
        localStorage.setItem(
          "last_selected_assignment_id",
          assignmentIdFromUrl
        );
      } else {
        // Nếu assignment_id trong URL không tồn tại, thử lấy từ localStorage
        if (
          lastSelectedId &&
          assignments.some((a) => a.assignment_id.toString() === lastSelectedId)
        ) {
          setCurrentAssignmentIdState(lastSelectedId);
          updateUrlWithAssignmentId(lastSelectedId);
        } else {
          // Fallback: chọn assignment đầu tiên
          const firstAssignment = assignments[0];
          const newId = firstAssignment.assignment_id.toString();
          setCurrentAssignmentIdState(newId);
          updateUrlWithAssignmentId(newId);
          localStorage.setItem("last_selected_assignment_id", newId);
        }
      }
    } else {
      // Không có assignment_id trong URL: ưu tiên lấy từ localStorage
      if (
        lastSelectedId &&
        assignments.some((a) => a.assignment_id.toString() === lastSelectedId)
      ) {
        setCurrentAssignmentIdState(lastSelectedId);
        updateUrlWithAssignmentId(lastSelectedId);
      } else {
        // Fallback: chọn assignment đầu tiên
        const firstAssignment = assignments[0];
        const newId = firstAssignment.assignment_id.toString();
        setCurrentAssignmentIdState(newId);
        updateUrlWithAssignmentId(newId);
        localStorage.setItem("last_selected_assignment_id", newId);
      }
    }
  }, [assignments, searchParams, pathname, isTeacher]);

  const fetchAssignments = async () => {
    // Chỉ fetch khi user là teacher
    if (!isTeacher) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await AssignmentService.getMyAssignments();

      if (data.success) {
        const assignmentsArray = (data.data as any)?.assignments || data.data;
        const validAssignments = Array.isArray(assignmentsArray)
          ? assignmentsArray
          : [];
        setAssignments(validAssignments);

        // Tự động chọn assignment đầu tiên nếu có assignments và chưa có assignment được chọn
        if (validAssignments.length > 0 && !currentAssignmentId) {
          const firstAssignment = validAssignments[0];
          const newId = firstAssignment.assignment_id.toString();
          setCurrentAssignmentIdState(newId);
          updateUrlWithAssignmentId(newId);
        }
      }
    } catch (error) {
      console.error("💥 Lỗi khi tải phân công:", error);
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUrlWithAssignmentId = (assignmentId: string) => {
    // Chỉ update URL khi là teacher
    if (!isTeacher) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("assignment_id", assignmentId);

    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl);
  };

  const setCurrentAssignmentId = (id: string) => {
    // Chỉ cho phép set assignment khi là teacher
    if (!isTeacher) return;

    setCurrentAssignmentIdState(id);
    updateUrlWithAssignmentId(id);
    // Lưu vào localStorage khi user chọn assignment
    localStorage.setItem("last_selected_assignment_id", id);
  };

  const createTeacherUrl = (path: string): string => {
    // Nếu không phải teacher, trả về path gốc
    if (!isTeacher) {
      return path;
    }

    // Nếu chưa có assignment_id, trả về path gốc
    if (!currentAssignmentId) {
      return path;
    }

    // Tạo URL với assignment_id cho tất cả dashboard routes
    if (path.startsWith("/dashboard")) {
      const url = new URL(path, window.location.origin);
      url.searchParams.set("assignment_id", currentAssignmentId);
      return url.pathname + url.search;
    }

    return path;
  };

  return (
    <AssignmentContext.Provider
      value={{
        currentAssignmentId,
        assignments,
        setCurrentAssignmentId,
        createTeacherUrl,
        isLoading,
        isTeacher,
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
}

export function useAssignmentContext() {
  const context = useContext(AssignmentContext);
  if (context === undefined) {
    throw new Error(
      "useAssignmentContext must be used within an AssignmentProvider"
    );
  }
  return context;
}
