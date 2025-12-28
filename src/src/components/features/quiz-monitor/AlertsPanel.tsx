import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Badge } from "@/components/ui/feedback";
import { AlertTriangle, AlertCircle, Info, Bell } from "lucide-react";
import type { Alert } from "@/lib/types/quiz-monitor";

interface AlertsPanelProps {
  alerts: Alert[];
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return null;
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-5 w-5" />;
      case "warning":
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return {
          border: "border-red-300 dark:border-red-800",
          bg: "bg-red-50 dark:bg-red-950/30",
          text: "text-red-800 dark:text-red-300",
          badge:
            "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
        };
      case "warning":
        return {
          border: "border-orange-300 dark:border-orange-800",
          bg: "bg-orange-50 dark:bg-orange-950/30",
          text: "text-orange-800 dark:text-orange-300",
          badge:
            "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800",
        };
      default:
        return {
          border: "border-blue-300 dark:border-blue-800",
          bg: "bg-blue-50 dark:bg-blue-950/30",
          text: "text-blue-800 dark:text-blue-300",
          badge:
            "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        };
    }
  };

  // Sắp xếp alerts theo priority (cao nhất trước)
  const sortedAlerts = [...alerts].sort((a, b) => a.priority - b.priority);

  return (
    <Card className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
          <Bell className="h-5 w-5" />
          Cảnh báo ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedAlerts.map((alert, index) => {
            const colors = getAlertColor(alert.type);
            return (
              <div
                key={index}
                className={`border-2 ${colors.border} ${colors.bg} rounded-lg p-4 transition-all`}
              >
                <div className="flex items-start gap-3">
                  <div className={colors.text}>{getAlertIcon(alert.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className={`font-semibold ${colors.text}`}>
                        {alert.title}
                      </h4>
                      <Badge className={colors.badge}>
                        {alert.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className={`text-sm ${colors.text}`}>{alert.message}</p>
                    {alert.category && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Danh mục: {alert.category}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
