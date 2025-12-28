// frontend/src/components/features/admin/semesters/semester-card.tsx
"use client";

import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/forms";
import { Card, CardContent, CardHeader } from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import {
  Calendar,
  Users,
  BookOpen,
  Edit,
  Trash2,
  MoreHorizontal,
  PlayCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/overlay";
import type { Semester } from "@/lib/services/api/semester.service";
import { cn } from "@/lib/utils";

interface SemesterCardProps {
  semester: Semester;
  isSelected: boolean;
  onSelect: (semester: Semester) => void;
  onEdit: (semester: Semester) => void;
  onDelete: (semester: Semester) => void;
  onActivate: (semesterId: number) => void;
  isActivating: boolean;
}

export function SemesterCard({
  semester,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onActivate,
  isActivating,
}: SemesterCardProps) {
  const semesterId = semester.semester_id || semester.id;

  return (
    <Card
      onClick={() => onSelect(semester)}
      className={cn(
        "cursor-pointer transition-all duration-200",
        isSelected
          ? "border-primary ring-2 ring-primary/20 "
          : "hover:border-primary/50"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{semester.name}</h3>
            <p className="text-sm text-muted-foreground">
              {semester.academic_year}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {semester.is_active && (
              <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!semester.is_active && (
                  <DropdownMenuItem
                    onClick={() => semesterId && onActivate(semesterId)}
                    disabled={isActivating}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Kích hoạt
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onEdit(semester)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(semester)}
                  disabled={semester.is_active}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(semester.start_date), "dd/MM/yyyy")} -{" "}
              {format(new Date(semester.end_date), "dd/MM/yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{semester.assignment_count || 0} phân công</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>{semester.course_count || 0} khóa học</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
