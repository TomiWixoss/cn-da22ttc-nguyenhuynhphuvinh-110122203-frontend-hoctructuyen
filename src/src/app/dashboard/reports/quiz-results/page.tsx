"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  FileDown,
  BarChart3,
  Activity,
  Grid3X3,
  Users,
  BookOpen,
  Radar,
} from "lucide-react";
import { Button } from "@/components/ui/forms";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/display";
import { Input } from "@/components/ui/forms";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/navigation";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast-utils";
import { formatDate } from "@/lib/utils";
import { exportToExcel } from "@/lib/utils/export-utils";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";

// New chapter analytics components
import {
  LearningOutcomesChart,
  DifficultyLOHeatmap,
} from "@/components/features/charts";
import StudentGroupBarChart from "@/components/features/charts/StudentGroupBarChart";
import TeacherRadarChart from "@/components/features/charts/TeacherRadarChart";

// Custom hooks
import {
  useQuizResults,
  useFilteredQuizResults,
  getGradeClassification,
  getScoreColor,
  getStatusColor,
  getGradeColor,
  type QuizResult,
} from "@/lib/hooks/use-quiz-results";
import { QuizResultsReportSkeleton } from "@/components/features/reports/QuizResultsReportSkeleton";

export default function QuizResultsReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { createTeacherUrl } = useAssignmentContext();
  const quizId = searchParams.get("quizId")
    ? parseInt(searchParams.get("quizId") as string)
    : null;
  const quizName = searchParams.get("quizName") || "Bài kiểm tra";

  // State cho filter
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");

  // Sử dụng custom hook để lấy dữ liệu
  const {
    data: results = [],
    isLoading,
    isError,
    error,
  } = useQuizResults(quizId || 0);

  // Sử dụng custom hook để filter results
  const filteredResults = useFilteredQuizResults(
    results,
    searchTerm,
    gradeFilter
  );

  // Xuất dữ liệu ra file Excel
  const handleExportToExcel = (data?: any[], filterType?: string) => {
    try {
      const dataToExport = (data || filteredResults).map((result) => ({
        "Mã học viên":
          result.Student?.user_id || result["Mã học viên"] || "N/A",
        "Tên học viên": result.Student?.name || result["Tên học viên"] || "N/A",
        Email: result.Student?.email || result.Email || "N/A",
        "Điểm số": result.score || result["Điểm số"] || 0,
        "Phân loại": result.Student
          ? getGradeClassification(result.score).toUpperCase()
          : result["Phân loại"] || "N/A",
        "Trạng thái": result.status || result["Trạng thái"] || "N/A",
        "Thời gian hoàn thành (giây)":
          result.completion_time ||
          result["Thời gian hoàn thành (giây)"] ||
          "N/A",
        "Ngày cập nhật": result.update_time
          ? formatDate(result.update_time)
          : result["Ngày cập nhật"] || "N/A",
      }));

      // Tạo thông tin bổ sung cho báo cáo
      const currentDate = new Date();
      const formattedDate = new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(currentDate);

      // Tạo thống kê theo phân loại
      const sourceData = data || filteredResults;
      const gradeStats = {
        "xuất sắc": sourceData.filter((r) => {
          const score = r.score || r["Điểm số"] || 0;
          return getGradeClassification(score) === "xuất sắc";
        }).length,
        giỏi: sourceData.filter((r) => {
          const score = r.score || r["Điểm số"] || 0;
          return getGradeClassification(score) === "giỏi";
        }).length,
        khá: sourceData.filter((r) => {
          const score = r.score || r["Điểm số"] || 0;
          return getGradeClassification(score) === "khá";
        }).length,
        "trung bình": sourceData.filter((r) => {
          const score = r.score || r["Điểm số"] || 0;
          return getGradeClassification(score) === "trung bình";
        }).length,
        yếu: sourceData.filter((r) => {
          const score = r.score || r["Điểm số"] || 0;
          return getGradeClassification(score) === "yếu";
        }).length,
        kém: sourceData.filter((r) => {
          const score = r.score || r["Điểm số"] || 0;
          return getGradeClassification(score) === "kém";
        }).length,
      };

      // Tạo các tùy chọn xuất file
      const exportTitle =
        filterType && filterType !== "all"
          ? `BÁO CÁO KẾT QUẢ NHÓM: ${filterType.toUpperCase()}`
          : `BÁO CÁO KẾT QUẢ BÀI KIỂM TRA`;

      const exportOptions = {
        title: exportTitle,
        subtitle: quizName,
        additionalInfo: {
          "Tổng số học viên": sourceData.length.toString(),
          "Ngày xuất báo cáo": formattedDate,
          "Số học viên đạt": sourceData
            .filter((r) => {
              const status = r.status || r["Trạng thái"] || "";
              return (
                status.toLowerCase() === "đạt" ||
                status.toLowerCase() === "passed" ||
                status.toLowerCase() === "completed" ||
                status.toLowerCase() === "hoàn thành"
              );
            })
            .length.toString(),
          "Điểm trung bình": (
            sourceData.reduce((sum, r) => {
              const score = r.score || r["Điểm số"] || 0;
              return sum + score;
            }, 0) / sourceData.length || 0
          ).toFixed(2),
          "Xuất sắc": gradeStats["xuất sắc"].toString(),
          Giỏi: gradeStats["giỏi"].toString(),
          Khá: gradeStats["khá"].toString(),
          "Trung bình": gradeStats["trung bình"].toString(),
          Yếu: gradeStats["yếu"].toString(),
          Kém: gradeStats["kém"].toString(),
        },
        sheetName:
          filterType && filterType !== "all"
            ? `Nhóm ${filterType}`
            : "Kết quả kiểm tra",
      };

      const fileName =
        filterType && filterType !== "all"
          ? `Kết quả ${quizName} - Nhóm ${filterType}`
          : `Kết quả ${quizName}`;

      exportToExcel(dataToExport, fileName, exportOptions);
      showSuccessToast("Xuất file thành công!");
    } catch (error) {
      console.error("Lỗi khi xuất file:", error);
      showErrorToast("Không thể xuất file. Vui lòng thử lại sau.");
    }
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
              <BreadcrumbPage>Báo cáo: {quizName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <QuizResultsReportSkeleton />
      </div>
    );
  }

  if (isError || !quizId) {
    return (
      <div className="container px-6 max-w-7xl mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-500">Lỗi</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="mb-4">
              {error?.message || "Không tìm thấy ID bài kiểm tra"}
            </p>
            <Button onClick={() => router.back()}>Quay lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">
      {/* Breadcrumb Navigation */}
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
            <BreadcrumbPage>Báo cáo: {quizName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Analytics Dashboard */}
      <div className="mb-8">
        <Tabs defaultValue="difficulty-lo-heatmap" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto p-1">
            <TabsTrigger
              value="difficulty-lo-heatmap"
              className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs sm:text-sm px-1.5 sm:px-2 py-1.5 sm:py-2.5"
            >
              <Grid3X3 className="h-4 w-4 sm:h-4 sm:w-4 shrink-0" />
              <span className="text-[10px] sm:text-sm leading-tight sm:leading-normal">
                Ma trận
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="chapter-analytics"
              className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs sm:text-sm px-1.5 sm:px-2 py-1.5 sm:py-2.5"
            >
              <BookOpen className="h-4 w-4 sm:h-4 sm:w-4 shrink-0" />
              <span className="text-[10px] sm:text-sm leading-tight sm:leading-normal">
                CĐR
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="student-groups"
              className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs sm:text-sm px-1.5 sm:px-2 py-1.5 sm:py-2.5"
            >
              <Users className="h-4 w-4 sm:h-4 sm:w-4 shrink-0" />
              <span className="text-[10px] sm:text-sm leading-tight sm:leading-normal">
                Xếp loại
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="radar"
              className="flex flex-col sm:flex-row items-center justify-center gap-1 text-xs sm:text-sm px-1.5 sm:px-2 py-1.5 sm:py-2.5"
            >
              <Radar className="h-4 w-4 sm:h-4 sm:w-4 shrink-0" />
              <span className="text-[10px] sm:text-sm leading-tight sm:leading-normal">
                So sánh
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chapter-analytics" className="space-y-6 mt-6">
            <LearningOutcomesChart
              quizId={quizId}
              quizName={quizName}
              className="w-full"
            />
          </TabsContent>

          <TabsContent value="student-groups" className="space-y-6 mt-6">
            <StudentGroupBarChart
              quizId={quizId}
              className="w-full"
              results={filteredResults}
              gradeFilter={gradeFilter}
              onExportExcel={handleExportToExcel}
              getGradeClassification={getGradeClassification}
            />
          </TabsContent>

          <TabsContent value="radar" className="space-y-6 mt-6">
            <TeacherRadarChart
              quizId={quizId}
              quizName={quizName}
              className="w-full"
            />
          </TabsContent>

          <TabsContent value="difficulty-lo-heatmap" className="space-y-6 mt-6">
            <DifficultyLOHeatmap quizId={quizId} className="w-full" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
