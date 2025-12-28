// frontend/src/components/features/common/subject-select.tsx
"use client";

import React, { useState, useEffect } from "react";
import { SubjectService } from "@/lib/services/api";
import type { Subject } from "@/lib/types/subject";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";

interface SubjectSelectProps {
  value?: number;
  onValueChange: (value: number | undefined) => void;
  placeholder?: string;
  allowClear?: boolean;
  className?: string;
}

export function SubjectSelect({
  value,
  onValueChange,
  placeholder = "Chọn môn học",
  allowClear = true,
  className,
}: SubjectSelectProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await SubjectService.getAllSubjects(1, 100); // Lấy nhiều môn học
        if (response.success) {
          setSubjects(response.data.subjects);
        }
      } catch (error) {
        console.error("❌ [SubjectSelect] Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  return (
    <Select
      value={value ? value.toString() : ""}
      onValueChange={(val) => {
        if (val === "all" || val === "") {
          onValueChange(undefined);
        } else {
          const numVal = parseInt(val);
          onValueChange(numVal);
        }
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={loading ? "Đang tải..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowClear && <SelectItem value="all">Tất cả môn học</SelectItem>}
        {subjects.map((subject) => (
          <SelectItem
            key={subject.subject_id}
            value={subject.subject_id.toString()}
          >
            {subject.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
