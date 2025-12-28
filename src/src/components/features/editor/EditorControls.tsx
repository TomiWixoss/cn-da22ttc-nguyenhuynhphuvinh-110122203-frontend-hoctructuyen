"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import { Button } from "@/components/ui/forms";
import { Loader2, Sparkles, Code2 } from "lucide-react";
import { Judge0Language } from "@/lib/services/api/judge0.service";

interface EditorControlsProps {
  languages: Judge0Language[];
  selectedLanguageId: number | null;
  isLoadingLanguages: boolean;
  isRunning: boolean;
  onLanguageChange: (langId: string) => void;
  onRunCode: () => void;
  settingsButton?: React.ReactNode;
}

export const EditorControls: React.FC<EditorControlsProps> = ({
  languages,
  selectedLanguageId,
  isLoadingLanguages,
  isRunning,
  onLanguageChange,
  onRunCode,
  settingsButton,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
      <div className="flex-1 w-full">
        <Select
          value={selectedLanguageId?.toString()}
          onValueChange={onLanguageChange}
          disabled={isLoadingLanguages}
        >
          <SelectTrigger className="w-full rounded-xl border-2">
            <SelectValue
              placeholder={isLoadingLanguages ? "Đang tải..." : "Chọn ngôn ngữ"}
            />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.id} value={lang.id.toString()}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {settingsButton}
        <Button
          onClick={onRunCode}
          disabled={isRunning || isLoadingLanguages}
          className="rounded-xl flex-1 sm:flex-none"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang chạy...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Chạy & Phân Tích
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
