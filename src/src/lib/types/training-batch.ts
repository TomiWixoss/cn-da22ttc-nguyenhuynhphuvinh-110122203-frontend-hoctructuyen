import type { Program } from "./program-management";
import type { Course } from "./course";

// Placeholder types for Semester and TeacherSubjectAssignment
interface Semester {
  semester_id: number;
  name: string;
}

interface TeacherSubjectAssignment {
  assignment_id: number;
  subject_id: number;
}

// ===== TRAINING BATCH TYPES =====

export interface TrainingBatch {
  batch_id: number;
  program_id: number;
  name: string;
  start_year: number;
  end_year: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TrainingBatchWithRelations extends TrainingBatch {
  Program?: Program;
  Semesters?: Semester[];
  TeacherAssignments?: TeacherSubjectAssignment[];
  Courses?: Course[];
  _count?: {
    Semesters: number;
    TeacherAssignments: number;
    Courses: number;
  };
}

export interface TrainingBatchListResponse {
  success: boolean;
  data: {
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    };
    records: TrainingBatchWithRelations[];
  };
  message?: string;
}

export interface TrainingBatchCreateRequest {
  program_id: number;
  name: string;
  start_year: number;
  end_year: number;
  description?: string;
}

export interface TrainingBatchUpdateRequest
  extends Partial<TrainingBatchCreateRequest> {}

// ===== API RESPONSE TYPES =====

export interface TrainingBatchApiResponse {
  success: boolean;
  data: TrainingBatch;
  message?: string;
}

export interface TrainingBatchWithRelationsApiResponse {
  success: boolean;
  data: TrainingBatchWithRelations;
  message?: string;
}

export interface TrainingBatchDeleteApiResponse {
  success: boolean;
  message?: string;
}

// ===== FILTER PARAMS =====

export interface TrainingBatchFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  program_id?: number;
}
