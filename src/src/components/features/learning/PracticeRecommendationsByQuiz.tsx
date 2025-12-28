"use client";

import { useQuery } from "@tanstack/react-query";
import { practiceRecommendationService } from "@/lib/services/api/practice-recommendation.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Skeleton, Badge } from "@/components/ui/feedback";
import {
  BookOpen,
  TrendingDown,
  Target,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface PracticeRecommendationsByQuizProps {
  quizId: number;
  className?: string;
}

export function PracticeRecommendationsByQuiz({
  quizId,
  className,
}: PracticeRecommendationsByQuizProps) {
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["practice-recommendations-by-quiz", quizId],
    queryFn: () =>
      practiceRecommendationService.getPracticeRecommendationsByQuiz(quizId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.success) {
    return null;
  }

  const { assessment_quiz_name, score, weak_los, recommended_quizzes } =
    data.data;

  // Không hiển thị nếu không có LO yếu hoặc quiz gợi ý
  if (weak_los.length === 0 || recommended_quizzes.length === 0) {
    return null;
  }

  const handleStartPractice = (quizId: number) => {
    router.push(`/quiz-practice/${quizId}`);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-500" />
          <CardTitle>Bài luyện tập gợi ý</CardTitle>
        </div>
        <CardDescription>
          Dựa trên kết quả bài "{assessment_quiz_name}", chúng tôi gợi ý các bài
          luyện tập để cải thiện
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weak LOs Section */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            Chuẩn đầu ra cần cải thiện ({weak_los.length})
          </h4>
          <div className="space-y-2">
            {weak_los.map((lo) => (
              <div
                key={lo.lo_id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{lo.lo_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Độ chính xác: {lo.correct}/{lo.total} câu (
                    {lo.accuracy.toFixed(1)}%)
                  </p>
                </div>
                <Badge
                  variant={lo.accuracy < 50 ? "destructive" : "secondary"}
                  className="ml-2"
                >
                  {lo.accuracy.toFixed(0)}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Quizzes Section */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" />
            Bài luyện tập được đề xuất ({recommended_quizzes.length})
          </h4>
          <div className="space-y-3">
            {recommended_quizzes.map((quiz) => (
              <div
                key={quiz.quiz_id}
                className="border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                onClick={() => handleStartPractice(quiz.quiz_id)}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Icon */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>

                  {/* Middle: Quiz info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-bold text-base mb-1.5 truncate"
                      title={quiz.quiz_name}
                    >
                      {quiz.quiz_name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span>{quiz.total_questions} câu hỏi</span>
                    </div>
                  </div>

                  {/* Right: Arrow Icon */}
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
