"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import judge0Service, {
  Judge0Language,
  SubmissionResult,
} from "@/lib/services/api/judge0.service";
// Code submission service not used in this editor
import {
  getLanguageExtensionByName,
  isLanguageSupported,
} from "@/lib/utils/codemirror-languages";
import {
  getLatestLanguages,
  mapLanguageToKeyword,
} from "@/lib/utils/language-utils";
import { defaultCode, findDefaultCodeKey } from "./constants";
import { ProcessingStage } from "./types";

export const useCodeEditor = () => {
  const [languages, setLanguages] = useState<Judge0Language[]>([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(
    null
  );
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);
  const [judge0Output, setJudge0Output] = useState<string>("");
  // Gemini analysis removed - not used in this editor
  const [processingStage, setProcessingStage] =
    useState<ProcessingStage>("idle");
  const [fontSize, setFontSize] = useState(16);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(false);
  const [tabSize, setTabSize] = useState(4);
  const [autoCloseBrackets, setAutoCloseBrackets] = useState(true);

  // Lấy danh sách ngôn ngữ khi component được mount
  useEffect(() => {
    const fetchAndProcessLanguages = async () => {
      try {
        const langList = await judge0Service.getLanguages();
        const supportedLangs = langList.filter((lang) =>
          isLanguageSupported(lang.name)
        );

        const latestSupportedLangs = getLatestLanguages(supportedLangs);
        setLanguages(latestSupportedLangs);

        const defaultLang = latestSupportedLangs.find((l) =>
          l.name.toLowerCase().includes("javascript")
        );
        if (defaultLang) {
          setSelectedLanguageId(defaultLang.id);
          const key = findDefaultCodeKey(defaultLang.name);
          setCode(
            key ? defaultCode[key] : `// Sẵn sàng code ${defaultLang.name}`
          );
        } else if (latestSupportedLangs.length > 0) {
          setSelectedLanguageId(latestSupportedLangs[0].id);
          const key = findDefaultCodeKey(latestSupportedLangs[0].name);
          setCode(
            key
              ? defaultCode[key]
              : `// Sẵn sàng code ${latestSupportedLangs[0].name}`
          );
        }
      } catch (error) {
        toast.error("Không thể tải danh sách ngôn ngữ từ Judge0.");
        console.error(error);
      } finally {
        setIsLoadingLanguages(false);
      }
    };
    fetchAndProcessLanguages();
  }, []);

  const codeMirrorExtensions = useMemo(() => {
    const selectedLang = languages.find((l) => l.id === selectedLanguageId);
    if (selectedLang) {
      return getLanguageExtensionByName(selectedLang.name);
    }
    return [];
  }, [selectedLanguageId, languages]);

  const handleLanguageChange = (langIdStr: string) => {
    const langId = parseInt(langIdStr, 10);
    const selectedLang = languages.find((l) => l.id === langId);
    setSelectedLanguageId(langId);
    if (selectedLang) {
      const key = findDefaultCodeKey(selectedLang.name);
      setCode(key ? defaultCode[key] : `// Sẵn sàng code ${selectedLang.name}`);
      setJudge0Output("");
      setProcessingStage("idle");
    }
  };

  const formatJudge0Output = (result: SubmissionResult): string => {
    let cmdOutput = `> Đang thực thi code...\n\n`;
    cmdOutput += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    cmdOutput += `Trạng thái: ${result.status.description}\n`;
    if (result.time) cmdOutput += `Thời gian thực thi: ${result.time}s\n`;
    if (result.memory) cmdOutput += `Bộ nhớ sử dụng: ${result.memory} KB\n`;
    cmdOutput += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (result.compile_output) {
      cmdOutput += `❌ LỖI BIÊN DỊCH:\n${result.compile_output}\n\n`;
    }
    if (result.stderr) {
      cmdOutput += `⚠️  LỖI THỰC THI:\n${result.stderr}\n\n`;
    }
    if (result.stdout) {
      cmdOutput += `✅ KẾT QUẢ:\n${result.stdout}\n`;
    }

    if (!result.compile_output && !result.stderr && !result.stdout) {
      cmdOutput += `ℹ️  Chương trình chạy thành công nhưng không có output.\n`;
    }

    return cmdOutput;
  };

  const formatErrorOutput = (errorMessage: string): string => {
    let errorOutput = `> Đang thực thi code...\n\n`;
    errorOutput += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    errorOutput += `❌ LỖI HỆ THỐNG\n`;
    errorOutput += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    errorOutput += `${errorMessage}\n\n`;
    errorOutput += `Vui lòng kiểm tra lại code hoặc thử lại sau.`;
    return errorOutput;
  };

  const handleRunCode = async () => {
    if (!selectedLanguageId) {
      toast.error("Vui lòng chọn một ngôn ngữ.");
      return;
    }

    setIsRunning(true);
    setJudge0Output("");
    setProcessingStage("judge0");

    let hasJudge0Success = false;

    try {
      // 1. Thực thi code trên Judge0
      const submission = await judge0Service.createSubmission(
        selectedLanguageId,
        code
      );
      let judge0Result: SubmissionResult | null = null;

      const judge0Poll = new Promise<SubmissionResult>((resolve, reject) => {
        const intervalId = setInterval(async () => {
          try {
            const result = await judge0Service.getSubmissionResult(
              submission.token
            );
            if (result.status.id > 2) {
              clearInterval(intervalId);
              resolve(result);
            }
          } catch (err) {
            clearInterval(intervalId);
            reject(err);
          }
        }, 2000);
        setTimeout(() => {
          clearInterval(intervalId);
          reject(new Error("Judge0 không phản hồi kịp thời."));
        }, 20000);
      });

      judge0Result = await judge0Poll;
      setJudge0Output(formatJudge0Output(judge0Result));
      hasJudge0Success = true;
      setProcessingStage("complete");
      toast.success("Chạy code thành công!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Đã có lỗi xảy ra.";

      setJudge0Output(formatErrorOutput(errorMessage));
      setProcessingStage("idle");
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setIsRunning(false);
    }
  };

  return {
    languages,
    selectedLanguageId,
    code,
    setCode,
    isRunning,
    isLoadingLanguages,
    judge0Output,
    processingStage,
    codeMirrorExtensions,
    handleLanguageChange,
    handleRunCode,
    fontSize,
    setFontSize,
    lineNumbers,
    setLineNumbers,
    wordWrap,
    setWordWrap,
    tabSize,
    setTabSize,
    autoCloseBrackets,
    setAutoCloseBrackets,
  };
};
