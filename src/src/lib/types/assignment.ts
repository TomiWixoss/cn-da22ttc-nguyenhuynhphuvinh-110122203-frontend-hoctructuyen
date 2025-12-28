// Centralized assignment types to avoid duplication

export interface Assignment {
  assignment_id: number;
  teacher_id: number;
  subject_id: number;
  semester_id?: number;
  workload_hours?: number;
  note?: string;
  Subject?: {
    subject_id: number;
    name: string;
    code?: string;
    credits?: number;
    description?: string;
  };
  Semester?: {
    name: string;
    academic_year: string;
    semester_id?: number;
  };
  Teacher?: {
    user_id: number;
    fullName: string;
    name?: string;
  };
  can_create_course?: boolean;
}

export interface AssignmentResponse {
  success: boolean;
  data: {
    teacher_id: number;
    assignments: Assignment[];
  };
}

// Re-export from service for backward compatibility
export type { 
  TeacherAssignment,
  CreateAssignmentRequest,
  Teacher,
  Subject 
} from '@/lib/services/api/assignment.service';
