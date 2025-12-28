"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/forms/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { DialogHeader, DialogTitle } from "@/components/ui/feedback/dialog";
import {
  Student,
  UpdateStudentRequest,
} from "@/lib/services/api/student-management.service";

interface EditStudentFormProps {
  student: Student;
  onSubmit: (id: number, data: UpdateStudentRequest) => Promise<void>;
  onCancel: () => void;
}

export default function EditStudentForm({
  student,
  onSubmit,
  onCancel,
}: EditStudentFormProps) {
  const [formData, setFormData] = useState<UpdateStudentRequest>({
    email: student.email,
    fullName: student.fullName,
    studentId: student.studentId,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<UpdateStudentRequest>>({});

  useEffect(() => {
    // Cập nhật form data khi prop `student` thay đổi
    setFormData({
      email: student.email,
      fullName: student.fullName,
      studentId: student.studentId,
    });
  }, [student]);

  const validateForm = () => {
    const newErrors: Partial<UpdateStudentRequest> = {};

    if (!formData.email?.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.fullName?.trim()) {
      newErrors.fullName = "Họ tên là bắt buộc";
    }

    if (!formData.studentId?.trim()) {
      newErrors.studentId = "Mã sinh viên là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await onSubmit(student.id, formData);
    } catch (error) {
      console.error("Error updating student:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof UpdateStudentRequest,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Chỉnh sửa thông tin sinh viên</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Nhập email"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Họ tên</Label>
          <Input
            id="fullName"
            type="text"
            value={formData.fullName || ""}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            placeholder="Nhập họ tên đầy đủ"
            className={errors.fullName ? "border-red-500" : ""}
          />
          {errors.fullName && (
            <p className="text-sm text-red-500">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="studentId">Mã sinh viên</Label>
          <Input
            id="studentId"
            type="text"
            value={formData.studentId || ""}
            onChange={(e) => handleInputChange("studentId", e.target.value)}
            placeholder="Nhập mã sinh viên"
            className={errors.studentId ? "border-red-500" : ""}
          />
          {errors.studentId && (
            <p className="text-sm text-red-500">{errors.studentId}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </div>
      </form>
    </>
  );
}
