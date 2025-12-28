"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  UserCredentials,
  RegisterCredentials,
  AuthResponse,
  ApiError,
  User,
} from "@/lib/types/auth";
import { authService } from "@/lib/services/api";
import { showSuccessToast, showErrorToast } from "@/lib/utils/toast-utils";
import {
  saveToken,
  removeToken,
  isValidToken,
  getUserFromToken,
} from "@/lib/auth/token-utils";

/**
 * Hook xử lý đăng nhập sử dụng TanStack Query
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: UserCredentials): Promise<AuthResponse> => {
      const response = await authService.login(
        credentials.email,
        credentials.password
      );


      // Xử lý response với wrapper success/data
      let data;
      if (response?.success && response?.data) {
        data = response.data;
      } else if (response?.user && response?.token) {
        // Fallback cho cấu trúc cũ nếu cần
        data = response;
      } else {
        throw new Error("Invalid login response structure");
      }

      // Kiểm tra dữ liệu người dùng
      if (data.user) {
        // Ghi log thông tin đăng nhập để debug

        // Xử lý trường hợp vai trò có thể nằm trong cấu trúc khác nhau
        let role = data.user.role;
        if (!role && data.user.Role && data.user.Role.name) {
          role = data.user.Role.name;
          data.user.role = role;
        }

        if (role) {
          // Lưu token vào localStorage
          saveToken(data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          return {
            token: data.token,
            user: {
              user_id: data.user.user_id,
              fullName: data.user.name,
              name: data.user.name,
              email: data.user.email,
              role: role,
            },
          };
        }
      }

      // Nếu không có thông tin vai trò
      throw new Error(
        "Không thể xác định vai trò người dùng. Vui lòng liên hệ quản trị viên."
      );
    },
    onSuccess: (data) => {
      // Invalidate và refetch tất cả queries sau khi login thành công
      queryClient.invalidateQueries();
      showSuccessToast("Đăng nhập thành công!");
    },
    onError: (error: any) => {
      console.error("Login Error:", error);
      // Toast sẽ được hiển thị từ interceptor API hoặc component sử dụng
    },
  });
}

/**
 * Hook xử lý đăng ký sử dụng TanStack Query
 */
export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      credentials: RegisterCredentials
    ): Promise<AuthResponse> => {
      let data;

      // Hiện tại chỉ hỗ trợ đăng ký sinh viên
      if (credentials.role === "student") {
        const response = await authService.registerStudent(
          credentials.fullName,
          credentials.email,
          credentials.password
        );


        // Xử lý response với wrapper success/data
        if (response?.success && response?.data) {
          data = response.data;
        } else if (response?.user && response?.token) {
          data = response;
        } else {
          throw new Error("Invalid register response structure");
        }
      } else if (credentials.role === "teacher") {
        throw new Error(
          "Đăng ký giáo viên cần quyền admin. Vui lòng liên hệ quản trị viên để được hỗ trợ."
        );
      } else {
        throw new Error("Vai trò không hợp lệ");
      }

      return {
        token: data.token || "",
        user: {
          user_id: data.user.user_id,
          fullName: data.user.name,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        },
      };
    },
    onSuccess: (data) => {
      // Invalidate và refetch tất cả queries sau khi register thành công
      queryClient.invalidateQueries();
      showSuccessToast("Đăng ký tài khoản thành công!");
    },
    onError: (error: any) => {
      console.error("Register Error:", error);
      // Toast sẽ được hiển thị từ interceptor API hoặc component sử dụng
    },
  });
}

/**
 * Hook xử lý đăng xuất
 */
export function useLogout() {
  const queryClient = useQueryClient();

  const logout = () => {
    removeToken();
    localStorage.removeItem("user");
    // Clear tất cả cache khi logout
    queryClient.clear();
    window.location.href = "/login";
  };

  return { logout };
}

/**
 * Hook kiểm tra trạng thái đăng nhập sử dụng TanStack Query
 */
export function useAuthStatus() {
  const isAuthenticated = useCallback((): boolean => {
    // useCallback với dependency rỗng [] sẽ đảm bảo hàm này
    // chỉ được tạo một lần duy nhất và không thay đổi giữa các lần render.
    // Điều này sẽ phá vỡ vòng lặp useEffect trong AvatarProvider.
    return isValidToken();
  }, []);

  const getUserFromStorage = (): User | null => {
    // Ưu tiên lấy từ localStorage trước
    if (typeof window !== "undefined") {
      const userFromLocal = localStorage.getItem("user");
      if (userFromLocal) {
        try {
          const parsedUser = JSON.parse(userFromLocal);
          // Chuẩn hóa dữ liệu để đảm bảo có id
          return {
            user_id: parsedUser.user_id || parsedUser.id,
            fullName: parsedUser.name || parsedUser.fullName,
            name: parsedUser.name, // Preserve trường name từ backend
            email: parsedUser.email,
            role:
              parsedUser.role || (parsedUser.Role ? parsedUser.Role.name : ""),
            avatar: parsedUser.avatar,
          };
        } catch (e) {
          console.error("Lỗi khi phân tích dữ liệu user từ localStorage:", e);
        }
      }
    }

    // Nếu không có trong localStorage thì lấy từ token
    const tokenUser = getUserFromToken();
    return tokenUser;
  };

  // Sử dụng useQuery để quản lý user data
  const {
    data: user,
    isLoading: loading,
    refetch: refreshUserData,
  } = useQuery({
    queryKey: ["auth-status"],
    queryFn: async (): Promise<User | null> => {
      if (!isAuthenticated()) {
        return null;
      }

      // Lấy dữ liệu từ local/token
      const localUser = getUserFromStorage();
      if (localUser) {
        return localUser;
      }

      // Có thể thêm API call ở đây nếu cần
      // const userData = await authService.getCurrentUser();
      // return userData;

      return null;
    },
    enabled: true,
    staleTime: 10 * 1000, // 10 giây cho auth data
    gcTime: 2 * 60 * 1000, // 2 phút
    retry: false, // Không retry cho auth queries
    refetchOnWindowFocus: true, // Refetch khi focus lại tab
    refetchOnMount: true, // Refetch khi mount component
  });

  const getUser = (): User | null => {
    return user || null;
  };

  return { isAuthenticated, getUser, user, loading, refreshUserData };
}
