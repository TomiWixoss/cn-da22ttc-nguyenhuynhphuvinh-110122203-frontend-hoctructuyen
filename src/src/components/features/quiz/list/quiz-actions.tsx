import Link from "next/link";
import { useRouter } from "next/navigation";
import { DoorOpen, FileText, BarChart, Eye, LineChart } from "lucide-react";
import { Button } from "@/components/ui/forms";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";
import { QuizMode } from "@/lib/types/quiz";

interface QuizActionsProps {
  quizId: number;
  status: string;
  quizMode?: QuizMode;
  onStart?: (id: number) => Promise<void>;
}

export function QuizActions({ quizId, status, quizMode }: QuizActionsProps) {
  const router = useRouter();
  const { createTeacherUrl } = useAssignmentContext();

  // Nếu là practice hoặc code_practice mode, chỉ hiển thị nút Chi tiết
  const isPracticeMode =
    quizMode === "practice" || quizMode === "code_practice";
  const isCodePractice = quizMode === "code_practice";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 w-full">
      {isCodePractice && (
        <Button
          variant="default"
          size="sm"
          title="Phân tích kết quả code practice"
          className="h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm cursor-pointer flex-1 bg-purple-500 hover:bg-purple-600 text-white border-2 border-purple-500/20"
          onClick={() =>
            router.push(
              createTeacherUrl(`/dashboard/teaching/code-analysis/${quizId}`)
            )
          }
        >
          <LineChart className="h-3.5 w-3.5 flex-shrink-0 mr-1" />
          <span className="whitespace-nowrap">Phân Tích</span>
        </Button>
      )}

      {!isPracticeMode && status === "pending" && (
        <Button
          variant="default"
          size="sm"
          title="Vào phòng chờ"
          className="h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm cursor-pointer flex-1 bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-500/20"
          is3DNoLayout={true}
          onClick={() =>
            router.push(createTeacherUrl(`/quiz-waiting-room/${quizId}`))
          }
        >
          <DoorOpen className="h-3.5 w-3.5 flex-shrink-0 mr-1" />
          <span className="whitespace-nowrap">Vào phòng</span>
        </Button>
      )}

      {!isPracticeMode && status === "active" && (
        <Button
          variant="default"
          size="sm"
          title="Theo dõi real-time"
          className="h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm cursor-pointer flex-1 bg-green-500 hover:bg-green-600 text-white border-2 border-green-500/20"
          onClick={() => router.push(`/quiz-monitor/${quizId}`)}
        >
          <Eye className="h-3.5 w-3.5 flex-shrink-0 mr-1" />
          <span className="whitespace-nowrap">Theo dõi</span>
        </Button>
      )}

      {!isPracticeMode && status === "finished" && (
        <Button
          variant="default"
          size="sm"
          title="Xem báo cáo kết quả"
          className="h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm cursor-pointer flex-1 bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-500/20"
          onClick={() =>
            router.push(
              createTeacherUrl(
                `/dashboard/reports/quiz-results?quizId=${quizId}`
              )
            )
          }
        >
          <BarChart className="h-3.5 w-3.5 flex-shrink-0 mr-1" />
          <span className="whitespace-nowrap">Báo cáo</span>
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        title="Xem chi tiết"
        className="h-8 sm:h-10 px-2 sm:px-3 text-xs sm:text-sm cursor-pointer flex-1 border-2 border-border hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
        asChild
      >
        <Link
          href={createTeacherUrl(
            `/dashboard/teaching/quizzes/detail/${quizId}`
          )}
        >
          <FileText className="h-3.5 w-3.5 flex-shrink-0 mr-1" />
          <span className="whitespace-nowrap">Chi tiết</span>
        </Link>
      </Button>
    </div>
  );
}
