"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminOnly } from "@/components/features/auth/role-guard";
import { ProgramSubjectForm } from "@/components/features/admin/subjects/program-subject-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import { useProgram } from "@/lib/hooks/use-programs";

interface CreateProgramSubjectPageProps {
  params: Promise<{ programId: string }>;
}

export default function CreateProgramSubjectPage({
  params,
}: CreateProgramSubjectPageProps) {
  const resolvedParams = use(params);
  const programId = parseInt(resolvedParams.programId);
  const router = useRouter();
  const { data: program } = useProgram(programId);

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
              <BreadcrumbPage>Tạo Môn học mới</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <ProgramSubjectForm
          programId={programId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </AdminOnly>
  );
}
