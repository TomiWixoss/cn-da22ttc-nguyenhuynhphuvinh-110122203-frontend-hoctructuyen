"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import {
  Loader2,
  LayoutDashboard,
  FileQuestion,
  UserSearch,
  Code2,
} from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import { useQuery } from "@tanstack/react-query";
import { quizService, codeAnalyticsService } from "@/lib/services/api";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";
import {
  OverviewDashboard,
  QuestionDeepDive,
  StudentInsight,
} from "@/components/features/code-analytics";

interface PageProps {
  params: Promise<{ quizId: string }>;
}

export default function CodeAnalysisDashboard({ params }: PageProps) {
  const resolvedParams = use(params);
  const { createTeacherUrl } = useAssignmentContext();

  const quizId = parseInt(resolvedParams.quizId);

  const [activeTab, setActiveTab] = useState("overview");

  // Fetch quiz questions
  const { data: allQuestions, isLoading: loadingQ } = useQuery({
    queryKey: ["quiz-questions", quizId],
    queryFn: async () => {
      const res = await quizService.getQuizQuestions(quizId);
      return res?.success && res?.data?.questions
        ? res.data.questions
        : res?.data || res || [];
    },
    enabled: !!quizId,
  });

  // Filter code questions
  const codeQuestions = useMemo(() => {
    return (allQuestions || []).filter(
      (q: any) =>
        q.question_type?.name?.toLowerCase().includes("code") ||
        q.QuestionType?.name?.toLowerCase().includes("code") ||
        q.question_type_id === 4
    );
  }, [allQuestions]);

  // Fetch course overview
  const {
    data: overview,
    isLoading: loadingO,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ["quiz-overview", quizId],
    queryFn: () =>
      codeAnalyticsService.getCourseOverview({ id: quizId, type: "quiz" }),
    enabled: !!quizId,
  });

  // Combine all students from different sources
  const combinedStudents = useMemo(() => {
    const studentsNeedingHelp = overview?.students_needing_help || [];
    const allStudents = overview?.all_students || [];
    const topPerformers = overview?.top_performers || [];

    const map = new Map<string, any>();
    allStudents.forEach((s: any) => {
      const id = String(s.user_id);
      if (id && !map.has(id)) map.set(id, s);
    });
    studentsNeedingHelp.forEach((s: any) => {
      const id = String(s.user_id || s.user?.user_id);
      if (id && !map.has(id)) map.set(id, s);
    });
    topPerformers.forEach((s: any) => {
      const id = String(s.user?.user_id);
      if (id && !map.has(id)) map.set(id, s);
    });
    return Array.from(map.values());
  }, [overview]);

  const isLoading = loadingQ || loadingO;

  // Handle navigation callbacks
  const handleNavigateToStudent = () => {
    setActiveTab("students");
  };

  const handleNavigateToQuestion = () => {
    setActiveTab("questions");
  };

  if (isLoading) {
    return (
      <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">
        <Breadcrumb className="mb-4 sm:mb-6 md:mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={createTeacherUrl("/dashboard/teaching/quizzes/list")}
                >
                  Quản lý Quiz
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Phân tích Code</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải dữ liệu phân tích...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4 sm:mb-6 md:mb-8">
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
            <BreadcrumbPage className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              Phân tích: {overview?.quiz_info?.name || "Bài tập Code"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        defaultValue="overview"
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 gap-1 h-auto p-1">
          <TabsTrigger
            value="overview"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs sm:text-sm px-1.5 sm:px-2 py-1.5 sm:py-2.5"
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span className="text-[10px] sm:text-sm leading-tight sm:leading-normal">
              Tổng quan
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="questions"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs sm:text-sm px-1.5 sm:px-2 py-1.5 sm:py-2.5"
          >
            <FileQuestion className="h-4 w-4 shrink-0" />
            <span className="text-[10px] sm:text-sm leading-tight sm:leading-normal">
              Câu hỏi
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs sm:text-sm px-1.5 sm:px-2 py-1.5 sm:py-2.5"
          >
            <UserSearch className="h-4 w-4 shrink-0" />
            <span className="text-[10px] sm:text-sm leading-tight sm:leading-normal">
              Sinh viên
            </span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Overview Dashboard */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <OverviewDashboard
            overview={overview}
            onNavigateToQuestion={handleNavigateToQuestion}
            onNavigateToStudent={handleNavigateToStudent}
          />
        </TabsContent>

        {/* Tab: Question Deep Dive */}
        <TabsContent value="questions" className="space-y-6 mt-6">
          <QuestionDeepDive questions={codeQuestions} />
        </TabsContent>

        {/* Tab: Student Insight */}
        <TabsContent value="students" className="space-y-6 mt-6">
          <StudentInsight students={combinedStudents} quizId={quizId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
