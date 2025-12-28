"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { AdminOnly } from "@/components/features/auth/role-guard";
import Link from "next/link";
import { ChapterForm } from "@/components/features/admin/chapters/ChapterForm";
import { useProgram } from "@/lib/hooks/use-programs";
import { useSubject } from "@/lib/hooks/use-subjects";
import { useChapter } from "@/lib/hooks/use-chapters";
import { Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import { Card, CardContent } from "@/components/ui/layout";

interface EditChapterPageProps {
  params: Promise<{
    programId: string;
    subjectId: string;
    chapterId: string;
  }>;
}

export default function EditChapterPage({ params }: EditChapterPageProps) {
  const resolvedParams = use(params);
  const programId = parseInt(resolvedParams.programId);
  const subjectId = parseInt(resolvedParams.subjectId);
  const chapterId = parseInt(resolvedParams.chapterId);
  const router = useRouter();

  const { data: program } = useProgram(programId);
  const { data: subject } = useSubject(subjectId);
  const { data: chapter, isLoading } = useChapter(chapterId);

  if (isLoading || !chapter) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập.</div>}>
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminOnly>
    );
  }

  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-4">
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
                  href={`/dashboard/admin/programs/${programId}/subjects/${subjectId}?tab=chapters`}
                >
                  {subject?.name || `Subject #${subjectId}`}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/dashboard/admin/programs/${programId}/subjects/${subjectId}/chapters/${chapterId}`}
                >
                  {chapter.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chỉnh sửa</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Form */}
        <Card>
          <CardContent>
            <ChapterForm
              mode="edit"
              initialData={chapter}
              subjectId={subjectId}
              onSuccess={() =>
                router.push(
                  `/dashboard/admin/programs/${programId}/subjects/${subjectId}?tab=chapters`
                )
              }
              onCancel={() =>
                router.push(
                  `/dashboard/admin/programs/${programId}/subjects/${subjectId}/chapters/${chapterId}`
                )
              }
            />
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  );
}
