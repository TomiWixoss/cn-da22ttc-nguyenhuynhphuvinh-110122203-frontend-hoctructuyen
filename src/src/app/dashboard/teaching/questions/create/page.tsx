"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TeacherOnly } from "@/components/features/auth/role-guard";
import { Button } from "@/components/ui/forms";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import { CreateQuestionForm } from "@/components/features/teaching/questions/CreateQuestionForm";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";

export default function CreateQuestionPage() {
  const router = useRouter();
  const { createTeacherUrl } = useAssignmentContext();

  const handleSuccess = (questionData: any) => {
    // Redirect to question detail page or questions list
    const url = createTeacherUrl("/dashboard/teaching/questions");
    router.push(url);
  };

  const handleCancel = () => {
    const url = createTeacherUrl("/dashboard/teaching/questions");
    router.push(url);
  };

  return (
    <TeacherOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={createTeacherUrl("/dashboard/teaching/questions")}>
                  Câu hỏi
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Tạo mới</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Form Content */}
        <CreateQuestionForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </TeacherOnly>
  );
}
