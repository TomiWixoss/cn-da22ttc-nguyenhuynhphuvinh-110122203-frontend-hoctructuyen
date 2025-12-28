// frontend/src/app/dashboard/admin/chapters/create/page.tsx
"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminOnly } from "@/components/features/auth/role-guard";
import { ChapterForm } from "@/components/features/admin/chapters/ChapterForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";

import { useProgram } from "@/lib/hooks/use-programs";
import { useSubject } from "@/lib/hooks/use-subjects";

interface CreateChapterPageProps {
  params: Promise<{
    programId: string;
    subjectId: string;
  }>;
}

export default function CreateChapterPage({ params }: CreateChapterPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { programId, subjectId } = resolvedParams;

  const { data: program } = useProgram(parseInt(programId));
  const { data: subject } = useSubject(parseInt(subjectId));

  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập.</div>}>
      <div className="container mx-auto p-6 space-y-6">
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
              <BreadcrumbPage>Tạo chương mới</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-6">
          <Card>
            <CardContent>
              <ChapterForm
                mode="create"
                subjectId={parseInt(subjectId)}
                onSuccess={() =>
                  router.push(
                    `/dashboard/admin/programs/${programId}/subjects/${subjectId}?tab=chapters`
                  )
                }
                onCancel={() =>
                  router.push(
                    `/dashboard/admin/programs/${programId}/subjects/${subjectId}?tab=chapters`
                  )
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminOnly>
  );
}
