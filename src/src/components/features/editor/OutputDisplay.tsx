"use client";

import React from "react";
import { Loader2, Terminal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/layout";
import { ProcessingStage } from "./types";

interface OutputDisplayProps {
  processingStage: ProcessingStage;
  output: string;
  emptyMessage: string;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({
  processingStage,
  output,
  emptyMessage,
}) => {
  const isProcessing = processingStage === "judge0";

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center border-2 border-green-500/20">
          <Terminal className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold">Kết Quả Biên Dịch & Thực Thi</h3>
      </div>
      {isProcessing ? (
        <div className="bg-slate-900 dark:bg-slate-950 text-green-400 dark:text-green-300 p-6 rounded-2xl text-sm font-mono min-h-[150px] flex items-center justify-center border-4 border-slate-700 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Đang xử lý...</span>
          </div>
        </div>
      ) : output ? (
        <pre className="bg-slate-900 dark:bg-slate-950 text-green-400 dark:text-green-300 p-6 rounded-2xl text-sm font-mono whitespace-pre-wrap min-h-[150px] border-4 border-slate-700 dark:border-slate-800">
          {output}
        </pre>
      ) : (
        <div className="bg-slate-900 dark:bg-slate-950 text-gray-500 dark:text-gray-400 p-6 rounded-2xl text-sm font-mono min-h-[150px] flex items-center justify-center border-4 border-slate-700 dark:border-slate-800">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

interface AnalysisDisplayProps {
  processingStage: ProcessingStage;
  children: React.ReactNode;
  emptyMessage: string;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({
  processingStage,
  children,
  emptyMessage,
}) => {
  if (processingStage === "cerebras") {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center min-h-[200px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="text-muted-foreground">
              Đang phân tích bằng Cerebras AI...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (children) {
    return (
      <Card>
        <CardContent className="p-6">{children}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-8 flex items-center justify-center min-h-[200px]">
        <span className="text-muted-foreground">{emptyMessage}</span>
      </CardContent>
    </Card>
  );
};
