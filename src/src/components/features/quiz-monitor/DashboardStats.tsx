import React from "react";
import { Card, CardContent } from "@/components/ui/layout";
import {
  Users,
  CheckCircle,
  Activity,
  Clock,
  Trophy,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";
import type {
  ClassMetrics,
  ParticipantsSummary,
} from "@/lib/types/quiz-monitor";

interface DashboardStatsProps {
  participantsSummary: ParticipantsSummary;
  classMetrics: ClassMetrics | null;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  participantsSummary,
  classMetrics,
}) => {
  const stats = [
    {
      label: "Tổng học viên",
      value: participantsSummary.total,
      icon: Users,
      color: "blue",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Hoàn thành",
      value: participantsSummary.completed,
      icon: CheckCircle,
      color: "green",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      label: "Đang làm",
      value: participantsSummary.active,
      icon: Activity,
      color: "blue",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Điểm TB",
      value: classMetrics ? Math.round(classMetrics.avg_score) : 0,
      icon: Trophy,
      color: "yellow",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      textColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "Độ chính xác TB",
      value: classMetrics ? `${Math.round(classMetrics.avg_accuracy)}%` : "0%",
      icon: Target,
      color: "emerald",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Điểm giữa",
      value: classMetrics ? Math.round(classMetrics.median_score) : 0,
      icon: TrendingUp,
      color: "purple",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Thời gian TB",
      value: classMetrics
        ? `${Math.round(classMetrics.avg_response_time / 1000)}s`
        : "0s",
      icon: Clock,
      color: "orange",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      textColor: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Tỷ lệ hoàn thành",
      value: classMetrics
        ? `${Math.round(classMetrics.completion_rate)}%`
        : "0%",
      icon: Zap,
      color: "indigo",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
      textColor: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="border-2 hover:border-primary transition-all group"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
