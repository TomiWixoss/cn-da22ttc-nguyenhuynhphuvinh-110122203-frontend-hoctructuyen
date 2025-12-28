"use client";

import React, { useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { FileUp, XCircle, Video, Music } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { QuestionFormData } from "@/lib/validations/question";
import type {
  QuestionType,
  Level,
  LearningOutcome,
  MediaFile,
} from "@/lib/types/question";

// Component để hiển thị media
const MediaDisplay = ({
  file,
  onRemove,
}: {
  file: MediaFile;
  onRemove: () => void;
}) => (
  <div className="relative group w-24 h-24 border rounded-md p-1">
    {file.file_type.startsWith("image") && (
      <img
        src={file.file_url}
        alt={file.alt_text || "Media"}
        className="w-full h-full object-cover rounded"
      />
    )}
    {file.file_type.startsWith("video") && (
      <Video className="w-12 h-12 text-muted-foreground" />
    )}
    {file.file_type.startsWith("audio") && (
      <Music className="w-12 h-12 text-muted-foreground" />
    )}
    <Button
      variant="destructive"
      size="icon"
      className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100"
      onClick={onRemove}
    >
      <XCircle className="h-4 w-4" />
    </Button>
  </div>
);

// Component để hiển thị file preview
const FilePreview = ({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) => {
  const url = URL.createObjectURL(file);
  return (
    <div className="relative group w-24 h-24 border rounded-md p-1">
      {file.type.startsWith("image") && (
        <img
          src={url}
          alt={file.name}
          className="w-full h-full object-cover rounded"
        />
      )}
      {file.type.startsWith("video") && (
        <Video className="w-12 h-12 text-muted-foreground" />
      )}
      {file.type.startsWith("audio") && (
        <Music className="w-12 h-12 text-muted-foreground" />
      )}
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100"
        onClick={onRemove}
      >
        <XCircle className="h-4 w-4" />
      </Button>
    </div>
  );
};

interface QuestionBasicInfoProps {
  form: UseFormReturn<QuestionFormData>;
  mode: "create" | "edit";
  questionTypes: QuestionType[];
  levels: Level[];
  learningOutcomes: LearningOutcome[];
  questionMedia: File | null;
  existingMedia: MediaFile[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveNewFile: () => void;
  onRemoveExistingMedia: (mediaId: number) => void;
}

export function QuestionBasicInfo({
  form,
  mode,
  questionTypes,
  levels,
  learningOutcomes,
  questionMedia,
  existingMedia,
  onFileChange,
  onRemoveNewFile,
  onRemoveExistingMedia,
}: QuestionBasicInfoProps) {
  const questionMediaInputRef = useRef<HTMLInputElement>(null);
  const isCodeExercise = form.watch("question_type_id") === 4;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Thông tin câu hỏi" : "Chỉnh sửa câu hỏi"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Nhập thông tin cơ bản cho câu hỏi mới"
            : "Cập nhật thông tin câu hỏi"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Content */}
        <FormField
          control={form.control}
          name="question_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung câu hỏi *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập nội dung câu hỏi..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Question Type and Level Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="question_type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại câu hỏi *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại câu hỏi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {questionTypes.map((type) => (
                      <SelectItem
                        key={type.question_type_id}
                        value={type.question_type_id.toString()}
                      >
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="level_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Độ khó *</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn độ khó" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem
                        key={level.level_id}
                        value={level.level_id.toString()}
                      >
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Learning Outcome */}
        <FormField
          control={form.control}
          name="lo_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chuẩn đầu ra *</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
                disabled={learningOutcomes.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        learningOutcomes.length === 0
                          ? "Không có chuẩn đầu ra nào"
                          : "Chọn chuẩn đầu ra"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {learningOutcomes.length === 0 ? (
                    <SelectItem value="-1" disabled>
                      Không có chuẩn đầu ra nào cho môn học này
                    </SelectItem>
                  ) : (
                    learningOutcomes.map((lo) => (
                      <SelectItem key={lo.lo_id} value={lo.lo_id.toString()}>
                        {lo.name}
                        {lo.description ? ` - ${lo.description}` : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
              {learningOutcomes.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Môn học này chưa có chuẩn đầu ra nào. Vui lòng liên hệ quản
                  trị viên để thêm chuẩn đầu ra.
                </p>
              )}
            </FormItem>
          )}
        />

        {/* Explanation */}
        <FormField
          control={form.control}
          name="explanation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giải thích</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập giải thích cho câu hỏi..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Media Upload - CHỈ CHO NON-CODE-EXERCISE */}
        {!isCodeExercise && (
          <FormItem>
            <FormLabel>Media cho câu hỏi (Tùy chọn - Tối đa 1 file)</FormLabel>
            <div className="flex items-center gap-4">
              {existingMedia
                .filter((f) => f.owner_type === "question")
                .map((file) => (
                  <MediaDisplay
                    key={file.media_id}
                    file={file}
                    onRemove={() => onRemoveExistingMedia(file.media_id)}
                  />
                ))}
              {questionMedia && (
                <FilePreview file={questionMedia} onRemove={onRemoveNewFile} />
              )}
              {!existingMedia.some((f) => f.owner_type === "question") &&
                !questionMedia && (
                  <FormControl>
                    <Button type="button" variant="outline" asChild>
                      <label>
                        <FileUp className="h-4 w-4 mr-2" />
                        Tải lên
                        <Input
                          ref={questionMediaInputRef}
                          type="file"
                          className="sr-only"
                          onChange={onFileChange}
                        />
                      </label>
                    </Button>
                  </FormControl>
                )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      </CardContent>
    </Card>
  );
}
