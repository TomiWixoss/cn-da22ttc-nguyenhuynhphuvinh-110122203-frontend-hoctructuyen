"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import { Button } from "@/components/ui/forms/button";
import { MoreHorizontal, Edit, Key, Trash2 } from "lucide-react";
import EditStudentForm from "./edit-student-form";
import { ResetStudentPasswordDialog } from "./reset-student-password-dialog";
import { Dialog, DialogContent } from "@/components/ui/feedback/dialog";
import {
  Student,
  UpdateStudentRequest,
} from "@/lib/services/api/student-management.service";

interface StudentActionsProps {
  student: any; // CourseStudent from API
  onEdit: (student: any) => void;
  onDelete: (studentId: number) => void;
  onUpdate: (id: number, data: UpdateStudentRequest) => Promise<void>;
}

export function StudentActions({
  student,
  onEdit,
  onDelete,
  onUpdate,
}: StudentActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditOpen(true);
  };

  const handleResetPasswordClick = () => {
    setIsResetPasswordOpen(true);
  };

  const handleDeleteClick = () => {
    onDelete(student.user_id);
  };

  // Convert CourseStudent to Student format for editing
  const studentForEdit: Student = {
    id: student.user_id,
    username: student.student_code || "",
    email: student.email || "",
    fullName: student.student_name || "",
    studentId: student.student_code || "",
    role: student.role || "student",
    createdAt: student.enrollment_date || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEditClick}>
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleResetPasswordClick}>
            <Key className="mr-2 h-4 w-4" />
            Đổi mật khẩu
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDeleteClick}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <EditStudentForm
            student={studentForEdit}
            onSubmit={async (id, data) => {
              await onUpdate(id, data);
              setIsEditOpen(false);
            }}
            onCancel={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ResetStudentPasswordDialog
        student={studentForEdit}
        open={isResetPasswordOpen}
        onOpenChange={setIsResetPasswordOpen}
      />
    </>
  );
}
