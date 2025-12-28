"use client";

import { useState } from "react";
import { Button } from "@/components/ui/forms/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAddStudentToCourse } from "@/lib/hooks/use-teaching";

interface StudentEnrollmentDialogProps {
  courseId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StudentEnrollmentDialog({
  courseId,
  onSuccess,
  onCancel,
}: StudentEnrollmentDialogProps) {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);

  // Use TanStack Query mutation
  const enrollStudent = useAddStudentToCourse();

  const handleEnrollById = async () => {
    if (!studentId.trim()) {
      toast.error("Vui lòng nhập ID sinh viên");
      return;
    }

    try {
      setLoading(true);

      await enrollStudent.mutateAsync({
        courseId,
        studentId: parseInt(studentId),
      });

      // Success is handled by the mutation hook
      onSuccess();
    } catch (error) {
      console.error("Error enrolling student:", error);
      // Error is handled by the mutation hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Lưu ý:</strong> Hiện tại cần nhập ID sinh viên để đăng ký. Bạn
          có thể tìm ID sinh viên từ danh sách sinh viên đã tạo hoặc từ dữ liệu
          import.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="studentId">ID Sinh viên</Label>
        <Input
          id="studentId"
          type="number"
          placeholder="Nhập ID sinh viên (VD: 123)"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          ID sinh viên là số nguyên duy nhất trong hệ thống
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button
          onClick={handleEnrollById}
          disabled={loading || !studentId.trim()}
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
          <UserPlus className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-2">
          Các cách khác để thêm sinh viên:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            • Sử dụng chức năng "Import Excel" để thêm nhiều sinh viên cùng lúc
          </li>
          <li>
            • Tạo sinh viên mới bằng nút "Thêm Sinh viên" trước khi đăng ký
          </li>
          <li>• Sử dụng "Smart Import & Enroll" để tạo và đăng ký tự động</li>
        </ul>
      </div>
    </div>
  );
}
