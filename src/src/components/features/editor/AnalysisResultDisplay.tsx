"use client";

import React from "react";
import { Extension } from "@codemirror/state";
import { CheckCircle, AlertCircle, Lightbulb, FileText } from "lucide-react";
import { Progress } from "@/components/ui/feedback";
import { CodeEditor } from "./code-editor";
import { SubmissionResult } from "@/lib/services/api/code-submission.service";
import { getScoreColor, getScoreBgColor, cleanMarkdownCode } from "./utils";

interface AnalysisResultDisplayProps {
  result: SubmissionResult;
  languageExtensions?: Extension[];
}

export const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({
  result,
  languageExtensions = [],
}) => {
  const analysis = result.ai_analysis;

  if (!analysis || result.status === "error") {
    return (
      <div className="space-y-4 text-center p-8">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-16 w-16 text-red-500 dark:text-red-400" />
          <h4 className="text-xl font-bold text-red-600 dark:text-red-400">
            Lỗi Phân Tích AI
          </h4>
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-2xl">
            <p className="text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap">
              {result.feedback ||
                "Không thể phân tích code. Vui lòng thử lại sau."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Điểm tổng thể */}
      <div className="text-center">
        <h4 className="text-xl font-bold mb-4">
          Phân Tích Code bởi Cerebras AI
        </h4>
        <div
          className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${getScoreBgColor(
            analysis.overall_score
          )}`}
        >
          <div>
            <div
              className={`text-5xl font-bold ${getScoreColor(
                analysis.overall_score
              )}`}
            >
              {analysis.overall_score}
            </div>
            <div className="text-sm text-muted-foreground">/ 100</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">Điểm Tổng Thể</p>
      </div>

      {/* Các tiêu chí đánh giá */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Correctness */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-semibold text-base">Tính đúng đắn</h5>
            <span
              className={`text-2xl font-bold ${getScoreColor(
                analysis.correctness.score
              )}`}
            >
              {analysis.correctness.score}
            </span>
          </div>
          <Progress value={analysis.correctness.score} className="h-2 mb-3" />
          <p className="text-sm text-muted-foreground">
            {analysis.correctness.comments}
          </p>
        </div>

        {/* Code Quality */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-semibold text-base">Chất lượng code</h5>
            <span
              className={`text-2xl font-bold ${getScoreColor(
                analysis.code_quality.score
              )}`}
            >
              {analysis.code_quality.score}
            </span>
          </div>
          <Progress value={analysis.code_quality.score} className="h-2 mb-3" />
          <p className="text-sm text-muted-foreground">
            {analysis.code_quality.comments}
          </p>
        </div>

        {/* Performance */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-semibold text-base">Hiệu suất</h5>
            <span
              className={`text-2xl font-bold ${getScoreColor(
                analysis.performance.score
              )}`}
            >
              {analysis.performance.score}
            </span>
          </div>
          <Progress value={analysis.performance.score} className="h-2 mb-3" />
          <p className="text-sm text-muted-foreground">
            Time: {analysis.performance.time_complexity}, Space:{" "}
            {analysis.performance.space_complexity}
          </p>
        </div>

        {/* Best Practices */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-semibold text-base">Best Practices</h5>
            <span
              className={`text-2xl font-bold ${getScoreColor(
                analysis.best_practices.score
              )}`}
            >
              {analysis.best_practices.score}
            </span>
          </div>
          <Progress
            value={analysis.best_practices.score}
            className="h-2 mb-3"
          />
          <p className="text-sm text-muted-foreground">
            {analysis.best_practices.recommendations.slice(0, 2).join(", ")}
          </p>
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950/30">
          <h5 className="font-semibold text-base mb-3 text-green-700 dark:text-green-400 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" /> Điểm mạnh
          </h5>
          <ul className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <li
                key={i}
                className="text-sm flex items-start gap-2 text-green-900 dark:text-green-100"
              >
                <span className="text-green-600 dark:text-green-400 mt-0.5">
                  •
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50 dark:bg-orange-950/30">
          <h5 className="font-semibold text-base mb-3 text-orange-700 dark:text-orange-400 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" /> Điểm cần cải thiện
          </h5>
          <ul className="space-y-2">
            {analysis.weaknesses.length > 0 ? (
              analysis.weaknesses.map((w, i) => (
                <li
                  key={i}
                  className="text-sm flex items-start gap-2 text-orange-900 dark:text-orange-100"
                >
                  <span className="text-orange-600 dark:text-orange-400 mt-0.5">
                    •
                  </span>
                  <span>{w}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">
                Không có điểm yếu đáng kể
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Detailed Feedback */}
      <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-950/30">
        <h5 className="font-semibold text-base mb-3 text-blue-700 dark:text-blue-400 flex items-center gap-2">
          <FileText className="h-5 w-5" /> Phản hồi chi tiết
        </h5>
        <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-100">
          {analysis.feedback}
        </p>
      </div>
    </div>
  );
};
