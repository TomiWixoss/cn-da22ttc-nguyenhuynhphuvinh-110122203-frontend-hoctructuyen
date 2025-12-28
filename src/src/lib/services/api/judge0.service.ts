import axios from "axios";

// Tạo một instance axios riêng cho Judge0 API
const judge0Api = axios.create({
  baseURL: "https://judge0-ce.p.rapidapi.com",
  headers: {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
    "X-RapidAPI-Host": process.env.NEXT_PUBLIC_RAPIDAPI_HOST,
  },
});

interface Judge0Language {
  id: number;
  name: string;
}

interface SubmissionResponse {
  token: string;
}

interface SubmissionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
}

const judge0Service = {
  /**
   * Lấy danh sách tất cả ngôn ngữ được hỗ trợ
   */
  getLanguages: async (): Promise<Judge0Language[]> => {
    const response = await judge0Api.get("/languages");
    return response.data;
  },

  /**
   * Bước 1: Gửi code lên và nhận một token để theo dõi
   */
  createSubmission: async (languageId: number, sourceCode: string): Promise<SubmissionResponse> => {
    const response = await judge0Api.post("/submissions", {
      language_id: languageId,
      source_code: sourceCode,
    });
    return response.data;
  },

  /**
   * Bước 2: Dùng token để lấy kết quả
   */
  getSubmissionResult: async (token: string): Promise<SubmissionResult> => {
    const response = await judge0Api.get(`/submissions/${token}`);
    return response.data;
  },
};

export default judge0Service;
export type { Judge0Language, SubmissionResult };
