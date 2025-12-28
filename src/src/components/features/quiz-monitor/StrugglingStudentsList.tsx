import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { StrugglingStudents } from "@/lib/types/quiz-monitor";

interface StrugglingStudentsListProps {
  strugglingStudents: StrugglingStudents | null;
}

export const StrugglingStudentsList: React.FC<StrugglingStudentsListProps> = ({
  strugglingStudents,
}) => {
  if (!strugglingStudents || strugglingStudents.count === 0) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-green-600" />
            Học sinh gặp khó khăn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Không có học sinh nào đang gặp khó khăn
          </p>
        </CardContent>
      </Card>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800";
      case "high":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-2 hover:border-primary transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Học sinh gặp khó khăn
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-semibold">
              {strugglingStudents.count} học sinh
            </Badge>
            {strugglingStudents.critical_count > 0 && (
              <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800">
                {strugglingStudents.critical_count} cần giúp gấp
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {strugglingStudents.students?.map((student) => (
            <div
              key={student.user_id}
              className="border-2 rounded-lg p-4 hover:border-orange-300 transition-all bg-card"
            >
              {/* Student Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 dark:from-orange-900/30 to-orange-50 dark:to-orange-950/20 rounded-full flex items-center justify-center border-2 border-orange-200 dark:border-orange-800">
                  <span className="font-bold text-orange-700 dark:text-orange-300 text-sm">
                    {student.user_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-base">
                    {student.user_name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      className={`${getRiskColor(student.risk_level)} text-xs`}
                    >
                      {getRiskIcon(student.risk_level)}
                      <span className="ml-1 capitalize">
                        {student.risk_level}
                      </span>
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Current Stats */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-muted/30 rounded-lg p-2.5 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Điểm</p>
                  <p className="text-lg font-bold">
                    {student.current_stats.score}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-2.5 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Độ chính xác
                  </p>
                  <p className="text-lg font-bold">
                    {Math.round(student.current_stats.accuracy)}%
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-2.5 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Đã trả lời
                  </p>
                  <p className="text-lg font-bold">
                    {student.current_stats.questions_answered}
                  </p>
                </div>
              </div>

              {/* Red Flags */}
              {student.red_flags && student.red_flags.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                    Cảnh báo
                  </p>
                  <div className="space-y-1.5">
                    {student.red_flags.map((flag, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md p-2"
                      >
                        <span className="font-semibold text-red-700 dark:text-red-300">
                          {flag.type.replace(/_/g, " ")}
                        </span>
                        <span className="text-red-600 dark:text-red-400 ml-1">
                          • {flag.description}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Actions */}
              {student.suggested_actions &&
                student.suggested_actions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                      Đề xuất can thiệp
                    </p>
                    <div className="space-y-1.5">
                      {student.suggested_actions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-2"
                        >
                          <div className="flex items-start gap-2">
                            <Badge
                              variant="outline"
                              className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 text-[10px] px-1.5 py-0"
                            >
                              P{suggestion.priority}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-blue-900 dark:text-blue-200">
                                {suggestion.description}
                              </p>
                              <p className="text-xs text-blue-700/70 dark:text-blue-400/70 mt-0.5">
                                {suggestion.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
