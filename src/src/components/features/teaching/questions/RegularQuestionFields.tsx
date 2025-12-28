"use client";

import React, { useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { Plus, Trash2, RotateCcw, FileUp, XCircle } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
} from "@/components/ui/forms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { QuestionFormData } from "@/lib/validations/question";
import type { MediaFile } from "@/lib/types/question";

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

interface RegularQuestionFieldsProps {
  form: UseFormReturn<QuestionFormData>;
  mode: "create" | "edit";
  fields: any[];
  append: (value: any) => void;
  remove: (index: number) => void;
  existingMedia: MediaFile[];
  answerMedia: Record<number, File | null>;
  mediaToRemove: number[];
  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    forAnswerIndex?: number
  ) => void;
  onRemoveNewFile: (forAnswerIndex?: number) => void;
  onRemoveExistingMedia: (mediaId: number, forAnswerIndex?: number) => void;
}

export function RegularQuestionFields({
  form,
  mode,
  fields,
  append,
  remove,
  existingMedia,
  answerMedia,
  mediaToRemove,
  onFileChange,
  onRemoveNewFile,
  onRemoveExistingMedia,
}: RegularQuestionFieldsProps) {
  const answerMediaInputRefs = useRef<Record<number, HTMLInputElement | null>>(
    {}
  );

  const removeAnswer = (index: number) => {
    const activeAnswers = fields.filter((f) => !f._toDelete);
    if (activeAnswers.length > 2) {
      if (mode === "create") {
        remove(index);
      } else {
        const answer = fields[index];
        if (answer._isNew) {
          remove(index);
        } else {
          form.setValue(`answers.${index}._toDelete`, true);
        }
      }
    }
  };

  const restoreAnswer = (index: number) => {
    form.setValue(`answers.${index}._toDelete`, false);
  };

  const addAnswer = () => {
    append({
      text: "",
      iscorrect: false,
      _isNew: true,
      _toDelete: false,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cấu hình câu trả lời</CardTitle>
        <CardDescription>
          Thiết lập các câu trả lời cho câu hỏi. Phải có đúng 1 câu trả lời
          đúng.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Answers Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border rounded-lg">
            <thead>
              <tr className="bg-muted/40">
                <th className="border border-border px-4 py-3 text-center font-medium text-foreground w-16">
                  STT
                </th>
                <th className="border border-border px-4 py-3 text-left font-medium text-foreground">
                  Nội dung câu trả lời
                </th>
                <th className="border border-border px-4 py-3 text-center font-medium text-foreground w-32">
                  Đáp án đúng
                </th>
                <th className="border border-border px-4 py-3 text-center font-medium text-foreground w-32">
                  Media
                </th>
                <th className="border border-border px-4 py-3 text-center font-medium text-foreground w-24">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const isDeleted = field._toDelete;
                return (
                  <tr
                    key={field.id}
                    className={`hover:bg-muted/20 ${
                      isDeleted ? "bg-red-50 dark:bg-red-950/30 opacity-50" : ""
                    }`}
                  >
                    <td className="border border-border px-4 py-3 text-center">
                      <span className="font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                    </td>
                    <td className="border border-border px-4 py-3">
                      {!isDeleted ? (
                        <FormField
                          control={form.control}
                          name={`answers.${index}.text`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Nhập nội dung câu trả lời..."
                                  className="border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <span className="text-gray-400 italic">
                          {form.getValues(`answers.${index}.text`) || "Đã xóa"}
                        </span>
                      )}
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      {!isDeleted ? (
                        <FormField
                          control={form.control}
                          name={`answers.${index}.iscorrect`}
                          render={({ field }) => {
                            const currentAnswers = form.getValues("answers");
                            return (
                              <FormItem className="flex justify-center">
                                <FormControl>
                                  <input
                                    type="radio"
                                    name="correct_answer"
                                    checked={field.value}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        currentAnswers?.forEach((_, i) => {
                                          form.setValue(
                                            `answers.${i}.iscorrect`,
                                            false
                                          );
                                        });
                                        form.setValue(
                                          `answers.${index}.iscorrect`,
                                          true
                                        );
                                      }
                                    }}
                                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                  />
                                </FormControl>
                              </FormItem>
                            );
                          }}
                        />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      {!isDeleted ? (
                        <div className="flex items-center gap-2 justify-center">
                          {existingMedia.find(
                            (f) =>
                              f.owner_type === "answer" &&
                              f.owner_id == field.answer_id
                          ) && (
                            <MediaDisplay
                              file={
                                existingMedia.find(
                                  (f) =>
                                    f.owner_type === "answer" &&
                                    f.owner_id == field.answer_id
                                )!
                              }
                              onRemove={() =>
                                onRemoveExistingMedia(
                                  existingMedia.find(
                                    (f) =>
                                      f.owner_type === "answer" &&
                                      f.owner_id == field.answer_id
                                  )!.media_id,
                                  index
                                )
                              }
                            />
                          )}
                          {answerMedia[index] && (
                            <FilePreview
                              file={answerMedia[index]!}
                              onRemove={() => onRemoveNewFile(index)}
                            />
                          )}
                          {!existingMedia.find(
                            (f) =>
                              f.owner_type === "answer" &&
                              f.owner_id == field.answer_id
                          ) &&
                            !answerMedia[index] && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <label>
                                  <FileUp className="h-3 w-3 mr-1" />
                                  <Input
                                    ref={(el) => {
                                      answerMediaInputRefs.current[index] = el;
                                    }}
                                    type="file"
                                    className="sr-only"
                                    onChange={(e) => onFileChange(e, index)}
                                  />
                                </label>
                              </Button>
                            )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="border border-border px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {mode === "edit" && isDeleted && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => restoreAnswer(index)}
                            className="h-8 w-8 p-0"
                            title="Khôi phục"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAnswer(index)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={isDeleted}
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Answer Button */}
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={addAnswer}
            className="flex items-center gap-2 px-6"
            disabled={fields.length >= 6}
          >
            <Plus className="h-4 w-4" />
            Thêm câu trả lời
            {fields.length >= 6 && (
              <span className="text-xs text-gray-500">(Tối đa 6)</span>
            )}
          </Button>
        </div>

        {fields.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có câu trả lời nào. Hãy thêm ít nhất 2 câu trả lời.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
