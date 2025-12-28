"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  Users,
  ArrowLeft,
} from "lucide-react";
import { Question } from "@/lib/types/quiz";
import { cn } from "@/lib/utils";
import type { ChoiceStatsData } from "@/lib/types/answer-choice-stats";
import { MediaViewer } from "@/components/shared/MediaViewer";

const answerIcons = [
  "/kenney_new-platformer-pack-1.0/Sprites/Tiles/Default/hud_player_green.png",
  "/kenney_new-platformer-pack-1.0/Sprites/Tiles/Default/hud_player_yellow.png",
  "/kenney_new-platformer-pack-1.0/Sprites/Tiles/Default/hud_player_pink.png",
  "/kenney_new-platformer-pack-1.0/Sprites/Tiles/Default/hud_player_beige.png",
];

const QuestionRenderer = ({ text }: { text: string }) => {
  const parts = useMemo(
    () => text.split(/(<script>[\s\S]*?<\/script>|<code>[\s\S]*?<\/code>)/),
    [text]
  );
  return (
    <div className="text-xl md:text-2xl font-extrabold leading-tight text-sky-800">
      {parts.map((part, index) => {
        if (part.startsWith("<script>") || part.startsWith("<code>")) {
          const codeContent = part.replace(/<\/?(script|code)>/g, "");
          return (
            <pre
              key={index}
              className="bg-slate-800 text-white p-4 rounded-lg my-3 font-mono text-left text-sm whitespace-pre-wrap overflow-x-auto"
            >
              <code>{codeContent}</code>
            </pre>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

interface QuizObstacleDialogProps {
  isVisible: boolean;
  question: Question;
  onAnswer: (answerId: number, isCorrect: boolean) => void;
  gameMode: "practice" | "assessment";
  choiceStats: ChoiceStatsData | null;
}

export const QuizObstacleDialog: React.FC<QuizObstacleDialogProps> = ({
  isVisible,
  question,
  onAnswer,
  gameMode,
  choiceStats,
}) => {
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  // THAY ĐỔI 1: Thêm state để quản lý việc hiển thị gợi ý
  const [isShowingHint, setIsShowingHint] = useState(false);

  useEffect(() => {
    setSelectedAnswerId(null);
    setIsAnswered(false);
    // Reset lại view gợi ý mỗi khi có câu hỏi mới
    setIsShowingHint(false);
  }, [question.question_id]);

  const handleAnswerClick = (answerId: number, isCorrect: boolean) => {
    if (isAnswered) return;
    setSelectedAnswerId(answerId);
    setIsAnswered(true);
    setTimeout(() => {
      onAnswer(answerId, isCorrect);
    }, 2000);
  };

  // =======================================================================
  // THAY ĐỔI: Cập nhật logic getAnswerState
  // =======================================================================
  const getAnswerState = (answerId: number, isCorrect: boolean) => {
    // Khi chưa trả lời, tất cả đều là mặc định
    if (!isAnswered) {
      return "default";
    }

    // Nếu đây là đáp án người dùng đã chọn...
    if (selectedAnswerId === answerId) {
      // ...thì hiển thị nó là đúng hay sai.
      return isCorrect ? "correct" : "incorrect";
    }

    // Đối với tất cả các đáp án khác (không được chọn), chỉ vô hiệu hóa chúng.
    // Không tiết lộ đáp án nào là đúng.
    return "disabled";
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 p-4 flex justify-center pointer-events-none"
        >
          {/* THAY ĐỔI 2: Thêm class `relative` để định vị nút Gợi ý */}
          <div className="relative w-full max-w-4xl bg-gradient-to-b from-sky-200 to-sky-100/90 backdrop-blur-sm border-4 border-b-8 border-sky-400 rounded-2xl p-6 pointer-events-auto">
            {/* THAY ĐỔI 3: Nút Gợi ý mới, chỉ hiển thị ở chế độ luyện tập và khi chưa xem gợi ý */}
            {gameMode === "practice" &&
              question.explanation &&
              !isShowingHint &&
              !isAnswered && (
                <motion.button
                  onClick={() => setIsShowingHint(true)}
                  className="absolute top-4 right-4 z-20 px-4 py-2 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Gợi ý
                </motion.button>
              )}

            <AnimatePresence mode="wait">
              {isShowingHint ? (
                // THAY ĐỔI 4: Giao diện hiển thị Gợi ý
                <motion.div
                  key="hint-view"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="flex items-center mb-4">
                    <button
                      onClick={() => setIsShowingHint(false)}
                      className="flex items-center gap-2 text-sky-700 font-bold hover:text-sky-900 transition-colors p-2 -ml-2 rounded-lg"
                    >
                      <ArrowLeft className="w-6 h-6" />
                      <span>Quay lại câu hỏi</span>
                    </button>
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-sky-800 mb-3">
                      Gợi ý
                    </h2>
                    <p className="text-lg text-slate-700 bg-sky-100 p-4 rounded-lg">
                      {question.explanation}
                    </p>
                  </div>
                </motion.div>
              ) : (
                // Giao diện Câu hỏi & Đáp án (code gốc)
                <motion.div
                  key="question-view"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="mb-4 text-center">
                    <div className="text-sm text-sky-700 font-bold mb-2 flex items-center justify-center gap-2">
                      <HelpCircle className="w-5 h-5 mr-1" />
                      <span>CÂU HỎI CHƯỚNG NGẠI VẬT</span>
                      {/* Xóa bỏ Tooltip cũ */}
                    </div>
                    <QuestionRenderer text={question.question_text} />
                    <MediaViewer
                      mediaFiles={question.MediaFiles}
                      ownerType="question"
                      ownerId={question.question_id}
                      className="flex flex-wrap gap-3 mt-4 justify-center"
                      imageClassName="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.answers.map((answer, index) => {
                      // Đảm bảo answer_id hợp lệ
                      const answerId = answer.answer_id || index;
                      const state = getAnswerState(answerId, answer.iscorrect);
                      const stats = choiceStats?.choice_stats?.[answerId];
                      const showStats = false;
                      return (
                        <motion.div
                          key={`answer-${question.question_id}-${answerId}`}
                          id={`quiz-answer-${answerId}`}
                          data-answer-id={answerId}
                          data-testid={`answer-option-${index}`}
                          role="button"
                          aria-label={`Answer option ${index + 1}: ${
                            answer.answer_text
                          }`}
                          tabIndex={state === "disabled" ? -1 : 0}
                          onClick={() =>
                            handleAnswerClick(answerId, answer.iscorrect)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleAnswerClick(answerId, answer.iscorrect);
                            }
                          }}
                          className={cn(
                            "relative flex items-center p-3 rounded-xl border-2 border-b-4 transition-all duration-200 cursor-pointer overflow-hidden",
                            state === "default" &&
                              "bg-white/90 border-slate-300 hover:border-sky-500 hover:bg-white active:border-b-2 active:mt-[2px]",
                            state === "correct" &&
                              "border-green-500 bg-green-100",
                            state === "incorrect" &&
                              "border-red-500 bg-red-100",
                            state === "disabled" &&
                              "bg-slate-200 border-slate-300 opacity-70 cursor-not-allowed"
                          )}
                          whileHover={
                            state === "default" ? { scale: 1.03 } : {}
                          }
                          animate={
                            state === "incorrect"
                              ? { x: [0, -4, 4, -4, 4, 0] }
                              : {}
                          }
                          transition={
                            state === "incorrect" ? { duration: 0.4 } : {}
                          }
                        >
                          {showStats && stats && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stats.percentage}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              className="absolute inset-0 bg-sky-300/60"
                            />
                          )}

                          <div className="relative z-10 flex items-center w-full gap-4">
                            <img
                              src={answerIcons[index % answerIcons.length]}
                              alt={`Icon ${index + 1}`}
                              className="w-12 h-12 object-contain shrink-0"
                            />
                            <div className="grow">
                              <span className="font-semibold text-slate-800 block">
                                {answer.answer_text}
                              </span>
                              <MediaViewer
                                mediaFiles={question.MediaFiles}
                                ownerType="answer"
                                ownerId={answer.answer_id}
                                className="flex flex-wrap gap-2 mt-2"
                                imageClassName="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
                              />
                            </div>

                            <AnimatePresence>
                              {isAnswered && (
                                <motion.div
                                  className="flex items-center gap-2 shrink-0"
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                >
                                  {showStats && stats && (
                                    <div className="flex items-center gap-1.5 text-sky-800 font-bold bg-sky-200/90 px-2 py-1 rounded-full text-sm">
                                      <Users size={14} />
                                      <span>{stats.count}</span>
                                    </div>
                                  )}
                                  {state === "correct" && (
                                    <CheckCircle className="w-7 h-7 text-green-600" />
                                  )}
                                  {state === "incorrect" && (
                                    <XCircle className="w-7 h-7 text-red-600" />
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
