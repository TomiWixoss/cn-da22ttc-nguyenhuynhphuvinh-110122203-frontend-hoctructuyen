"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Badge, Skeleton } from "@/components/ui/feedback";
import {
  Edit,
  Trash2,
  Link as LinkIcon,
  Unlink,
  FileText,
  AlertTriangle,
  CheckCircle,
  Users,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";

import type { GradeColumnWithRelations } from "@/lib/types/course-grade";

interface GradeColumnListProps {
  columns: GradeColumnWithRelations[];
  loading: boolean;
  isLoadingQuizzes?: boolean;
  courseId?: number;
  onEdit: (column: GradeColumnWithRelations) => void;
  onDelete: (column: GradeColumnWithRelations) => void;
  onAssignQuizzes: (column: GradeColumnWithRelations) => void;
  onUnassignQuizzes: (column: GradeColumnWithRelations) => void;
}

export function GradeColumnList({
  columns,
  loading,
  isLoadingQuizzes = false,
  courseId,
  onEdit,
  onDelete,
  onAssignQuizzes,
  onUnassignQuizzes,
}: GradeColumnListProps) {
  const { createTeacherUrl } = useAssignmentContext();
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Chưa có cột điểm nào</h3>
          <p className="text-muted-foreground mb-4">
            Bắt đầu bằng cách tạo cột điểm đầu tiên cho khóa học này.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate total weight for validation
  const totalWeight = columns.reduce(
    (sum, col) => sum + (Number(col.weight_percentage) || 0),
    0
  );
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;

  return (
    <div className="space-y-3">
      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-sm font-medium">
                  Tên cột
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium w-24">
                  Trọng số
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium">
                  Mô tả
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium w-28">
                  Quiz
                </th>
                <th className="text-right py-2 px-3 text-sm font-medium w-80">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-card">
              {columns.map((column) => {
                const quizCount = column.Quizzes?.length || 0;

                return (
                  <tr
                    key={column.column_id}
                    className="border-b last:border-0 hover:bg-muted/20"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {column.column_name}
                        </span>
                        {!column.is_active && (
                          <Badge variant="secondary" className="text-xs h-5">
                            Tắt
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-sm">
                        {(Number(column.weight_percentage) || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-sm text-muted-foreground line-clamp-2">
                        {column.description || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{quizCount}</span>
                        {quizCount === 0 && (
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onAssignQuizzes(column)}
                          disabled={isLoadingQuizzes}
                          className="h-8 px-2 text-xs"
                        >
                          <LinkIcon className="h-3 w-3 mr-1" />
                          Gán
                        </Button>
                        {quizCount > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onUnassignQuizzes(column)}
                            disabled={isLoadingQuizzes}
                            className="h-8 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <Unlink className="h-3 w-3 mr-1" />
                            Gỡ
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(column)}
                          className="h-8 px-2 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(column)}
                          className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {columns.map((column) => {
          const quizCount = column.Quizzes?.length || 0;

          return (
            <div
              key={column.column_id}
              className="border rounded-lg p-3 bg-card"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {column.column_name}
                    </span>
                    {!column.is_active && (
                      <Badge variant="secondary" className="text-xs h-5">
                        Tắt
                      </Badge>
                    )}
                  </div>
                  {column.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {column.description}
                    </p>
                  )}
                </div>
                <span className="font-mono text-sm font-medium ml-2">
                  {(Number(column.weight_percentage) || 0).toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  Quiz:{" "}
                  <span className="font-medium text-foreground">
                    {quizCount}
                  </span>
                  {quizCount === 0 && (
                    <AlertTriangle className="inline h-3 w-3 text-amber-500 ml-1" />
                  )}
                </span>

                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onAssignQuizzes(column)}
                    disabled={isLoadingQuizzes}
                    className="h-7 px-2 text-xs"
                  >
                    <LinkIcon className="h-3 w-3" />
                  </Button>
                  {quizCount > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onUnassignQuizzes(column)}
                      disabled={isLoadingQuizzes}
                      className="h-7 px-2 text-xs text-orange-600"
                    >
                      <Unlink className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(column)}
                    className="h-7 px-2 text-xs"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(column)}
                    className="h-7 px-2 text-xs text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
