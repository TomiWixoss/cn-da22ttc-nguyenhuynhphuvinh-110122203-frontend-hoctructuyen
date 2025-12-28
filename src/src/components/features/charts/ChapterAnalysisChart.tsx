"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Loader2, AlertCircle } from "lucide-react";
import { chapterAnalyticsService } from "@/lib/services/api/chapter-analytics.service";
import { ChapterAnalysisData } from "@/lib/types/chapter-analytics";
import { showErrorToast } from "@/lib/utils/toast-utils";
import { useAuthStatus } from "@/lib/hooks/use-auth";

// Import new components
import ChapterRadarChart from "./ChapterRadarChart";
import LearningOutcomeBubbleChart from "./LearningOutcomeBubbleChart";

interface ChapterAnalysisChartProps {
  quizId: number;
  quizName?: string;
  className?: string;
}

export default function ChapterAnalysisChart({
  quizId,
  quizName,
  className = "",
}: ChapterAnalysisChartProps) {
  const { getUser } = useAuthStatus();
  const [analysisData, setAnalysisData] = useState<ChapterAnalysisData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize user để tránh re-render không cần thiết
  const user = useMemo(() => getUser(), [getUser]);

  // Memoize fetch function để tránh re-create không cần thiết
  const fetchAnalysisData = useCallback(async () => {
    if (!quizId || !user) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);


      const data = await chapterAnalyticsService.getDetailedAnalysis({
        quiz_id: quizId,
        user_id: user.user_id,
      });



      setAnalysisData(data);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu phân tích theo chương:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi khi tải dữ liệu phân tích";
      setError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [quizId, user]);

  useEffect(() => {
    fetchAnalysisData();
  }, [fetchAnalysisData]);

  // Early return nếu không có user để tránh flickering
  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center py-20">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            Đang xác thực người dùng...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center py-20">
          <Loader2 className="h-16 w-16 text-muted-foreground animate-spin mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            Đang tải phân tích theo chương...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error || !analysisData) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center py-20">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground mb-2">
            {error || "Không có dữ liệu phân tích"}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Radar Chart - Wide Card */}
      <div className="lg:col-span-12">
        <ChapterRadarChart quizId={quizId} quizName={quizName} />
      </div>

      {/* Learning Outcome Bubble Chart - Full Width */}
      <div className="lg:col-span-12">
        <LearningOutcomeBubbleChart analysisData={analysisData} />
      </div>
    </div>
  );
}
