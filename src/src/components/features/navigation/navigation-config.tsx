import { NavSection as NavSectionType } from "@/lib/types/nav";
import { Role } from "@/lib/auth/role-manager";
import { FeatureFlags, FeatureKey } from "@/lib/types/feature-toggle";

// Các mục điều hướng cho Admin (đã cập nhật theo cấu trúc phân cấp mới)
const adminNavItems: NavSectionType = {
  items: [
    { title: "Tổng quan", href: "/dashboard", icon: "LayoutDashboard" },
    {
      title: "Chương trình ĐT",
      href: "/dashboard/admin/programs",
      icon: "GraduationCap",
    },
    {
      title: "Khóa đào tạo",
      href: "/dashboard/admin/training-batches",
      icon: "Archive",
    },
    {
      title: "Quản lý tài khoản",
      href: "/dashboard/admin/accounts",
      icon: "Users",
    },
    {
      title: "Quản lý Hệ thống",
      href: "/dashboard/admin/system",
      icon: "Settings",
    },
  ],
};

// Các mục điều hướng cho Giảng viên (đã sắp xếp lại)
const teacherNavItems: NavSectionType = {
  items: [
    { title: "Tổng quan", href: "/dashboard", icon: "LayoutDashboard" },
    {
      title: "Khóa học",
      href: "/dashboard/teaching/courses",
      icon: "GraduationCap",
    },
    {
      title: "Quản lý câu hỏi",
      href: "/dashboard/teaching/questions",
      icon: "HelpCircle",
    },
    {
      title: "Quản lý Sinh viên",
      href: "/dashboard/teaching/students",
      icon: "Users",
    },
    {
      title: "Quản lý Quiz",
      href: "/dashboard/teaching/quizzes/list",
      icon: "ClipboardList",
    },
  ],
};

// Các mục điều hướng cho Sinh viên (đã sắp xếp lại)
const studentNavItems: NavSectionType = {
  items: [
    { title: "Tổng quan", href: "/dashboard", icon: "LayoutDashboard" },
    {
      title: "Luyện tập",
      href: "/dashboard/student/practice",
      icon: "Brain",
    },
    {
      title: "Luyện Code",
      href: "/dashboard/student/code-practice",
      icon: "FileCode",
    },
    {
      title: "Lịch sử Quiz",
      href: "/dashboard/student/quizzes/completed",
      icon: "ClipboardCheck",
    },
    { title: "Bảng xếp hạng", href: "/dashboard/leaderboard", icon: "Trophy" },
    { title: "Cửa hàng", href: "/dashboard/shop", icon: "ShoppingBag" },
  ],
};

// Hàm lấy navigation dựa trên vai trò
export const getRoleBasedNavSections = (
  userRole: string | null
): NavSectionType[] => {
  switch (userRole) {
    case Role.ADMIN:
      return [adminNavItems];
    case Role.TEACHER:
      return [teacherNavItems];
    case Role.STUDENT:
      return [studentNavItems];
    default:
      // Trả về một danh sách cơ bản nếu không có vai trò
      return [
        {
          items: [
            { title: "Tổng quan", href: "/dashboard", icon: "LayoutDashboard" },
          ],
        },
      ];
  }
};

// Mapping href -> featureKey (dùng cho feature toggle sau này)
const FEATURE_HREF_MAP: Record<string, FeatureKey> = {
  "/dashboard/student/code-practice": "CODE_PRACTICE",
  "/dashboard/leaderboard": "GAMIFICATION",
  "/dashboard/shop": "GAMIFICATION",
  "/dashboard/reports": "ANALYTICS",
};

/**
 * Lọc navigation items dựa trên feature flags
 * Chỉ áp dụng khi feature toggle được enable
 */
export const filterNavByFeatures = (
  sections: NavSectionType[],
  features: FeatureFlags | null
): NavSectionType[] => {
  // Nếu không có features, trả về nguyên bản
  if (!features) return sections;

  return sections.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      const featureKey = FEATURE_HREF_MAP[item.href];
      // Nếu không có mapping, luôn hiển thị
      if (!featureKey) return true;
      // Kiểm tra feature có được bật không
      return features[featureKey] !== false;
    }),
  }));
};
