"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { AdminOnly } from "@/components/features/auth/role-guard";
import Link from "next/link";
import { PLOForm } from "@/components/features/admin/plos";
import { useProgram } from "@/lib/hooks/use-programs";
import { usePLO } from "@/lib/hooks/use-plos";
import { Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";

interface EditPLOPageProps {
  params: Promise<{
    programId: string;
    ploId: string;
  }>;
}

export default function EditPLOPage({ params }: EditPLOPageProps) {
  const resolvedParams = use(params);
  const programId = parseInt(resolvedParams.programId);
  const ploId = parseInt(resolvedParams.ploId);
  const router = useRouter();

  const { data: program } = useProgram(programId);
  const { data: plo, isLoading } = usePLO(ploId);

  if (isLoading || !plo) {
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
                <Link href={`/dashboard/admin/programs/${programId}?tab=plos`}>
                  {program?.name || `Program #${programId}`}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/dashboard/admin/programs/${programId}/plos/${ploId}`}
                >
                  {plo.name}
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
        <PLOForm
          plo={plo}
          programId={programId}
          onSuccess={() =>
            router.push(`/dashboard/admin/programs/${programId}?tab=plos`)
          }
          onCancel={() =>
            router.push(`/dashboard/admin/programs/${programId}/plos/${ploId}`)
          }
        />
      </div>
    </AdminOnly>
  );
}
