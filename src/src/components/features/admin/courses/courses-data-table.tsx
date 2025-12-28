// frontend/src/components/features/admin/courses/courses-data-table.tsx
"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/display";
import { Input } from "@/components/ui/forms";
import { PaginationWithInfo } from "@/components/ui/navigation";
import { Search, BookOpen, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";

interface Course {
  course_id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  Quizzes?: any[];
  Subject?: {
    subject_id: number;
    name: string;
  };
}

interface CoursesDataTableProps {
  courses: Course[];
  programId: number;
  subjectId: number;
  className?: string;
}

export function CoursesDataTable({
  courses,
  programId,
  subjectId,
  className,
}: CoursesDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter courses based on search term
  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredCourses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayCourses = filteredCourses.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className={className}>
      <div className="mb-4 space-y-4">
        {/* Search and Controls */}
        <div className="flex flex-col space-y-4 mb-6">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                const newValue = parseInt(value);
                if (newValue !== itemsPerPage) {
                  setItemsPerPage(newValue);
                  setCurrentPage(1);
                }
              }}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100 dark:bg-muted/50 hover:bg-slate-100 dark:hover:bg-muted/50">
              <TableHead>Tên khóa học</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Số bài kiểm tra</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "Không tìm thấy khóa học nào phù hợp."
                        : "Chưa có khóa học nào."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              displayCourses.map((course) => (
                <TableRow key={course.course_id}>
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {course.description || "Không có mô tả"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{course.Quizzes?.length || 0}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <PaginationWithInfo
          currentPage={currentPage}
          totalPages={totalPages}
          total={totalItems}
          limit={itemsPerPage}
          onPageChange={setCurrentPage}
          className="mt-4"
        />
      )}
    </div>
  );
}
