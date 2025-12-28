import api from "./client";
import type {
  Subject,
  SubjectListResponse,
  SubjectResponse,
  CreateSubjectRequest,
  UpdateSubjectRequest,
  SubjectsByCourseResponse,
  ChaptersBySubjectResponse,
  TypeSubjectListResponse,
  TypeSubjectResponse,
  CreateTypeSubjectRequest,
  UpdateTypeSubjectRequest,
  SubjectTypes,
} from "@/lib/types/subject";

export class SubjectService {
  private static readonly BASE_URL = "/subjects";
  private static readonly TYPE_SUBJECTS_URL = "/type-subjects";

  // Subject CRUD operations
  static async getAllSubjects(
    page = 1,
    limit = 10
  ): Promise<SubjectListResponse> {
    const response = await api.get(
      `${this.BASE_URL}?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  static async getSubjectById(id: number): Promise<SubjectResponse> {
    const response = await api.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  static async createSubject(
    data: CreateSubjectRequest
  ): Promise<SubjectResponse> {
    const response = await api.post(this.BASE_URL, data);
    return response.data;
  }

  static async updateSubject(
    id: number,
    data: UpdateSubjectRequest
  ): Promise<SubjectResponse> {
    const response = await api.put(`${this.BASE_URL}/${id}`, data);
    return response.data;
  }

  static async deleteSubject(
    id: number
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  // Additional subject operations
  static async getSubjectsByCourse(
    courseId: number
  ): Promise<SubjectsByCourseResponse> {
    const response = await api.get(`${this.BASE_URL}/course/${courseId}`);
    return response.data;
  }

  static async getChaptersBySubject(
    subjectId: number
  ): Promise<ChaptersBySubjectResponse> {
    const response = await api.get(`${this.BASE_URL}/${subjectId}/chapters`);
    return response.data;
  }

  // Type Subject CRUD operations
  static async getAllTypeSubjects(
    page = 1,
    limit = 10
  ): Promise<TypeSubjectListResponse> {
    const response = await api.get(
      `${this.TYPE_SUBJECTS_URL}?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  static async getTypeSubjectById(id: number): Promise<TypeSubjectResponse> {
    const response = await api.get(`${this.TYPE_SUBJECTS_URL}/${id}`);
    return response.data;
  }

  static async createTypeSubject(
    data: CreateTypeSubjectRequest
  ): Promise<TypeSubjectResponse> {
    const response = await api.post(this.TYPE_SUBJECTS_URL, data);
    return response.data;
  }

  static async updateTypeSubject(
    id: number,
    data: UpdateTypeSubjectRequest
  ): Promise<TypeSubjectResponse> {
    const response = await api.put(`${this.TYPE_SUBJECTS_URL}/${id}`, data);
    return response.data;
  }

  static async deleteTypeSubject(
    id: number
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`${this.TYPE_SUBJECTS_URL}/${id}`);
    return response.data;
  }

  // Get available courses
  static async getCourses(): Promise<any[]> {
    try {
      const response = await api.get("/courses");
      return response.data.data?.courses || response.data || [];
    } catch (error) {
      console.error("❌ [SubjectService] getCourses - Error:", error);
      return [];
    }
  }

  // Program-Subject relationship methods
  static async getSubjectsByProgram(programId: number): Promise<any> {
    const response = await api.get(`/programs/${programId}/subjects`);
    return response.data;
  }

  static async attachSubjectToProgram(
    programId: number,
    data: {
      subject_id: number;
      order_index?: number;
      recommended_semester?: number;
      is_mandatory?: boolean;
    }
  ): Promise<any> {
    const response = await api.post(`/programs/${programId}/subjects`, data);
    return response.data;
  }

  static async createAndAttachSubjectToProgram(
    programId: number,
    data: any
  ): Promise<any> {
    const response = await api.post(`/programs/${programId}/subjects`, data);
    return response.data;
  }

  static async updateSubjectInProgram(
    programId: number,
    subjectId: number,
    data: {
      order_index?: number;
      recommended_semester?: number;
      is_mandatory?: boolean;
      is_active?: boolean;
    }
  ): Promise<any> {
    const response = await api.patch(
      `/programs/${programId}/subjects/${subjectId}`,
      data
    );
    return response.data;
  }

  static async removeSubjectFromProgram(
    programId: number,
    subjectId: number,
    force: boolean = false
  ): Promise<any> {
    const response = await api.delete(
      `/programs/${programId}/subjects/${subjectId}${
        force ? "?force=true" : ""
      }`
    );
    return response.data;
  }

  // Helper methods for form data
  static async getFormData(): Promise<{
    typeSubjects: SubjectTypes.TypeSubject[];
    typeOfKnowledges: SubjectTypes.TypeOfKnowledge[];
    plos: SubjectTypes.PLO[];
    courses: any[];
  }> {
    try {
      // These endpoints would need to be implemented in backend if not available
      const [typeSubjectsRes, typeOfKnowledgesRes, plosRes, coursesRes] =
        await Promise.all([
          api.get("/type-subjects"),
          api.get("/type-of-knowledges"),
          api.get("/plos"),
          api.get("/courses"),
        ]);


      const result = {
        typeSubjects: typeSubjectsRes.data.data?.typeSubjects || [],
        typeOfKnowledges: typeOfKnowledgesRes.data.data?.typeOfKnowledges || [],
        plos: plosRes.data.data?.plos || [],
        courses: coursesRes.data.data?.courses || coursesRes.data || [],
      };

      return result;
    } catch (error) {
      console.error("❌ [SubjectService] getFormData - Error:", error);
      return {
        typeSubjects: [],
        typeOfKnowledges: [],
        plos: [],
        courses: [],
      };
    }
  }

  // ===== CÁC HÀM MỚI ĐỂ QUẢN LÝ LIÊN KẾT SUBJECT-PLO =====

  /**
   * Lấy danh sách PLO đã được liên kết với một môn học.
   * API: GET /api/subjects/:subject_id/plos
   */
  static async getPLOsBySubject(subjectId: number): Promise<any> {
    const response = await api.get(`${this.BASE_URL}/${subjectId}/plos`);
    return response.data;
  }

  /**
   * Thêm một hoặc nhiều PLO vào một môn học.
   * API: POST /api/subjects/:subject_id/plos
   */
  static async addPLOsToSubject(
    subjectId: number,
    ploIds: number[]
  ): Promise<any> {
    const response = await api.post(`${this.BASE_URL}/${subjectId}/plos`, {
      plo_ids: ploIds,
    });
    return response.data;
  }

  /**
   * Xóa một hoặc nhiều liên kết PLO khỏi một môn học.
   * API: DELETE /api/subjects/:subject_id/plos
   */
  static async removePLOsFromSubject(
    subjectId: number,
    ploIds: number[]
  ): Promise<any> {
    const response = await api.delete(`${this.BASE_URL}/${subjectId}/plos`, {
      data: { plo_ids: ploIds },
    });
    return response.data;
  }
}

export type {
  Subject,
  SubjectTypes,
  CreateSubjectRequest,
  UpdateSubjectRequest,
  SubjectListResponse,
  SubjectResponse,
  SubjectsByCourseResponse,
  ChaptersBySubjectResponse,
  TypeSubjectListResponse,
  TypeSubjectResponse,
  CreateTypeSubjectRequest,
  UpdateTypeSubjectRequest,
};
