"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { AdminOnly } from "@/components/features/auth/role-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Skeleton } from "@/components/ui/feedback";
import {
  Edit,
  ArrowLeft,
  BookOpen,
  Calendar,
  Users,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation/breadcrumb";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation/tabs";
import { useTrainingBatch } from "@/lib/hooks/use-training-batches";
import { SemesterAssignmentDashboard } from "@/components/features/admin/semester-assignment";
import { TrainingBatchDetailSkeleton } from "@/components/features/admin/training-batches/TrainingBatchDetailSkeleton";

export default function TrainingBatchDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("details");

  const batchId = parseInt(params.batchId as string);

  const { data: batch, isLoading, isError } = useTrainingBatch(batchId);

  if (isLoading) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập.</div>}>
        <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard/admin/training-batches">
                    Khóa đào tạo
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Chi tiết</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <TrainingBatchDetailSkeleton />
        </div>
      </AdminOnly>
    );
  }

  if (isError || !batch) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập.</div>}>
        <div className="container mx-auto p-6 space-y-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">
              Không tìm thấy khóa đào tạo
            </h2>
            <p className="text-muted-foreground mb-4">
              Khóa đào tạo với ID {batchId} không tồn tại.
            </p>
            <Link href={`/dashboard/admin/training-batches`}>
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại danh sách
              </Button>
            </Link>
          </div>
        </div>
      </AdminOnly>
    );
  }

  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập.</div>}>
      <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/admin/training-batches">
                  Khóa đào tạo
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[150px] sm:max-w-none truncate">
                {batch.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-1 h-auto p-1">
            <TabsTrigger
              value="details"
              className="text-xs sm:text-sm px-2 py-2 sm:py-2.5"
            >
              Chi tiết
            </TabsTrigger>
            <TabsTrigger
              value="semesters"
              className="text-xs sm:text-sm px-2 py-2 sm:py-2.5"
            >
              <span className="hidden sm:inline">Học kỳ & Phân công</span>
              <span className="sm:hidden">Học kỳ</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="details"
            className="mt-4 sm:mt-6 space-y-4 sm:space-y-6"
          >
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg sm:text-2xl break-words">
                      Chi tiết khóa đào tạo: {batch.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {batch.description ||
                        "Thông tin chi tiết về khóa đào tạo"}
                    </CardDescription>
                  </div>
                  <Button asChild size="sm" className="w-full sm:w-auto">
                    <Link
                      href={`/dashboard/admin/training-batches/${batchId}/edit`}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Thống kê tổng quan */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Học kỳ</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {batch.Semesters?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded">
                        <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Phân công
                        </p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {batch.TeacherAssignments?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded">
                        <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lớp học</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {batch.Courses?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thông tin chính */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-semibold text-base sm:text-lg">
                      Thông tin cơ bản
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Tên khóa đào tạo
                        </label>
                        <p className="text-base font-semibold mt-1">
                          {batch.name}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Mã khóa
                        </label>
                        <p className="text-base font-medium mt-1">
                          #{batch.batch_id}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Niên khóa
                        </label>
                        <p className="text-base font-medium mt-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {batch.start_year} - {batch.end_year}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="font-semibold text-base sm:text-lg">
                      Chương trình đào tạo
                    </h3>

                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-background rounded">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-1">
                            Thuộc chương trình
                          </p>
                          <Link
                            href={`/dashboard/admin/programs/${batch.program_id}`}
                            className="text-base font-semibold text-primary hover:underline"
                          >
                            {batch.Program?.name || "N/A"}
                          </Link>
                        </div>
                      </div>
                    </div>

                    {batch.description && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Mô tả chi tiết
                        </label>
                        <p className="text-sm leading-relaxed mt-1 text-muted-foreground">
                          {batch.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Courses List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Danh sách lớp học
                </CardTitle>
                <CardDescription>
                  {batch.Courses?.length || 0} lớp học đã được tạo cho khóa đào
                  tạo này
                </CardDescription>
              </CardHeader>
              <CardContent>
                {batch.Courses && batch.Courses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {batch.Courses.map((course: any) => (
                      <div
                        key={course.course_id}
                        className="p-4 bg-muted/30 hover:bg-muted/50 rounded-lg border hover:border-primary/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-background rounded group-hover:bg-primary/10 transition-colors">
                            <GraduationCap className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                              {course.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              ID: {course.course_id}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex p-4 bg-muted/50 rounded-full mb-3">
                      <GraduationCap className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Chưa có lớp học nào được tạo cho khóa đào tạo này.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="semesters" className="mt-4 sm:mt-6">
            <SemesterAssignmentDashboard batchId={batchId} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminOnly>
  );
}
