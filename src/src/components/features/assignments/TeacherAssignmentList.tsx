"use client";

import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/forms/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/display";
import { Skeleton } from "@/components/ui/feedback";
import { BookOpen, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { AssignmentService } from "@/lib/services/api/assignment.service";
import { SemesterService } from "@/lib/services/api/semester.service";
import { Assignment, AssignmentResponse } from "@/lib/types/assignment";
import { toast } from "sonner";

export default function TeacherAssignmentList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSemester, setActiveSemester] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuthStatus();

  useEffect(() => {
    fetchAssignments();
    fetchActiveSemester();
  }, []);

  const fetchActiveSemester = async () => {
    try {
      const data = await SemesterService.getActiveSemester();
      if (data.success) {
        setActiveSemester(data.data);
      }
    } catch (error) {
      console.error("💥 Lỗi khi lấy học kỳ hiện tại:", error);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await AssignmentService.getMyAssignments();
      if (data.success) {
        // data.data có cấu trúc {teacher_id, assignments}
        const assignmentsArray = (data.data as any)?.assignments || data.data;
        setAssignments(Array.isArray(assignmentsArray) ? assignmentsArray : []);
      } else {
        console.error("❌ API returned success: false");
        toast.error("Không thể tải danh sách phân công");
      }
    } catch (error) {
      console.error("💥 Lỗi khi tải phân công:", error);
      toast.error("Lỗi kết nối khi tải danh sách phân công");
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = useMemo(() => {
    if (!searchTerm) return assignments;
    const lowercasedFilter = searchTerm.toLowerCase();
    return assignments.filter(
      (assignment) =>
        assignment.Subject?.name.toLowerCase().includes(lowercasedFilter) ||
        assignment.Semester?.name.toLowerCase().includes(lowercasedFilter)
    );
  }, [assignments, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Search skeleton */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <div className="h-10 w-full bg-muted dark:bg-muted/50 animate-pulse rounded-lg" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="border rounded-lg overflow-hidden dark:border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5 min-w-[250px]">Môn học</TableHead>
                  <TableHead className="w-1/5 min-w-[150px]">Học kỳ</TableHead>
                  <TableHead className="w-1/5 min-w-[120px]">
                    Hoạt động
                  </TableHead>
                  <TableHead className="w-1/5 min-w-[150px]">Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 bg-muted dark:bg-muted/50 animate-pulse rounded-md" />
                        <div className="flex-1 space-y-2">
                          <div className="h-5 w-3/4 bg-muted dark:bg-muted/50 animate-pulse rounded" />
                          <div className="h-4 w-full bg-muted dark:bg-muted/50 animate-pulse rounded" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="h-5 w-24 bg-muted dark:bg-muted/50 animate-pulse rounded" />
                        <div className="h-4 w-20 bg-muted dark:bg-muted/50 animate-pulse rounded" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-28 bg-muted dark:bg-muted/50 animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-32 bg-muted dark:bg-muted/50 animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm môn học, học kỳ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Assignment Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100 dark:bg-muted/50 hover:bg-slate-100 dark:hover:bg-muted/50">
                <TableHead className="w-2/5 min-w-[250px]">Môn học</TableHead>
                <TableHead className="w-1/5 min-w-[150px]">Học kỳ</TableHead>
                <TableHead className="w-1/5 min-w-[120px]">Hoạt động</TableHead>
                <TableHead className="w-1/5 min-w-[150px]">Ghi chú</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredAssignments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {searchTerm
                      ? "Không tìm thấy phân công nào."
                      : "Chưa có phân công nào."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.assignment_id}>
                    <TableCell className="max-w-md">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-md flex-shrink-0">
                          <BookOpen className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground mb-1">
                            {assignment.Subject?.name}
                          </p>
                          {assignment.Subject?.description && (
                            <p
                              className="text-sm text-muted-foreground line-clamp-2"
                              title={assignment.Subject.description}
                            >
                              {assignment.Subject.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div>
                        <p className="font-semibold text-foreground">
                          {assignment.Semester?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Năm học {assignment.Semester?.academic_year}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {/* Hiển thị trạng thái hoạt động dựa trên semester hiện tại */}
                      {activeSemester &&
                      assignment.Semester?.semester_id ===
                        activeSemester.semester_id ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700 font-medium">
                            Đang hoạt động
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            Không hoạt động
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {assignment.note ? (
                        <span
                          className="text-sm line-clamp-2 block"
                          title={assignment.note}
                        >
                          {assignment.note}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic text-sm">
                          Không có ghi chú
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
