"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  GraduationCap,
} from "lucide-react";

import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { Checkbox } from "@/components/ui/forms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/overlay";
import { PaginationWithInfo } from "@/components/ui/navigation";
import { Skeleton } from "@/components/ui/feedback";
import { Card, CardContent } from "@/components/ui/layout";
import { toast } from "sonner";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast-utils";

import { useAssignmentContext } from "@/lib/contexts/assignment-context";
import { useTeacherCourses } from "@/lib/hooks/use-teaching";
import { useDeleteCourse } from "@/lib/hooks/use-courses";
import type { CourseWithRelations } from "@/lib/types/course";
import { CourseDeleteDialog } from "@/components/features/course/CourseDeleteDialog";
import { CoursesDataTableSkeleton } from "@/components/features/course/CoursesDataTableSkeleton";

interface CourseCardItemProps {
  course: any;
  selectedCourses: number[];
  onSelect: (courseId: number, checked: boolean) => void;
  onUpdate?: () => void;
  onDelete?: (courseId: number) => void;
}

function CourseCardItem({
  course,
  selectedCourses,
  onSelect,
  onUpdate,
  onDelete,
}: CourseCardItemProps) {
  const router = useRouter();
  const { createTeacherUrl } = useAssignmentContext();

  const handleCardClick = () => {
    const url = createTeacherUrl(
      `/dashboard/teaching/courses/${course.course_id}`
    );
    router.push(url);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = createTeacherUrl(
      `/dashboard/teaching/courses/${course.course_id}/edit`
    );
    router.push(url);
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    onDelete?.(course.course_id);
  };

  // Format course name - just return the normal course name
  const formatCourseName = () => {
    return course.name || "Khóa học chưa có tên";
  };

  return (
    <>
      <Card
        className="h-full border-2 border-border hover:border-primary/60 transition-all duration-300 bg-gradient-to-br from-white to-slate-50/50 dark:from-card dark:to-card/80 cursor-pointer"
        onClick={handleCardClick}
      >
        <CardContent className="px-4">
          <div className="flex flex-col h-full px-2">
            {/* Header: Checkbox, Icon và Dropdown menu */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedCourses.includes(course.course_id)}
                  onCheckedChange={(checked) =>
                    onSelect(course.course_id, checked as boolean)
                  }
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  className="flex-shrink-0"
                />
                <div className="flex items-center text-muted-foreground min-w-0 flex-1">
                  <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0 text-blue-500" />
                  <span className="text-xs sm:text-sm line-clamp-1 font-medium">
                    Khóa học
                  </span>
                </div>
              </div>

              {/* Dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Tên khóa học */}
            <div className="flex-1 flex items-start py-2">
              <h3 className="font-semibold text-base sm:text-lg text-foreground hover:text-primary transition-colors line-clamp-3 leading-tight text-left">
                {formatCourseName()}
              </h3>
            </div>

            {/* Thông tin chi tiết */}
            <div className="mt-auto pt-2 border-t border-border/50 space-y-2">
              {/* Mô tả khóa học */}
              {course.description && (
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog - Outside Card to prevent click propagation */}
      <CourseDeleteDialog
        course={isDeleteDialogOpen ? course : null}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}

interface CoursesDataTableProps {
  className?: string;
  courses?: any[];
  programId?: number;
  subjectId?: number;
}

export function CoursesDataTable({
  className,
  courses: propCourses,
  programId,
  subjectId,
}: CoursesDataTableProps) {
  const router = useRouter();
  const { currentAssignmentId, createTeacherUrl } = useAssignmentContext();

  // Use custom hook for courses data if no courses prop provided
  const {
    data: coursesData,
    isLoading,
    error: hookError,
    refetch: refetchCourses,
  } = useTeacherCourses(currentAssignmentId || undefined);

  // Hook for deleting courses
  const deleteCourseMutation = useDeleteCourse();

  // Extract courses from API response or use prop
  const allCourses =
    propCourses ||
    (Array.isArray(coursesData)
      ? coursesData
      : (coursesData as any)?.data?.courses ||
        (coursesData as any)?.courses ||
        []);

  const loading = propCourses ? false : isLoading;
  const error = propCourses ? null : hookError;

  // State management
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);

  // Handle course deletion
  const handleDeleteCourse = (courseId: number) => {
    const course = allCourses.find((c: any) => c.course_id === courseId);
    if (!course) return;

    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  // Dialog state
  const [courseToDelete, setCourseToDelete] =
    useState<CourseWithRelations | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Handle error state
  useEffect(() => {
    if (error) {
      toast.error("Có lỗi xảy ra khi tải danh sách khóa học");
    }
  }, [error]);

  // Filter courses based on search term and filters
  const filteredCourses = useMemo(() => {
    let filtered = allCourses;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (course: any) =>
          course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          course.Subject?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          course.Subject?.code
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          course.Teacher?.full_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a: any, b: any) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name || "";
          bValue = b.name || "";
          break;
        case "course_id":
          aValue = a.course_id || 0;
          bValue = b.course_id || 0;
          break;
        case "teacher_name":
          aValue = a.Teacher?.full_name || "";
          bValue = b.Teacher?.full_name || "";
          break;
        default:
          aValue = a.name || "";
          bValue = b.name || "";
      }

      if (typeof aValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === "ASC" ? comparison : -comparison;
      } else {
        return sortOrder === "ASC" ? aValue - bValue : bValue - aValue;
      }
    });

    return filtered;
  }, [allCourses, searchTerm, sortBy, sortOrder]);

  // Implement frontend pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const courses = filteredCourses.slice(startIndex, endIndex);

  const totalItems = filteredCourses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCourses(courses.map((course: any) => course.course_id));
    } else {
      setSelectedCourses([]);
    }
  };

  const handleSelectCourse = (courseId: number, checked: boolean) => {
    if (checked) {
      setSelectedCourses([...selectedCourses, courseId]);
    } else {
      setSelectedCourses(selectedCourses.filter((id) => id !== courseId));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedCourses.length === 0) return;

    try {
      // Implementation for bulk delete
      toast.success(`Đã xóa ${selectedCourses.length} khóa học`);
      setSelectedCourses([]);
      refetchCourses();
    } catch (error) {
      toast.error("Không thể xóa các khóa học đã chọn");
    }
  };

  const handleDeleteSuccess = () => {
    // Dialog đã đóng rồi (onOpenChange đã được gọi)
    // Chỉ cần đảm bảo courseToDelete được reset
    setCourseToDelete(null);
  };

  return (
    <>
      <div className={`space-y-6 ${className}`}>
        {/* Filters and Search */}
        <div className="flex flex-col space-y-4 mb-6">
          {/* Mobile: Search full width */}
          <div className="sm:hidden relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          {/* Mobile: Add button full width */}
          <Link
            href={createTeacherUrl("/dashboard/teaching/courses/create")}
            className="sm:hidden w-full"
          >
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Thêm khóa học mới
            </Button>
          </Link>

          {/* Desktop: Search and Add Button */}
          <div className="hidden sm:flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm khóa học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Link
                href={createTeacherUrl("/dashboard/teaching/courses/create")}
              >
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm khóa học mới
                </Button>
              </Link>
            </div>
            <div className="flex gap-2">
              {/* Sort By */}
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  Sắp xếp:
                </span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Tên khóa học</SelectItem>
                    <SelectItem value="course_id">ID khóa học</SelectItem>
                    <SelectItem value="teacher_name">Giảng viên</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")
                }
              >
                {sortOrder === "ASC" ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  Hiển thị:
                </span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(parseInt(value))}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder={itemsPerPage.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedCourses.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa ({selectedCourses.length})
                </Button>
              )}
            </div>
          </div>

          {/* Mobile: Filter controls */}
          <div className="sm:hidden flex flex-col gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Tên khóa học</SelectItem>
                <SelectItem value="course_id">ID khóa học</SelectItem>
                <SelectItem value="teacher_name">Giảng viên</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")
                }
                className="flex-shrink-0"
              >
                {sortOrder === "ASC" ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </Button>

              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={itemsPerPage.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedCourses.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa ({selectedCourses.length})
              </Button>
            )}
          </div>

          {/* Select All Checkbox */}
          {courses.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={
                  selectedCourses.length === courses.length &&
                  courses.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Chọn tất cả ({courses.length} khóa học)
              </span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <CoursesDataTableSkeleton itemsPerPage={itemsPerPage} />
        ) : /* Empty State */
        !courses || courses.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Chưa có khóa học nào</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Không tìm thấy khóa học nào phù hợp với bộ lọc"
                : 'Hãy sử dụng nút "Thêm khóa học mới" ở trên để thêm khóa học đầu tiên'}
            </p>
          </div>
        ) : (
          /* Courses Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {courses.map((course: any) => (
              <CourseCardItem
                key={course.course_id}
                course={course}
                selectedCourses={selectedCourses}
                onSelect={handleSelectCourse}
                onUpdate={refetchCourses}
                onDelete={handleDeleteCourse}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalItems > 0 && (
          <PaginationWithInfo
            currentPage={currentPage}
            totalPages={totalPages}
            total={totalItems}
            limit={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Delete Dialog */}
      <CourseDeleteDialog
        course={courseToDelete}
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setCourseToDelete(null);
          }
        }}
      />
    </>
  );
}
