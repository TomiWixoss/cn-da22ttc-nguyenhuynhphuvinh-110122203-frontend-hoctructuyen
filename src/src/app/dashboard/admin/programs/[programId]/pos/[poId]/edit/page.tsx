"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { AdminOnly } from "@/components/features/auth/role-guard";
import Link from "next/link";
import { POForm } from "@/components/features/admin/pos";
import { useProgram } from "@/lib/hooks/use-programs";
import { usePO } from "@/lib/hooks/use-pos";
import { Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";

interface EditPOPageProps {
  params: Promise<{
    programId: string;
    poId: string;
  }>;
}

export default function EditPOPage({ params }: EditPOPageProps) {
  const resolvedParams = use(params);
  const programId = parseInt(resolvedParams.programId);
  const poId = parseInt(resolvedParams.poId);
  const router = useRouter();

  const { data: program } = useProgram(programId);
  const { data: po, isLoading } = usePO(poId);

  if (isLoading || !po) {
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
                <Link href={`/dashboard/admin/programs/${programId}?tab=pos`}>
                  {program?.name || `Program #${programId}`}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/dashboard/admin/programs/${programId}/pos/${poId}`}
                >
                  {po.name}
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
        <POForm
          po={po}
          programId={programId}
          onSuccess={() =>
            router.push(`/dashboard/admin/programs/${programId}?tab=pos`)
          }
          onCancel={() =>
            router.push(`/dashboard/admin/programs/${programId}/pos/${poId}`)
          }
        />
      </div>
    </AdminOnly>
  );
}
