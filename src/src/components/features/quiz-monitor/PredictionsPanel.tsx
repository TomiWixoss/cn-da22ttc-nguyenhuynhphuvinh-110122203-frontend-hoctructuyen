import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import { Progress } from "@/components/ui/feedback";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Target,
  BarChart3,
} from "lucide-react";
import type { Predictions } from "@/lib/types/quiz-monitor";

interface PredictionsPanelProps {
  predictions: Predictions | null;
}

export const PredictionsPanel: React.FC<PredictionsPanelProps> = ({
  predictions,
}) => {
  if (!predictions) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Dự đoán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Chưa có đủ dữ liệu để dự đoán
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return (
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
        );
      case "declining":
        return (
          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
        );
      default:
        return <Minus className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800";
      case "declining":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const getScoreColor = (key: string) => {
    switch (key) {
      case "excellent":
        return {
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-600 dark:text-green-400",
          label: "Xuất sắc",
        };
      case "good":
        return {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-600 dark:text-blue-400",
          label: "Tốt",
        };
      case "average":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900/30",
          text: "text-yellow-600 dark:text-yellow-400",
          label: "Trung bình",
        };
      case "poor":
        return {
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-600 dark:text-red-400",
          label: "Yếu",
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-800",
          text: "text-gray-600 dark:text-gray-400",
          label: key,
        };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pass Rate Prediction */}
      <Card className="border-2 hover:border-primary transition-all">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5" />
            Dự đoán tỷ lệ đạt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">
              {Math.round(predictions.pass_rate_prediction.predicted_pass_rate)}
              %
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Hiện tại:{" "}
              {Math.round(predictions.pass_rate_prediction.current_pass_rate)}%
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Badge
              className={getTrendColor(predictions.pass_rate_prediction.trend)}
            >
              {getTrendIcon(predictions.pass_rate_prediction.trend)}
              <span className="ml-1 capitalize">
                {predictions.pass_rate_prediction.trend}
              </span>
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Độ tin cậy</span>
              <span>{predictions.pass_rate_prediction.confidence}%</span>
            </div>
            <Progress
              value={predictions.pass_rate_prediction.confidence}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Completion Estimate */}
      <Card className="border-2 hover:border-primary transition-all">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5" />
            Ước tính hoàn thành
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">
              {Math.round(
                predictions.completion_estimate.estimated_completion_minutes
              )}
            </p>
            <p className="text-sm text-muted-foreground mt-1">phút</p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Độ tin cậy</span>
              <span>{predictions.completion_estimate.confidence}%</span>
            </div>
            <Progress
              value={predictions.completion_estimate.confidence}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Score Distribution Prediction */}
      <Card className="border-2 hover:border-primary transition-all">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5" />
            Phân bố điểm dự đoán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(predictions.score_distribution_prediction).map(
              ([key, value]) => {
                const colors = getScoreColor(key);
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{colors.label}</span>
                      <span className={`font-bold ${colors.text}`}>
                        {value.count} ({Math.round(value.percentage)}%)
                      </span>
                    </div>
                    <Progress
                      value={value.percentage}
                      className={`h-2 ${colors.bg}`}
                    />
                  </div>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
