"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation";
import {
  Award,
  BarChart3,
  BookOpen,
  Target,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  StudentScoreAnalysisChart,
  LearningOverviewDashboard,
  DetailedAnalysisDashboard,
} from "@/components/features/charts";
import {
  LOCompletionAnalysisCard,
  LearningResultsSkeleton,
} from "@/components/features/learning";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import {
  useComprehensiveAnalysis,
  useLOCompletionAnalysis,
  useStudentCourses,
} from "@/lib/hooks/use-learning-analytics";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";

export default function StudentLearningResultsPage() {
  const { getUser } = useAuthStatus();
  const user = getUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState("overview");
  const [courseId, setCourseId] = useState<number | null>(null);
  const [courseName, setCourseName] = useState<string>("");

  const { data: courses, isLoading: coursesLoading } = useStudentCourses();

  useEffect(() => {
    const urlCourseId = searchParams.get("courseId");
    if (urlCourseId && !isNaN(Number(urlCourseId))) {
      setCourseId(Number(urlCourseId));
    } else if (courses && courses.length > 0) {
      const defaultCourse =
        courses.find((c: any) => c.course_id === 3) || courses[0];
      setCourseId(defaultCourse.course_id);

      const params = new URLSearchParams(searchParams.toString());
      params.set("courseId", defaultCourse.course_id.toString());
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, courses, router, pathname]);

  useEffect(() => {
    if (courseId && courses) {
      const currentCourse = courses.find((c: any) => c.course_id === courseId);
      if (currentCourse) {
        setCourseName(currentCourse.name || `Khóa học ${courseId}`);
      }
    }
  }, [courseId, courses]);

  const {
    data,
    isLoading: isComprehensiveLoading,
    isError: isComprehensiveError,
    error: comprehensiveError,
    refetch: refetchComprehensive,
  } = useComprehensiveAnalysis({
    course_id: courseId!,
    user_id: user?.user_id!,
  });

  const {
    data: loAnalysisData,
    isLoading: isLoAnalysisLoading,
    isError: isLoAnalysisError,
    error: loAnalysisError,
    refetch: refetchLOAnalysis,
  } = useLOCompletionAnalysis({
    course_id: courseId!,
    user_id: user?.user_id!,
  });

  const isLoading = coursesLoading || (courseId && isComprehensiveLoading);
  const error = isComprehensiveError ? comprehensiveError : null;

  if (isLoading) {
    return <LearningResultsSkeleton />;
  }

  if (error) {
    return (
      <div className="w-full mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-red-600 mb-2">
            Lỗi tải dữ liệu
          </h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <button
            onClick={() => refetchComprehensive()}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full mx-auto">
        <div className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
          <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Chưa có dữ liệu
          </h2>
          <p className="text-muted-foreground">
            Chưa có dữ liệu phân tích kết quả học tập
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-4 sm:mb-6 md:mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Tổng quan</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Phân tích kết quả: {courseName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Analytics Dashboard */}
      <div className="mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-1 h-auto p-1">
            <TabsTrigger
              value="overview"
              className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2 sm:py-2.5"
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Dashboard Tổng quan</span>
              <span className="sm:hidden">Tổng quan</span>
            </TabsTrigger>
            <TabsTrigger
              value="detailed"
              className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2 sm:py-2.5"
            >
              <Target className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Phân tích Chương</span>
              <span className="sm:hidden">Chương</span>
            </TabsTrigger>
            <TabsTrigger
              value="lo-analysis"
              className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2 sm:py-2.5"
            >
              <Award className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Phân tích Chuẩn đầu ra</span>
              <span className="sm:hidden">Chuẩn đầu ra</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6 mt-6">
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-l-4 border-blue-500 dark:border-blue-600">
              <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                Phân tích Điểm số Tổng thể
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Phân tích toàn diện về hiệu suất học tập của bạn với điểm mạnh,
                điểm yếu và so sánh với trung bình lớp.
              </p>
            </div>
            <StudentScoreAnalysisChart className="w-full" />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <LearningOverviewDashboard className="w-full" data={data} />
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6 mt-6">
            <DetailedAnalysisDashboard className="w-full" data={data} />
          </TabsContent>

          <TabsContent value="lo-analysis" className="space-y-6 mt-6">
            {isLoAnalysisLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : isLoAnalysisError ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{loAnalysisError.message}</p>
                <button
                  onClick={() => refetchLOAnalysis()}
                  className="mt-4 px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              loAnalysisData && (
                <LOCompletionAnalysisCard
                  className="w-full"
                  data={loAnalysisData}
                />
              )
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
