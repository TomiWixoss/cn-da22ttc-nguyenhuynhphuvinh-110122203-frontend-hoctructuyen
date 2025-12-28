"use client";

import React from "react";
import { Sparkles, Loader2, Info } from "lucide-react";
import { Badge } from "@/components/ui/feedback";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/forms/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/feedback/tooltip";
import { useAvailableModels } from "@/lib/hooks/use-available-models";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
}) => {
  const { models, loading, error } = useAvailableModels();

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Đang tải models...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-600">Lỗi: {error}</div>;
  }

  // Group models by provider
  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, typeof models>);

  const getModelBadge = (modelId: string) => {
    // Cerebras GPT-OSS-120B - Model mặc định với reasoning cao
    if (
      modelId.includes("gpt-oss-120b") &&
      !modelId.includes("openrouter") &&
      !modelId.includes("groq")
    ) {
      return (
        <Badge className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 text-xs font-bold px-2 py-0.5 flex items-center gap-1 shrink-0">
          <Sparkles className="h-3 w-3" />
          REASONING
        </Badge>
      );
    }
    // Groq fallback model
    if (modelId.includes("groq/")) {
      return (
        <Badge className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-700 text-xs font-bold px-2 py-0.5 shrink-0">
          FALLBACK
        </Badge>
      );
    }
    // OpenRouter free models
    if (
      modelId.includes("openrouter") ||
      modelId.includes("deepseek") ||
      modelId.includes("kat-coder")
    ) {
      return (
        <Badge className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 text-xs font-bold px-2 py-0.5 shrink-0">
          FREE
        </Badge>
      );
    }
    return null;
  };

  const getModelDescription = (modelId: string) => {
    // Cerebras GPT-OSS-120B
    if (
      modelId.includes("gpt-oss-120b") &&
      !modelId.includes("openrouter") &&
      !modelId.includes("groq")
    ) {
      return "Reasoning cao, phân tích sâu và chính xác";
    }
    // Groq fallback
    if (modelId.includes("groq/")) {
      return "Dùng khi Cerebras bị rate limit, reasoning cao";
    }
    // OpenRouter models
    if (modelId.includes("openrouter/openai/gpt-oss-120b")) {
      return "Backup model, miễn phí qua OpenRouter";
    }
    if (modelId.includes("deepseek")) {
      return "Model mới nhất, miễn phí";
    }
    if (modelId.includes("kat-coder")) {
      return "Chuyên về code, miễn phí";
    }
    return "";
  };

  return (
    <div className="flex items-center gap-2 min-w-0 flex-1 max-w-full overflow-hidden">
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <label className="text-sm font-bold text-purple-700 dark:text-purple-300 hidden sm:inline">
            AI Model
          </label>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-1.5 rounded-md hover:bg-muted transition-colors cursor-help">
                <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-popover border-2 shadow-lg">
              <p className="text-sm font-medium mb-1">
                Chọn mô hình AI phân tích
              </p>
              <p className="text-xs text-muted-foreground">
                Mặc định: Cerebras GPT-OSS-120B (reasoning cao). Các model
                OpenRouter miễn phí.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Select
        value={selectedModel || "default"}
        onValueChange={(value) =>
          onModelChange(value === "default" ? "" : value)
        }
      >
        <SelectTrigger className="min-w-0 flex-1 max-w-md border-2 border-slate-300 dark:border-slate-600 hover:border-purple-500 dark:hover:border-purple-400 bg-background transition-colors h-10">
          <span className="truncate text-sm">
            {selectedModel
              ? models.find((m) => m.id === selectedModel)?.name ||
                selectedModel
              : "Mặc định (Cerebras GPT-OSS-120B)"}
          </span>
        </SelectTrigger>
        <SelectContent className="max-h-[400px] w-[520px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700">
          <SelectItem
            value="default"
            className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 py-3"
            textValue="Mặc định (Cerebras GPT-OSS-120B)"
          >
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                  Mặc định (Cerebras GPT-OSS-120B)
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Reasoning cao, phân tích sâu và chính xác
                </span>
              </div>
              <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 text-xs font-bold px-2 py-0.5 shrink-0">
                ĐỀ XUẤT
              </Badge>
            </div>
          </SelectItem>
          {Object.entries(groupedModels).map(([provider, providerModels]) => (
            <React.Fragment key={provider}>
              <div className="px-2 py-2 mt-2 text-xs font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 uppercase tracking-wider border-t border-b border-slate-200 dark:border-slate-700">
                {provider}
              </div>
              {providerModels.map((model) => (
                <SelectItem
                  key={model.id}
                  value={model.id}
                  className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 py-3"
                  textValue={model.name}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {model.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {getModelDescription(model.id)}
                      </span>
                    </div>
                    {getModelBadge(model.id)}
                  </div>
                </SelectItem>
              ))}
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
