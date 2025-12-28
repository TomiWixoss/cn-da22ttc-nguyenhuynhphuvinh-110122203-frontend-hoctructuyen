// Subject management types
export namespace SubjectTypes {
  export interface TypeSubject {
    type_id: number;
    description: string;
  }

  export interface TypeOfKnowledge {
    noidung_id: number;
    description: string;
  }

  export interface PLO {
    plo_id: number;
    name?: string;
    description: string;
  }

  export interface Course {
    course_id: number;
    name: string;
    description?: string;
  }

  export interface Chapter {
    chapter_id: number;
    name: string;
    description?: string;
    LOs?: LO[];
  }

  export interface LO {
    lo_id: number;
    name: string;
    description?: string;
  }
}

export interface Subject {
  subject_id: number;
  course_id: number;
  type_id: number;
  noidung_id: number;
  name: string;
  description?: string;
  created_at: string;
  plo_id?: number; // THAY ĐỔI: Làm plo_id optional

  // Relations
  Courses?: SubjectTypes.Course[];
  TypeSubject?: SubjectTypes.TypeSubject;
  TypeOfKnowledge?: SubjectTypes.TypeOfKnowledge;
  PLO?: SubjectTypes.PLO;
  PLOs?: SubjectTypes.PLO[]; // Add PLOs array for the actual API response
  PrerequisiteSubjects?: Subject[];
  Chapters?: SubjectTypes.Chapter[];
}

export interface CreateSubjectRequest {
  name: string;
  description?: string;
  type_id: number;
  noidung_id: number;
  plo_ids?: number[]; // THAY ĐỔI: Làm plo_ids optional
}

export interface UpdateSubjectRequest extends Partial<CreateSubjectRequest> {}

export interface SubjectListResponse {
  success: boolean;
  data: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    subjects: Subject[];
  };
}

export interface SubjectResponse {
  success: boolean;
  data: Subject;
}

export interface SubjectsByCourseResponse {
  success: boolean;
  data: {
    course: SubjectTypes.Course;
    subject: Subject;
  };
}

export interface ChaptersBySubjectResponse {
  success: boolean;
  subject: {
    subject_id: number;
    name: string;
    description?: string;
  };
  totalItems: number;
  totalPages: number;
  currentPage: number;
  chapters: SubjectTypes.Chapter[];
}

// Type Subject types
export interface TypeSubjectListResponse {
  success: boolean;
  data: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    typeSubjects: SubjectTypes.TypeSubject[];
  };
}

export interface TypeSubjectResponse {
  success: boolean;
  data: SubjectTypes.TypeSubject;
}

export interface CreateTypeSubjectRequest {
  description: string;
}

export interface UpdateTypeSubjectRequest {
  description?: string;
}
