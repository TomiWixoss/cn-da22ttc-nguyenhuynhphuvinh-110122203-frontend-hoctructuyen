// frontend/src/app/dashboard/admin/programs/[programId]/page.tsx
"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AdminOnly } from "@/components/features/auth/role-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation";
import { Skeleton } from "@/components/ui/feedback";
import { Edit } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import { useProgram } from "@/lib/hooks/use-programs";
import { POsDataTable } from "@/components/features/admin/pos";
import { PLOsDataTable } from "@/components/features/admin/plos";
import { ProgramSubjectsCardGrid } from "@/components/features/admin/subjects/program-subjects-data-table";
// THÊM IMPORT MỚI
import { POPLOAssociationMatrix } from "@/components/features/admin/relationships/POPLOAssociationMatrix";
import { SubjectPLOAssociationMatrix } from "@/components/features/admin/relationships/SubjectPLOAssociationMatrix";
import { ProgramDetailSkeleton } from "@/components/features/admin/programs/ProgramDetailSkeleton";

interface ProgramDetailPageProps {
  params: Promise<{
    programId: string;
  }>;
}

export default function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const programId = parseInt(resolvedParams.programId);

  // Đổi tab mặc định về chi tiết
  const [activeTab, setActiveTab] = useState("details");

  const { data: program, isLoading, isError } = useProgram(programId);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab &&
      ["associations", "details", "pos", "plos", "subjects"].includes(tab)
    ) {
      setActiveTab(tab);
    } else {
      setActiveTab("details");
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`${pathname}?tab=${value}`);
  };

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
                <BreadcrumbPage>Chi tiết</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <ProgramDetailSkeleton />
        </div>
      </AdminOnly>
    );
  }

  if (isError || !program) {
    return (
      <div className="container mx-auto p-6">Không tìm thấy chương trình.</div>
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
              <BreadcrumbPage className="max-w-[150px] sm:max-w-none truncate">
                {program.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-5 gap-1 h-auto p-1">
            <TabsTrigger
              value="details"
              className="text-xs sm:text-sm px-1 sm:px-2 py-2 sm:py-2.5"
            >
              <span className="hidden sm:inline">Chi tiết</span>
              <span className="sm:hidden">CT</span>
            </TabsTrigger>
            <TabsTrigger
              value="pos"
              className="text-xs sm:text-sm px-1 sm:px-2 py-2 sm:py-2.5"
            >
              POs
            </TabsTrigger>
            <TabsTrigger
              value="plos"
              className="text-xs sm:text-sm px-1 sm:px-2 py-2 sm:py-2.5"
            >
              PLOs
            </TabsTrigger>
            <TabsTrigger
              value="subjects"
              className="text-xs sm:text-sm px-1 sm:px-2 py-2 sm:py-2.5"
            >
              <span className="hidden sm:inline">Môn học</span>
              <span className="sm:hidden">MH</span>
            </TabsTrigger>
            <TabsTrigger
              value="associations"
              className="text-xs sm:text-sm px-1 sm:px-2 py-2 sm:py-2.5"
            >
              <span className="hidden sm:inline">Ma trận</span>
              <span className="sm:hidden">MT</span>
            </TabsTrigger>
          </TabsList>

          {/* NỘI DUNG TAB MỚI */}
          <TabsContent
            value="associations"
            className="mt-4 sm:mt-6 space-y-6 sm:space-y-8"
          >
            <POPLOAssociationMatrix programId={programId} />
            <SubjectPLOAssociationMatrix programId={programId} />
          </TabsContent>

          <TabsContent value="details" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg sm:text-xl break-words">
                      Chi tiết chương trình: {program.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {program.description}
                    </CardDescription>
                  </div>
                  <Button asChild size="sm" className="w-full sm:w-auto">
                    <Link href={`/dashboard/admin/programs/${programId}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Chỉnh sửa
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Mô tả chi tiết</h3>
                    <p className="text-muted-foreground">
                      {program.description || "Chưa có mô tả chi tiết"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Thông tin bổ sung</h3>
                    <p className="text-muted-foreground">
                      Thông tin chi tiết về chương trình đào tạo sẽ được hiển
                      thị ở đây.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pos" className="mt-4 sm:mt-6">
            <POsDataTable programId={programId} />
          </TabsContent>

          <TabsContent value="plos" className="mt-4 sm:mt-6">
            <PLOsDataTable programId={programId} />
          </TabsContent>

          <TabsContent value="subjects" className="mt-4 sm:mt-6">
            <ProgramSubjectsCardGrid programId={programId} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminOnly>
  );
}
