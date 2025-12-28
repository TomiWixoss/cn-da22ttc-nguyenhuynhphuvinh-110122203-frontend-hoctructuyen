import api from "./client";

export interface User {
  user_id: number;
  name: string;
  email: string;
  role_id: number;
  total_points: number;
  current_level: number;
  experience_points: number;
  student_id?: string;
  Role: {
    role_id: number;
    name: string;
  };
}

export interface UsersListResponse {
  success: boolean;
  data: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    users: User[];
  };
}

export interface UserDetailResponse {
  success: boolean;
  data: User;
}

export interface CreateUserResponse {
  message: string;
  user: {
    user_id: number;
    name: string;
    email: string;
    role: string;
  };
}

// Service quản lý người dùng (dành cho admin)
export const userService = {
  // Lấy danh sách người dùng với filter và search
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    q?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.role) queryParams.append("role", params.role);
    if (params?.q) queryParams.append("q", params.q);

    const response = await api.get<UsersListResponse>(
      `/users?${queryParams.toString()}`
    );
    return response.data;
  },

  // Lấy thông tin người dùng theo ID
  getUserById: async (id: number) => {
    const response = await api.get<UserDetailResponse>(`/users/${id}`);
    return response.data;
  },

  // Tạo admin mới (yêu cầu quyền admin)
  createAdmin: async (name: string, email: string, password: string) => {
    const response = await api.post<CreateUserResponse>("/users/createAdmin", {
      name,
      email,
      password,
    });
    return response.data;
  },

  // Tạo giảng viên mới (yêu cầu quyền admin)
  createTeacher: async (name: string, email: string, password: string) => {
    const response = await api.post<CreateUserResponse>(
      "/users/createTeacher",
      {
        name,
        email,
        password,
      }
    );
    return response.data;
  },

  // Cập nhật thông tin người dùng (yêu cầu quyền admin)
  updateUser: async (id: number, data: { name?: string; email?: string }) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Xóa người dùng (yêu cầu quyền admin)
  deleteUser: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Import danh sách học viên từ file Excel (yêu cầu quyền giáo viên)
  importStudents: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/users/importStudents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Đổi mật khẩu (sinh viên tự đổi)
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post("/users/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  // Reset mật khẩu (admin/teacher reset cho user khác)
  resetPassword: async (userId: number, newPassword: string) => {
    const response = await api.put(`/users/${userId}/password`, {
      new_password: newPassword,
    });
    return response.data;
  },
};

export default userService;
