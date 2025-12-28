"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminOnly } from "@/components/features/auth/role-guard";
import { ProgramSubjectMetadataForm } from "@/components/features/admin/subjects/program-subject-metadata-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import { useProgram } from "@/lib/hooks/use-programs";
import { useSubject } from "@/lib/hooks/use-subjects";

interface EditProgramSubjectPageProps {
  params: Promise<{ programId: string; subjectId: string }>;
}

export default function EditProgramSubjectPage({
  params,
}: EditProgramSubjectPageProps) {
  const resolvedParams = use(params);
  const programId = parseInt(resolvedParams.programId);
  const subjectId = parseInt(resolvedParams.subjectId);
  const router = useRouter();

  const { data: program } = useProgram(programId);
  const { data: subject } = useSubject(subjectId);

  const handleSuccess = () => {
    router.push(`/dashboard/admin/programs/${programId}?tab=subjects`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/admin/programs/${programId}?tab=subjects`);
  };

  return (
    <AdminOnly>
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
                  {program?.name}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chỉnh sửa: {subject?.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <ProgramSubjectMetadataForm
          programId={programId}
          subjectId={subjectId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </AdminOnly>
  );
}
