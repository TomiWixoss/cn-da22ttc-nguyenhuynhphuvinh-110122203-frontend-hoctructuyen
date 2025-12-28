// frontend/src/lib/types/lo.ts

export interface LO {
  lo_id: number;
  name: string;
  description?: string | null;
  subject_id: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface LOWithRelations extends LO {
  Subject?: {
    subject_id: number;
    name: string;
  } | null;
  Chapters?: Array<{
    chapter_id: number;
    name: string;
  }>;
  Questions?: Array<{
    question_id: number;
    question_text: string;
  }>;
}

export interface LOCreateRequest {
  name: string;
  description?: string | null;
  subject_id: number | null;
  chapter_ids?: number[];
}

export interface LOUpdateRequest extends Partial<LOCreateRequest> {}

export interface LOListResponse {
  success: boolean;
  data: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    los: LOWithRelations[];
  };
}

export interface LOApiResponse {
  success: boolean;
  data: LOWithRelations;
}
