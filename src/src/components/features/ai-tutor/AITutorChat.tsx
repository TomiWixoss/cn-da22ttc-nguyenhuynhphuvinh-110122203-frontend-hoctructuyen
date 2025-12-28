"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Lightbulb,
  Code2,
  HelpCircle,
  Loader2,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/forms";
import { ScrollArea } from "@/components/ui/layout";
import { cn } from "@/lib/utils";
import aiTutorService, {
  HintResponse,
  ReviewResult,
} from "@/lib/services/api/ai-tutor.service";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AITutorChatProps {
  questionId: number;
  code: string;
  error?: string;
  className?: string;
}

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "chat" | "hint" | "review" | "explain" | "quick-help";
  isLoading?: boolean;
}

export function AITutorChat({
  questionId,
  code,
  error,
  className,
}: AITutorChatProps) {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentHintLevel, setCurrentHintLevel] = useState(1);
  const [inputMode, setInputMode] = useState<"chat" | "explain">("chat");

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadHistory();
  }, [questionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        100
      )}px`;
    }
  }, [inputValue]);

  const scrollToBottom = () => {
    // Dùng setTimeout để đảm bảo DOM đã render xong
    setTimeout(() => {
      if (scrollRef.current) {
        const viewport = scrollRef.current.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    }, 50);
  };

  const loadHistory = async () => {
    try {
      const { history } = await aiTutorService.getHistory(questionId);
      if (history?.length > 0) {
        setMessages(
          history.map((msg) => ({
            id: msg.id.toString(),
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.message,
            timestamp: new Date(msg.created_at),
            type: "chat",
          }))
        );
      }
    } catch {
      // Silent
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const addUserMessage = (
    content: string,
    type: LocalMessage["type"] = "chat"
  ) => {
    const msg: LocalMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
      type,
    };
    setMessages((prev) => [...prev, msg]);
  };

  const addLoadingMessage = () => {
    const msg: LocalMessage = {
      id: `loading-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, msg]);
    return msg.id;
  };

  const replaceLoadingMessage = (
    loadingId: string,
    content: string,
    type?: LocalMessage["type"]
  ) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === loadingId
          ? {
              ...msg,
              content,
              isLoading: false,
              type,
              id: `assistant-${Date.now()}`,
            }
          : msg
      )
    );
  };

  const removeLoadingMessage = (loadingId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== loadingId));
  };

  // Handlers
  const handleSend = async () => {
    if (isLoading || !inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    if (inputMode === "explain") {
      // Giải thích khái niệm
      await handleExplain(userMessage);
    } else {
      // Chat thường
      addUserMessage(userMessage);
      setIsLoading(true);
      const loadingId = addLoadingMessage();

      try {
        const response = await aiTutorService.chat({
          message: userMessage,
          question_id: questionId,
          code: code || undefined,
          error: error || undefined,
        });
        replaceLoadingMessage(loadingId, response.message);
      } catch (err: any) {
        removeLoadingMessage(loadingId);
        toast.error(err.message || "Không thể gửi tin nhắn");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExplain = async (concept: string) => {
    addUserMessage(`Giải thích: ${concept}`, "explain");
    setIsLoading(true);
    const loadingId = addLoadingMessage();

    try {
      const response = await aiTutorService.explain({
        concept,
        question_id: questionId,
      });
      let content = response.explanation;
      if (response.related_concepts?.length > 0) {
        content += `\n\n**Khái niệm liên quan:** ${response.related_concepts.join(
          ", "
        )}`;
      }
      replaceLoadingMessage(loadingId, content, "explain");
    } catch (err: any) {
      removeLoadingMessage(loadingId);
      toast.error(err.message || "Không thể giải thích");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHint = async () => {
    if (!code.trim()) {
      toast.error("Vui lòng nhập code trước");
      return;
    }
    setIsLoading(true);
    addUserMessage(`Xin gợi ý (Level ${currentHintLevel})`, "hint");
    const loadingId = addLoadingMessage();

    try {
      const response: HintResponse = await aiTutorService.hint({
        question_id: questionId,
        code,
        hint_level: currentHintLevel,
      });
      replaceLoadingMessage(loadingId, response.hint, "hint");
      if (currentHintLevel < response.max_hints)
        setCurrentHintLevel(currentHintLevel + 1);
    } catch (err: any) {
      removeLoadingMessage(loadingId);
      toast.error(err.message || "Không thể lấy gợi ý");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async () => {
    if (!code.trim()) {
      toast.error("Vui lòng nhập code trước");
      return;
    }
    setIsLoading(true);
    addUserMessage("Review code của tôi", "review");
    const loadingId = addLoadingMessage();

    try {
      const response = await aiTutorService.review({
        question_id: questionId,
        code,
      });
      const review = response.review;

      let content: string;
      if (typeof review === "string") {
        content = review;
      } else {
        const reviewObj = review as ReviewResult;
        content = `**${reviewObj.overall}**\n\n`;
        if (reviewObj.strengths?.length > 0)
          content += `✅ **Điểm mạnh:**\n${reviewObj.strengths
            .map((s) => `- ${s}`)
            .join("\n")}\n\n`;
        if (reviewObj.improvements?.length > 0)
          content += `💡 **Cần cải thiện:**\n${reviewObj.improvements
            .map((i) => `- ${i}`)
            .join("\n")}\n\n`;
        content += `📊 **Điểm: ${reviewObj.score}/100**`;
      }
      replaceLoadingMessage(loadingId, content, "review");
    } catch (err: any) {
      removeLoadingMessage(loadingId);
      toast.error(err.message || "Không thể review");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickHelp = async () => {
    if (!code.trim()) {
      toast.error("Vui lòng nhập code trước");
      return;
    }
    setIsLoading(true);
    const helpQuestion = error
      ? `Tôi gặp lỗi: ${error}. Hãy giúp tôi sửa code.`
      : "Hãy phân tích code của tôi và cho gợi ý cải thiện.";
    addUserMessage("Tôi cần trợ giúp", "quick-help");
    const loadingId = addLoadingMessage();

    try {
      const response = await aiTutorService.quickHelp({
        question: helpQuestion,
        question_id: questionId,
        code,
      });
      replaceLoadingMessage(loadingId, response.message, "quick-help");
    } catch (err: any) {
      removeLoadingMessage(loadingId);
      toast.error(err.message || "Không thể lấy trợ giúp");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await aiTutorService.clearHistory(questionId);
      setMessages([]);
      setCurrentHintLevel(1);
      toast.success("Đã xóa lịch sử");
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card rounded-xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">AI Tutor</h3>
            <p className="text-xs text-muted-foreground">Hỗ trợ học tập</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 border-red-200 dark:border-red-800"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Xóa
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 space-y-4">
          {messages.length === 0 ? (
            <WelcomeScreen />
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onCopy={() => copyToClipboard(msg.content, msg.id)}
                isCopied={copiedId === msg.id}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="px-4 pt-0 pb-4 space-y-0">
        {/* Quick Action Buttons - Gợi ý, Review, Trợ giúp - bọc trong khung riêng */}
        <div className="mx-2 border-t-2 border-l-2 border-r-2 border-slate-200 dark:border-slate-700 rounded-t-xl px-2 py-1.5 -mb-[1px] relative z-10">
          <div className="flex gap-1.5">
            <button
              onClick={handleHint}
              disabled={isLoading || !code.trim()}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                code.trim()
                  ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-2 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                  : "bg-muted text-muted-foreground border-2 border-transparent cursor-not-allowed opacity-50"
              )}
            >
              <Lightbulb className="h-3.5 w-3.5" />
              Gợi ý
            </button>
            <button
              onClick={handleReview}
              disabled={isLoading || !code.trim()}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                code.trim()
                  ? "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                  : "bg-muted text-muted-foreground border-2 border-transparent cursor-not-allowed opacity-50"
              )}
            >
              <Code2 className="h-3.5 w-3.5" />
              Review
            </button>
            <button
              onClick={handleQuickHelp}
              disabled={isLoading || !code.trim()}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                code.trim()
                  ? "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40"
                  : "bg-muted text-muted-foreground border-2 border-transparent cursor-not-allowed opacity-50"
              )}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              Trợ giúp
            </button>
          </div>
        </div>

        {/* Chat Input */}
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <textarea
            ref={textareaRef}
            placeholder={
              inputMode === "chat"
                ? "Nhập câu hỏi..."
                : "Nhập khái niệm cần giải thích..."
            }
            style={{ outline: "none", boxShadow: "none" }}
            className="w-full resize-none bg-transparent px-4 pt-3 pb-2 text-sm placeholder:text-muted-foreground min-h-[40px] max-h-[120px] overflow-y-auto border-0 ring-0 focus:ring-0 focus:outline-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
          />

          {/* Bottom row */}
          <div className="flex items-center justify-between px-3 pb-3">
            {/* Mode Toggle - Chat / Giải thích */}
            <div className="flex rounded-lg border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
              <button
                onClick={() => setInputMode("chat")}
                disabled={isLoading}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5",
                  inputMode === "chat"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted"
                )}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Hỏi
              </button>
              <button
                onClick={() => setInputMode("explain")}
                disabled={isLoading}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 border-l-2 border-slate-200 dark:border-slate-700",
                  inputMode === "explain"
                    ? "bg-green-600 text-white"
                    : "bg-background text-muted-foreground hover:bg-muted"
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Giải thích
              </button>
            </div>

            {/* Send Button */}
            <Button
              size="icon"
              className="h-9 w-9 rounded-xl shrink-0"
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              is3DNoLayout={true}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Warning text */}
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Câu hỏi của bạn sẽ được lưu để phân tích kết quả học tập.
        </p>
      </div>
    </div>
  );
}

// ==================== Components ====================

function WelcomeScreen() {
  return (
    <div className="py-8 px-2">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Xin chào!</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Tôi sẵn sàng hỗ trợ bạn học tập
        </p>
        <div className="text-xs text-muted-foreground space-y-2">
          <p className="flex items-center justify-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span>Nhấn Gợi ý / Review / Trợ giúp khi có code</span>
          </p>
          <p className="flex items-center justify-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span>Hoặc nhập câu hỏi trực tiếp</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
}: {
  message: LocalMessage;
  onCopy: () => void;
  isCopied: boolean;
}) {
  const isUser = message.role === "user";
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = async (e: React.MouseEvent, code: string) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (message.isLoading) {
    return (
      <div className="flex items-center gap-1.5 py-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.15s]" />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.3s]" />
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-sm text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
            ul: ({ children }) => (
              <ul className="mb-3 space-y-1 list-disc pl-5">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-3 space-y-1 list-decimal pl-5">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="break-words pl-1">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-foreground">
                {children}
              </strong>
            ),
            h1: ({ children }) => (
              <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-bold mb-2 mt-3 first:mt-0">
                {children}
              </h3>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-3">
                {children}
              </blockquote>
            ),
            code: ({ className, children }) => {
              const isBlock = className?.includes("language-");
              const codeString = String(children).replace(/\n$/, "");

              if (isBlock) {
                const language = className?.replace("language-", "") || "";
                return (
                  <div className="relative my-3 group/code max-w-full overflow-hidden rounded-lg">
                    {language && (
                      <div className="bg-slate-800 text-slate-400 text-xs px-3 py-1 border-b border-slate-700">
                        {language}
                      </div>
                    )}
                    <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 overflow-x-auto text-xs">
                      <code className="whitespace-pre-wrap break-words">
                        {children}
                      </code>
                    </pre>
                    <button
                      onClick={(e) => copyCode(e, codeString)}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-700 hover:bg-slate-600 opacity-0 group-hover/code:opacity-100 transition-opacity"
                    >
                      {copiedCode === codeString ? (
                        <Check className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-slate-300" />
                      )}
                    </button>
                  </div>
                );
              }
              return (
                <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs break-words font-mono">
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <div className="max-w-full overflow-hidden">{children}</div>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {children}
              </a>
            ),
            hr: () => (
              <hr className="my-4 border-slate-200 dark:border-slate-700" />
            ),
            table: ({ children }) => (
              <div className="my-3 overflow-x-auto">
                <table className="min-w-full border-collapse border border-slate-300 dark:border-slate-600 text-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-slate-100 dark:bg-slate-800">
                {children}
              </thead>
            ),
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => (
              <tr className="border-b border-slate-300 dark:border-slate-600">
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className="px-3 py-2 text-left font-semibold border border-slate-300 dark:border-slate-600">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 border border-slate-300 dark:border-slate-600">
                {children}
              </td>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default AITutorChat;
