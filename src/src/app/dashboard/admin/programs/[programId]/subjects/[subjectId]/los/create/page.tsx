// frontend/src/app/dashboard/admin/los/create/page.tsx
"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // THÊM IMPORT
import { AdminOnly } from "@/components/features/auth/role-guard"; // THÊM IMPORT
import { LOForm } from "@/components/features/admin/los";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation"; // THÊM IMPORT

import { useProgram } from "@/lib/hooks/use-programs";
import { useSubject } from "@/lib/hooks/use-subjects";

interface CreateLOPageProps {
  params: Promise<{
    programId: string;
    subjectId: string;
  }>;
}

export default function CreateLOPage({ params }: CreateLOPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { programId, subjectId } = resolvedParams;

  const { data: program } = useProgram(parseInt(programId));
  const { data: subject } = useSubject(parseInt(subjectId));
  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        {/* THÊM BREADCRUMB */}
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
                  href={`/dashboard/admin/programs/${programId}/subjects/${subjectId}?tab=los`}
                >
                  {subject?.name || `Subject #${subjectId}`}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Tạo LO mới</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <LOForm
          mode="create"
          subjectId={parseInt(subjectId)}
          programId={parseInt(programId)}
          onSuccess={() =>
            router.push(
              `/dashboard/admin/programs/${programId}/subjects/${subjectId}?tab=los`
            )
          }
          onCancel={() =>
            router.push(
              `/dashboard/admin/programs/${programId}/subjects/${subjectId}?tab=los`
            )
          }
        />
      </div>
    </AdminOnly>
  );
}
