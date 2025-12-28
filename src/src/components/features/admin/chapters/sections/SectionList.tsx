// src/components/features/admin/chapters/sections/SectionList.tsx
"use client";

import React, { useState } from "react";
import { useChapterSections, useDeleteSection } from "@/lib/hooks/use-chapters";
import { Button } from "@/components/ui/forms";
import { Loader2, Plus, Edit, Trash2, BookOpen } from "lucide-react";
import { SectionForm } from "./SectionForm";
import { ConfirmDialog } from "@/components/ui/feedback/confirm-dialog";
import { Section } from "@/lib/services/api/chapter.service";
import { Card, CardContent } from "@/components/ui/layout";

interface SectionListProps {
  chapterId: number;
}

export function SectionList({ chapterId }: SectionListProps) {
  const {
    data: sections = [],
    isLoading,
    error,
  } = useChapterSections(chapterId);
  const deleteSectionMutation = useDeleteSection();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);

  const handleAddClick = () => {
    setEditingSection(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (section: Section) => {
    setEditingSection(section);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (section: Section) => {
    setSectionToDelete(section);
  };

  const handleDeleteConfirm = () => {
    if (sectionToDelete) {
      deleteSectionMutation.mutate({
        chapterId,
        sectionId: sectionToDelete.section_id,
      });
      setSectionToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <div className="h-9 w-32 bg-muted dark:bg-muted/50 animate-pulse rounded" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 dark:border-border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-muted dark:bg-muted/50 animate-pulse rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted dark:bg-muted/50 animate-pulse rounded" />
                  <div className="h-3 w-full bg-muted dark:bg-muted/50 animate-pulse rounded" />
                </div>
                <div className="flex gap-1">
                  <div className="h-8 w-8 bg-muted dark:bg-muted/50 animate-pulse rounded" />
                  <div className="h-8 w-8 bg-muted dark:bg-muted/50 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        Lỗi: Không thể tải danh sách section.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAddClick} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Thêm Section
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Chưa có section nào trong chương này.</p>
          <p className="text-xs mt-1">Nhấn "Thêm Section" để bắt đầu</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sections
            .sort((a, b) => a.order - b.order)
            .map((section, index) => (
              <div
                key={section.section_id}
                className="group relative border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Order Badge */}
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-md flex items-center justify-center text-sm font-semibold">
                      {section.order}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1">
                        {section.title}
                      </h4>
                      {section.content && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {section.content.replace(/<[^>]+>/g, "")}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(section)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(section)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      <SectionForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        chapterId={chapterId}
        initialData={editingSection}
        mode={editingSection ? "edit" : "create"}
        onSuccess={() => setIsFormOpen(false)}
      />

      <ConfirmDialog
        open={!!sectionToDelete}
        onOpenChange={() => setSectionToDelete(null)}
        title="Xác nhận xóa Section"
        description={`Bạn có chắc chắn muốn xóa section "${sectionToDelete?.title}"?`}
        onConfirm={handleDeleteConfirm}
        loading={deleteSectionMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
