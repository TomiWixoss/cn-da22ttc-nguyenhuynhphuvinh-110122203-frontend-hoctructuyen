"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/overlay";
import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { ScrollArea } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/feedback";
import {
  BookOpen,
  ChevronsUpDown,
  Check,
  Search,
  Calendar,
} from "lucide-react";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";
import { SemesterService, Semester } from "@/lib/services/api/semester.service";
import { Assignment } from "@/lib/types/assignment";
import { cn } from "@/lib/utils";

interface TeacherAssignmentSelectorProps {
  className?: string;
}

export function TeacherAssignmentSelector({
  className = "",
}: TeacherAssignmentSelectorProps) {
  const {
    assignments,
    currentAssignmentId,
    setCurrentAssignmentId,
    isLoading,
  } = useAssignmentContext();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(
    null
  );
  const [semesterLoading, setSemesterLoading] = useState(true);

  // Fetch danh sách học kỳ khi component mount
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        setSemesterLoading(true);
        const [allSemestersResponse, activeSemesterResponse] =
          await Promise.all([
            SemesterService.getAllSemesters(),
            SemesterService.getActiveSemester(),
          ]);

        if (allSemestersResponse.success) {
          setSemesters(allSemestersResponse.data);
        }

        // Set học kỳ hiện tại đang hoạt động làm mặc định
        if (activeSemesterResponse.success && activeSemesterResponse.data) {
          setSelectedSemesterId(
            activeSemesterResponse.data.semester_id.toString()
          );
        } else if (
          allSemestersResponse.success &&
          allSemestersResponse.data.length > 0
        ) {
          // Nếu không có học kỳ active, chọn học kỳ đầu tiên
          setSelectedSemesterId(
            allSemestersResponse.data[0].semester_id.toString()
          );
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách học kỳ:", error);
      } finally {
        setSemesterLoading(false);
      }
    };

    fetchSemesters();
  }, []);

  const handleAssignmentChange = (assignmentId: string) => {
    setCurrentAssignmentId(assignmentId);
    setIsOpen(false);
  };

  const handleSemesterChange = (semesterId: string) => {
    setSelectedSemesterId(semesterId);
    // Reset search khi thay đổi học kỳ
    setSearch("");
  };

  const selectedAssignment = useMemo(
    () =>
      assignments.find(
        (a) => a.assignment_id.toString() === currentAssignmentId
      ),
    [assignments, currentAssignmentId]
  );

  const selectedSemester = useMemo(
    () =>
      semesters.find((s) => s.semester_id.toString() === selectedSemesterId),
    [semesters, selectedSemesterId]
  );

  // Lọc assignments theo học kỳ được chọn
  const filteredAssignmentsBySemester = useMemo(
    () =>
      assignments.filter(
        (a) => a.Semester?.semester_id?.toString() === selectedSemesterId
      ),
    [assignments, selectedSemesterId]
  );

  // Lọc assignments theo search trong học kỳ đã chọn
  const filteredAssignments = useMemo(
    () =>
      filteredAssignmentsBySemester.filter((a) =>
        a.Subject?.name.toLowerCase().includes(search.toLowerCase())
      ),
    [filteredAssignmentsBySemester, search]
  );

  // Tự động chọn assignment đầu tiên khi thay đổi học kỳ hoặc khi assignments được load
  useEffect(() => {
    if (selectedSemesterId && filteredAssignmentsBySemester.length > 0) {
      // Kiểm tra xem assignment hiện tại có thuộc học kỳ được chọn không
      const currentAssignmentInSemester = filteredAssignmentsBySemester.find(
        (a) => a.assignment_id.toString() === currentAssignmentId
      );

      // Nếu không có assignment hiện tại trong học kỳ này, chọn assignment đầu tiên
      if (!currentAssignmentInSemester) {
        setCurrentAssignmentId(
          filteredAssignmentsBySemester[0].assignment_id.toString()
        );
      }
    }
  }, [
    selectedSemesterId,
    filteredAssignmentsBySemester,
    currentAssignmentId,
    setCurrentAssignmentId,
  ]);

  if (isLoading || semesterLoading) {
    return (
      <div
        className={cn(
          "p-3 border-b border-slate-200 dark:border-slate-700",
          className
        )}
      >
        <div className="animate-pulse">
          {/* Mobile: skeleton đầy đủ */}
          <div className="md:hidden h-16 bg-gray-200 dark:bg-gray-700/50 rounded-lg"></div>
          {/* Desktop thu gọn: skeleton icon */}
          <div className="hidden md:block lg:hidden h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          {/* Desktop mở rộng: skeleton đầy đủ */}
          <div className="hidden lg:block h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div
        className={cn(
          "p-3 border-b border-slate-200 dark:border-slate-700",
          className
        )}
      >
        {/* Mobile: hiển thị đầy đủ */}
        <div className="md:hidden flex items-center justify-center gap-2 py-3">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Chưa có phân công
          </span>
        </div>
        {/* Desktop thu gọn: chỉ icon */}
        <div className="hidden md:flex lg:hidden justify-center py-2">
          <div className="p-2 bg-muted rounded-md">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        {/* Desktop mở rộng: text đầy đủ */}
        <div className="hidden lg:flex items-center justify-center gap-2 py-3">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Chưa có phân công
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-3 border-b border-slate-200 dark:border-slate-700",
        className
      )}
    >
      {/* Dropdown chọn môn học */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-auto justify-between px-3 py-2 md:px-2 md:py-2 lg:px-4 lg:py-3 text-left bg-background hover:bg-background hover:border-primary hover:text-foreground hover:scale-100 border"
          >
            {/* Mobile: hiển thị đầy đủ */}
            <div className="md:hidden flex items-center gap-3 min-w-0 w-full">
              <div className="flex-shrink-0 p-2 bg-primary/10 rounded-md">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                {selectedAssignment ? (
                  <div>
                    <p className="font-semibold text-sm truncate text-foreground">
                      {selectedAssignment.Subject?.name || "Chưa có tên"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedSemester?.name} -{" "}
                      {filteredAssignmentsBySemester.length} môn học
                    </p>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Chọn môn học...</span>
                )}
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
            </div>

            {/* Desktop thu gọn: chỉ icon */}
            <div className="hidden md:flex lg:hidden items-center justify-center w-full">
              <div className="p-2 bg-primary/10 rounded-md">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
            </div>

            {/* Desktop mở rộng: hiển thị đầy đủ */}
            <div className="hidden lg:flex items-center gap-4 min-w-0 w-full">
              <div className="flex-shrink-0 p-2 bg-primary/10 rounded-md">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                {selectedAssignment ? (
                  <div>
                    <p className="font-semibold text-sm truncate text-foreground">
                      {selectedAssignment.Subject?.name || "Chưa có tên"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedSemester?.name} -{" "}
                      {filteredAssignmentsBySemester.length} môn học
                    </p>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Chọn môn học...</span>
                )}
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[360px] p-0"
          sideOffset={5}
          align="start"
        >
          <div className="p-3 space-y-3">
            <div>
              <DropdownMenuLabel className="px-0 pb-2">
                Chọn học kỳ
              </DropdownMenuLabel>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between hover:bg-background hover:border-primary hover:text-foreground hover:scale-100"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        {selectedSemester
                          ? selectedSemester.name
                          : "Chọn học kỳ"}
                      </span>
                    </div>
                    <ChevronsUpDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[336px]" align="start">
                  <ScrollArea className="h-[200px]">
                    {semesters.map((semester) => {
                      const isSelected =
                        selectedSemesterId === semester.semester_id.toString();
                      const assignmentCount = assignments.filter(
                        (a) =>
                          a.Semester?.semester_id?.toString() ===
                          semester.semester_id.toString()
                      ).length;

                      return (
                        <DropdownMenuItem
                          key={semester.semester_id}
                          onSelect={() =>
                            handleSemesterChange(
                              semester.semester_id.toString()
                            )
                          }
                          className={cn(
                            "cursor-pointer py-2 hover:bg-accent/10 hover:text-foreground focus:bg-accent/10 focus:text-foreground",
                            isSelected && "bg-accent/20"
                          )}
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Calendar
                                className={cn(
                                  "h-4 w-4 flex-shrink-0",
                                  isSelected
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                )}
                              />
                              <div className="min-w-0">
                                <p
                                  className={cn(
                                    "text-sm truncate",
                                    isSelected ? "font-medium" : "font-normal"
                                  )}
                                >
                                  {semester.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {semester.academic_year} ({assignmentCount}{" "}
                                  môn)
                                  {semester.is_active && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-medium">
                                      Đang hoạt động
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 flex-shrink-0" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <DropdownMenuSeparator className="my-0" />

            <div>
              <DropdownMenuLabel className="px-0 pb-2">
                Chọn môn học
              </DropdownMenuLabel>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm môn học..."
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearch(e.target.value)
                  }
                  className="pl-9 h-9"
                />
              </div>
            </div>
          </div>

          <ScrollArea className="h-[280px] border-t">
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => {
                const isSelected =
                  currentAssignmentId === assignment.assignment_id.toString();
                return (
                  <DropdownMenuItem
                    key={assignment.assignment_id}
                    onSelect={() =>
                      handleAssignmentChange(
                        assignment.assignment_id.toString()
                      )
                    }
                    className={cn(
                      "cursor-pointer py-3 mx-2 my-1 rounded-md",
                      isSelected && "bg-primary/10 text-primary"
                    )}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <BookOpen className="h-4 w-4 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {assignment.Subject?.name || "Không có tên"}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                {filteredAssignmentsBySemester.length === 0
                  ? `Không có môn học nào trong ${
                      selectedSemester?.name || "học kỳ này"
                    }`
                  : "Không tìm thấy môn học"}
              </div>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default TeacherAssignmentSelector;
