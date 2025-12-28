"use client";

import React, { use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AdminOnly } from "@/components/features/auth/role-guard";
import { SubjectForm } from "@/components/features/admin/subjects/subject-form";
import { CoursesDataTable } from "@/components/features/admin/courses/courses-data-table";
import { LOsDataTable } from "@/components/features/admin/los/los-data-table";
import { ChaptersDataTable } from "@/components/features/admin/chapters";
// THÊM MỚI: Import component ma trận
import { LOChapterAssociationMatrix } from "@/components/features/admin/relationships";
import { LOPLOAssociationMatrix } from "@/components/features/admin/relationships/LOPLOAssociationMatrix";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import { useSubject } from "@/lib/hooks/use-subjects";
import { SubjectDetailSkeleton } from "@/components/features/admin/subjects/SubjectDetailSkeleton";
import { useProgram } from "@/lib/hooks/use-programs";
import { Button } from "@/components/ui/forms";
import { Edit, BookOpen, Target, List, Link2, Loader2 } from "lucide-react"; // THÊM ICON MỚI
import { Badge } from "@/components/ui/feedback";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation";
import { useLOs } from "@/lib/hooks/use-los";

interface SubjectDetailPageProps {
  params: Promise<{
    programId: string;
    subjectId: string;
  }>;
}

export default function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const programId = parseInt(resolvedParams.programId);
  const subjectId = parseInt(resolvedParams.subjectId);
  const isEdit = searchParams.get("edit") === "true";
  // THAY ĐỔI: Tab mặc định là thông tin chi tiết
  const activeTab = searchParams.get("tab") || "info";

  const { data: subject, isLoading } = useSubject(subjectId);
  const { data: program } = useProgram(programId);
  const { data: losData, isLoading: losLoading } = useLOs({
    subject_id: subjectId,
    limit: 1000,
  });
  const los = losData?.data?.los || [];

  if (isLoading) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập.</div>}>
        <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard/admin/programs">Chương trình ĐT</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={`/dashboard/admin/programs/${programId}?tab=subjects`}
                  >
                    {program?.name || `Program #${programId}`}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Chi tiết môn học</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <SubjectDetailSkeleton />
        </div>
      </AdminOnly>
    );
  }

  if (isEdit) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập.</div>}>
        <div className="container mx-auto p-6 space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard/admin/programs">Chương trình ĐT</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={`/dashboard/admin/programs/${programId}?tab=subjects`}
                  >
                    {program?.name || `Program #${programId}`}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={`/dashboard/admin/programs/${programId}/subjects/${subjectId}`}
                  >
                    {subject?.name || `Subject #${subjectId}`}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Chỉnh sửa</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          {subject && (
            <SubjectForm
              mode="edit"
              subjectId={subjectId}
              programId={programId}
              initialData={subject}
              onSuccess={() =>
                router.push(
                  `/dashboard/admin/programs/${programId}?tab=subjects`
                )
              }
              onCancel={() =>
                router.push(
                  `/dashboard/admin/programs/${programId}/subjects/${subjectId}`
                )
              }
            />
          )}
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
                <Link href="/dashboard/admin/programs">Chương trình ĐT</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/dashboard/admin/programs/${programId}?tab=subjects`}
                >
                  {program?.name || `Program #${programId}`}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[150px] sm:max-w-none truncate">
                {subject?.name || "Chi tiết môn học"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>{" "}
        {subject && (
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              const url = new URL(window.location.href);
              url.searchParams.set("tab", value);
              router.push(url.pathname + url.search);
            }}
            className="space-y-6"
          >
            {/* THAY ĐỔI: Thêm tab ma trận liên kết */}
            <TabsList className="grid w-full grid-cols-5 gap-1 h-auto p-1">
              <TabsTrigger
                value="info"
                className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-2 py-2 sm:py-2.5"
              >
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">Thông tin</span>
                <span className="sm:hidden">TT</span>
              </TabsTrigger>
              <TabsTrigger
                value="los"
                className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-2 py-2 sm:py-2.5"
              >
                <Target className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">CĐR</span>
                <span className="sm:hidden">LO</span>
              </TabsTrigger>
              <TabsTrigger
                value="chapters"
                className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-2 py-2 sm:py-2.5"
              >
                <List className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">Chương</span>
                <span className="sm:hidden">CH</span>
              </TabsTrigger>
              <TabsTrigger
                value="associations"
                className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-2 py-2 sm:py-2.5"
              >
                <Link2 className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">Ma trận</span>
                <span className="sm:hidden">MT</span>
              </TabsTrigger>
              <TabsTrigger
                value="courses"
                className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-2 py-2 sm:py-2.5"
              >
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">Khóa học</span>
                <span className="sm:hidden">KH</span>
              </TabsTrigger>
            </TabsList>

            {/* THÊM MỚI: Nội dung tab ma trận */}
            <TabsContent
              value="associations"
              className="space-y-6 sm:space-y-8"
            >
              <LOChapterAssociationMatrix subjectId={subjectId} />
              <LOPLOAssociationMatrix
                subjectId={subjectId}
                programId={programId}
              />
            </TabsContent>

            <TabsContent value="info" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg sm:text-2xl font-bold break-words">
                        {subject.name}
                      </CardTitle>
                      <CardDescription className="mt-1 sm:mt-2">
                        Mã học phần: #{subject.subject_id}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() =>
                        router.push(
                          `/dashboard/admin/programs/${programId}/subjects/${subjectId}?edit=true`
                        )
                      }
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 pt-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">
                      Mô tả học phần
                    </h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {subject.description ||
                        "Không có mô tả cho học phần này."}
                    </p>
                  </div>
                  <div className="pt-3 sm:pt-4 border-t border-border/50">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                      Sau khi hoàn thành học phần này, sinh viên có thể:
                    </h3>
                    {losLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Đang tải chuẩn đầu ra...</span>
                      </div>
                    ) : los.length > 0 ? (
                      <ul className="space-y-3 list-none pl-2">
                        {los.map((lo: any) => (
                          <li
                            key={lo.lo_id}
                            className="text-muted-foreground flex items-start"
                          >
                            <span className="mr-2 mt-1">-</span>
                            <div>
                              <strong className="font-semibold text-foreground">
                                {lo.name}:
                              </strong>
                              <span className="ml-1">{lo.description}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground pl-4 italic">
                        Chưa có chuẩn đầu ra nào được định nghĩa cho môn học
                        này.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="los" className="space-y-4 sm:space-y-6">
              <LOsDataTable
                className="mt-0"
                subjectId={subjectId}
                programId={programId}
              />
            </TabsContent>

            <TabsContent value="chapters" className="space-y-4 sm:space-y-6">
              <ChaptersDataTable
                className="mt-0"
                subjectId={subjectId}
                programId={programId}
              />
            </TabsContent>

            <TabsContent value="courses" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Khóa học liên quan
                    {subject.Courses && subject.Courses.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {subject.Courses.length}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Danh sách các khóa học được tạo từ môn học này
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {subject.Courses && subject.Courses.length > 0 ? (
                    <CoursesDataTable
                      courses={subject.Courses}
                      programId={programId}
                      subjectId={subjectId}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Chưa có khóa học nào
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Chưa có khóa học nào được tạo từ môn học này.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminOnly>
  );
}
