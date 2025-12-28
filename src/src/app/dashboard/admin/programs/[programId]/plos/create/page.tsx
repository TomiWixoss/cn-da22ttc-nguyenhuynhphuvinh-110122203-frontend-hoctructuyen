"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { AdminOnly } from "@/components/features/auth/role-guard";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PLOForm } from "@/components/features/admin/plos";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";

import { useProgram } from "@/lib/hooks/use-programs";

interface CreatePLOPageProps {
  params: Promise<{
    programId: string;
  }>;
}

export default function CreatePLOPage({ params }: CreatePLOPageProps) {
  const resolvedParams = use(params);
  const programId = resolvedParams.programId;
  const router = useRouter();

  const { data: program } = useProgram(parseInt(programId));
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
              <BreadcrumbPage>Thêm PLO mới</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div></div>
        </div>

        {/* Form */}
        <PLOForm
          programId={parseInt(programId)}
          onSuccess={() =>
            router.push(`/dashboard/admin/programs/${programId}?tab=plos`)
          }
          onCancel={() =>
            router.push(`/dashboard/admin/programs/${programId}?tab=plos`)
          }
        />
      </div>
    </AdminOnly>
  );
}
