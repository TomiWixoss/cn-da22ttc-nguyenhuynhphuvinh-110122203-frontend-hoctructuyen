"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TeacherOnly } from "@/components/features/auth/role-guard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import Link from "next/link";
import { QuestionWithRelations } from "@/lib/types/question";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { Skeleton } from "@/components/ui/feedback/skeleton";
import { EditQuestionForm } from "@/components/features/teaching/questions/EditQuestionForm";
import { HelpCircle } from "lucide-react";
import { useQuestion } from "@/lib/hooks/use-questions";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";

interface EditQuestionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditQuestionPage({ params }: EditQuestionPageProps) {
  const router = useRouter();
  const { createTeacherUrl } = useAssignmentContext();
  const [questionId, setQuestionId] = useState<number | null>(null);

  // Initialize question ID
  useEffect(() => {
    const initializeQuestionId = async () => {
      const resolvedParams = await params;
      const id = parseInt(resolvedParams.id);
      if (!isNaN(id)) {
        setQuestionId(id);
      } else {
        showErrorToast("ID câu hỏi không hợp lệ");
        const url = createTeacherUrl("/dashboard/teaching/questions");
        router.push(url);
      }
    };
    initializeQuestionId();
  }, [params, router]);

  // Use TanStack Query hook
  const { data: question, isLoading, error } = useQuestion(questionId!);

  // Handle error from query
  useEffect(() => {
    if (error) {
      console.error("Error fetching question:", error);
      showErrorToast("Không thể tải thông tin câu hỏi");
      const url = createTeacherUrl("/dashboard/teaching/questions");
      router.push(url);
    }
  }, [error, router]);

  const handleSuccess = () => {
    // Redirect to question detail page after successful update
    const url = createTeacherUrl(`/dashboard/teaching/questions/${questionId}`);
    router.push(url);
  };

  const handleCancel = () => {
    // Redirect back to question detail or questions list
    const url = createTeacherUrl(`/dashboard/teaching/questions/${questionId}`);
    router.push(url);
  };

  if (isLoading) {
    return (
      <TeacherOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
        <div className="container mx-auto p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </TeacherOnly>
    );
  }

  if (!question) {
    return (
      <TeacherOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
        <div className="container mx-auto p-6">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href={createTeacherUrl("/dashboard/teaching/questions")}
                  >
                    Quản lý câu hỏi
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Chỉnh sửa</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="text-center py-12">
            <HelpCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">
              Không tìm thấy câu hỏi
            </h2>
            <p className="text-muted-foreground mb-4">
              Câu hỏi này không tồn tại hoặc bạn không có quyền truy cập.
            </p>
          </div>
        </div>
      </TeacherOnly>
    );
  }

  return (
    <TeacherOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={createTeacherUrl("/dashboard/teaching/questions")}>
                  Quản lý câu hỏi
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={createTeacherUrl(
                    `/dashboard/teaching/questions/${questionId}`
                  )}
                >
                  {question.question_text.length > 30
                    ? `${question.question_text.substring(0, 30)}...`
                    : question.question_text}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chỉnh sửa</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Form Content */}
        <EditQuestionForm
          question={question}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </TeacherOnly>
  );
}
