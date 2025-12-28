"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminOnly } from "@/components/features/auth/role-guard";
import { Card, CardContent } from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Badge } from "@/components/ui/feedback";
import { Loader2, ListOrdered, GraduationCap, Edit } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import { useChapter, useChapterSections } from "@/lib/hooks/use-chapters";
import { useProgram } from "@/lib/hooks/use-programs";
import { useSubject } from "@/lib/hooks/use-subjects";
import { SectionList } from "@/components/features/admin/chapters/sections/SectionList";

interface ChapterDetailPageProps {
  params: Promise<{
    programId: string;
    subjectId: string;
    chapterId: string;
  }>;
}

export default function ChapterDetailPage({ params }: ChapterDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  const programId = parseInt(resolvedParams.programId);
  const subjectId = parseInt(resolvedParams.subjectId);
  const chapterId = parseInt(resolvedParams.chapterId);

  const { data: program } = useProgram(programId);
  const { data: subject } = useSubject(subjectId);
  const { data: chapter, isLoading } = useChapter(chapterId);
  const { data: sections = [] } = useChapterSections(chapterId);

  if (isLoading || !chapter) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập.</div>}>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Breadcrumb */}
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
                  {program?.name || "..."}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/dashboard/admin/programs/${programId}/subjects/${subjectId}?tab=chapters`}
                >
                  {subject?.name || "..."}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{chapter.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Main Content Card */}
        <Card>
          <CardContent>
            <div className="grid gap-4 lg:gap-6 lg:grid-cols-[1fr_280px]">
              {/* Left Column - Main Content */}
              <div className="space-y-5">
                {/* Description Section */}
                {chapter.description && (
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold">Mô tả chương</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                      {chapter.description}
                    </p>
                  </div>
                )}

                {/* Divider */}
                {chapter.description && <div className="border-t" />}

                {/* Section Management */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-semibold flex items-center gap-2">
                      <ListOrdered className="h-4 w-4" />
                      Nội dung chương
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Quản lý các mục (sections) trong chương học
                    </p>
                  </div>
                  <SectionList chapterId={chapterId} />
                </div>
              </div>

              {/* Right Column - Metadata & Actions */}
              <div className="space-y-4 lg:border-l lg:pl-4">
                {/* Edit Button */}
                <Button
                  onClick={() =>
                    router.push(
                      `/dashboard/admin/programs/${programId}/subjects/${subjectId}/chapters/${chapterId}/edit`
                    )
                  }
                  size="sm"
                  className="w-full"
                >
                  <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                </Button>

                <div className="border-t" />

                {/* Quick Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Thông tin</h3>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Môn học
                      </label>
                      <Link
                        href={`/dashboard/admin/programs/${programId}/subjects/${subjectId}`}
                        className="block text-sm font-medium hover:text-primary transition-colors"
                      >
                        {subject?.name || "Đang tải..."}
                      </Link>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Chương trình
                      </label>
                      <Link
                        href={`/dashboard/admin/programs/${programId}`}
                        className="block text-sm font-medium hover:text-primary transition-colors"
                      >
                        {program?.name || "Đang tải..."}
                      </Link>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Số sections
                      </label>
                      <p className="text-sm font-medium">{sections.length}</p>
                    </div>
                  </div>
                </div>

                {/* Learning Outcomes */}
                {chapter.LOs && chapter.LOs.length > 0 && (
                  <>
                    <div className="border-t" />
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Chuẩn đầu ra
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {chapter.LOs.length} chuẩn đầu ra
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {chapter.LOs.map((lo: any) => (
                          <Badge
                            key={lo.lo_id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {lo.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  );
}
