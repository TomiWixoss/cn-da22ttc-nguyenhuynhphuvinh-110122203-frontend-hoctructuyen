"use client";

import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import { CreateQuizContainer } from "@/components/features/quiz/create/create-quiz-container";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";

export default function CreateQuizPage() {
  const { createTeacherUrl } = useAssignmentContext();

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={createTeacherUrl("/dashboard/teaching/quizzes/list")}>
                Quản lý Quiz
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tạo mới</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Quiz Creation Form */}
      <CreateQuizContainer />
    </div>
  );
}
