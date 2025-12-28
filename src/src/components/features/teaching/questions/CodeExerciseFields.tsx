"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Plus, Trash2, Tag, Lightbulb, Info } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/feedback";

interface CodeExerciseFieldsProps {
  form: UseFormReturn<QuestionFormData>;
}

// Type for test case that supports both modes
interface TestCase {
  input: string;
  expected?: string | number;
  output?: string;
  description?: string;
}

// Type for validation rules that supports both modes
interface ValidationRules {
  language: "javascript" | "python" | "c" | "cpp" | "c++";
  mode?: "function" | "stdio";
  test_cases: TestCase[];
  max_execution_time?: number;
}

// Helper function to get default test case based on mode
const getDefaultTestCase = (mode: string): TestCase => {
  if (mode === "stdio") {
    return { input: "", output: "", description: "" };
  }
  return { input: "", expected: "", description: "" };
};

export function CodeExerciseFields({ form }: CodeExerciseFieldsProps) {
  const [tagInput, setTagInput] = useState("");
  const [hintInput, setHintInput] = useState("");

  const tags = form.watch("tags") || [];
  const hints = form.watch("hints") || [];
  const rawValidationRules = form.watch("validation_rules");
  
  // Cast to our flexible type
  const validationRules: ValidationRules = (rawValidationRules as ValidationRules) || {
    language: "javascript",
    mode: "function",
    test_cases: [],
    max_execution_time: 1000,
  };

  const currentMode = validationRules.mode || "function";

  // Tag handlers
  const addTag = () => {
    if (tagInput.trim()) {
      form.setValue("tags", [...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    form.setValue(
      "tags",
      tags.filter((_: string, i: number) => i !== index)
    );
  };

  // Hint handlers
  const addHint = () => {
    if (hintInput.trim()) {
      form.setValue("hints", [...hints, hintInput.trim()]);
      setHintInput("");
    }
  };

  const removeHint = (index: number) => {
    form.setValue(
      "hints",
      hints.filter((_: string, i: number) => i !== index)
    );
  };

  // Test case handlers
  const addTestCase = () => {
    const currentTestCases = validationRules.test_cases || [];
    const newRules = {
      ...validationRules,
      test_cases: [...currentTestCases, getDefaultTestCase(currentMode)],
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.setValue("validation_rules", newRules as any);
  };

  const removeTestCase = (index: number) => {
    const currentTestCases = validationRules.test_cases || [];
    const newRules = {
      ...validationRules,
      test_cases: currentTestCases.filter((_, i) => i !== index),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.setValue("validation_rules", newRules as any);
  };

  const updateTestCase = (
    index: number,
    field: "input" | "expected" | "output" | "description",
    value: string | number
  ) => {
    const currentTestCases = [...(validationRules.test_cases || [])];
    currentTestCases[index] = {
      ...currentTestCases[index],
      [field]: value,
    };
    const newRules = {
      ...validationRules,
      test_cases: currentTestCases,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.setValue("validation_rules", newRules as any);
  };

  // Handle mode change - convert test cases when switching modes
  const handleModeChange = (newMode: "function" | "stdio") => {
    const currentTestCases = validationRules.test_cases || [];
    
    // Convert existing test cases to new format
    const convertedTestCases: TestCase[] = currentTestCases.map((tc) => {
      if (newMode === "stdio") {
        return {
          input: tc.input || "",
          output: tc.output || String(tc.expected || ""),
          description: tc.description || "",
        };
      } else {
        return {
          input: tc.input || "",
          expected: tc.expected || tc.output || "",
          description: tc.description || "",
        };
      }
    });

    const newRules = {
      ...validationRules,
      mode: newMode,
      test_cases: convertedTestCases,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form.setValue("validation_rules", newRules as any);
  };

  return (
    <div className="space-y-6">
      {/* Time Limit */}
      <FormField
        control={form.control}
        name="time_limit"
        render={({ field }: any) => (
          <FormItem>
            <FormLabel>Thời gian làm bài (giây)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ví dụ: 300 (5 phút)"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Tags
          </CardTitle>
          <CardDescription>
            Thêm các tag để phân loại câu hỏi (ví dụ: javascript, algorithm)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" onClick={addTag} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: string, index: number) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full text-sm"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hints */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Gợi ý
          </CardTitle>
          <CardDescription>
            Thêm các gợi ý để giúp học sinh giải quyết bài tập
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Textarea
              placeholder="Nhập gợi ý..."
              value={hintInput}
              onChange={(e) => setHintInput(e.target.value)}
              rows={2}
            />
            <Button type="button" onClick={addHint} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {hints.map((hint: string, index: number) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
              >
                <span className="flex-1 text-sm">{hint}</span>
                <button
                  type="button"
                  onClick={() => removeHint(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>


      {/* Validation Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cấu hình Test Cases</CardTitle>
          <CardDescription>
            Thiết lập ngôn ngữ lập trình và các test case để kiểm tra code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Language Selection */}
          <FormItem>
            <FormLabel>Ngôn ngữ lập trình *</FormLabel>
            <Select
              value={validationRules.language}
              onValueChange={(value) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                form.setValue("validation_rules", {
                  ...validationRules,
                  language: value as "javascript" | "c" | "cpp" | "c++",
                } as any)
              }
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ngôn ngữ" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="c">C (gcc -std=c11)</SelectItem>
                <SelectItem value="cpp">C++ (g++ -std=c++17)</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>

          {/* Mode Selection */}
          <FormItem>
            <div className="flex items-center gap-2">
              <FormLabel>Chế độ Test Case *</FormLabel>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-2 text-sm">
                      <p><strong>Function Mode:</strong> Sinh viên chỉ viết function, hệ thống tự động gọi và kiểm tra giá trị trả về.</p>
                      <p><strong>STDIO Mode:</strong> Sinh viên viết chương trình hoàn chỉnh với hàm main(), đọc dữ liệu từ stdin và xuất kết quả ra stdout.</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={currentMode}
              onValueChange={(value) => handleModeChange(value as "function" | "stdio")}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chế độ" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="function">
                  Function Mode - Sinh viên viết function
                </SelectItem>
                <SelectItem value="stdio">
                  STDIN/STDOUT Mode - Sinh viên viết chương trình hoàn chỉnh
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMode === "stdio"
                ? "Sinh viên viết chương trình hoàn chỉnh với hàm main(), đọc dữ liệu từ stdin và xuất kết quả ra stdout"
                : "Sinh viên chỉ viết function, hệ thống tự động kiểm tra bằng cách gọi function với các tham số đầu vào"}
            </p>
          </FormItem>

          {/* Max Execution Time */}
          <FormItem>
            <FormLabel>Thời gian chạy tối đa (ms)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="1000"
                value={validationRules.max_execution_time || 1000}
                onChange={(e) =>
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  form.setValue("validation_rules", {
                    ...validationRules,
                    max_execution_time: Number(e.target.value),
                  } as any)
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          {/* Test Cases */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FormLabel>Test Cases *</FormLabel>
              <Button
                type="button"
                onClick={addTestCase}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Thêm Test Case
              </Button>
            </div>

            {/* Mode-specific instructions */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm border border-blue-200 dark:border-blue-800">
              {currentMode === "stdio" ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      Hướng dẫn STDIO Mode
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-blue-700 dark:text-blue-300">
                    <div className="flex items-start gap-2">
                      <code className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs font-semibold">
                        Input
                      </code>
                      <span>Dữ liệu stdin, dùng Enter cho multi-line</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <code className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs font-semibold">
                        Output
                      </code>
                      <span>Kết quả stdout mong đợi</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <code className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs font-semibold">
                        Ví dụ
                      </code>
                      <span className="font-mono text-xs">5\n1 2 3 4 5</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      Hướng dẫn Function Mode
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-blue-700 dark:text-blue-300">
                    <div className="flex items-start gap-2">
                      <code className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs font-semibold">
                        Input
                      </code>
                      <span>Lời gọi hàm, vd: <code className="font-mono">add(2, 3)</code></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <code className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs font-semibold">
                        Expected
                      </code>
                      <span>Giá trị return mong đợi</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Sinh viên chỉ cần viết function, không cần main()</span>
                    </div>
                  </div>
                </div>
              )}
            </div>


            {validationRules.test_cases?.map((testCase: any, index: number) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-3 bg-muted/20"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    Test Case #{index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTestCase(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Function Mode Fields */}
                {currentMode !== "stdio" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormItem>
                      <FormLabel>Input (Function Call) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ví dụ: add(2, 3)"
                          value={testCase.input || ""}
                          onChange={(e) =>
                            updateTestCase(index, "input", e.target.value)
                          }
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Nhập lời gọi hàm, ví dụ: functionName(arg1, arg2)
                      </p>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Expected (Return Value) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ví dụ: 5"
                          value={testCase.expected || ""}
                          onChange={(e) =>
                            updateTestCase(index, "expected", e.target.value)
                          }
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Giá trị trả về mong đợi từ function
                      </p>
                    </FormItem>
                  </div>
                )}

                {/* STDIO Mode Fields */}
                {currentMode === "stdio" && (
                  <div className="space-y-3">
                    <FormItem>
                      <FormLabel>Input (STDIN) *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={"Ví dụ:\n5\n1 2 3 4 5"}
                          value={testCase.input || ""}
                          onChange={(e) =>
                            updateTestCase(index, "input", e.target.value)
                          }
                          rows={3}
                          className="font-mono text-sm"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Nhập dữ liệu stdin. Dùng Enter cho multi-line input.
                      </p>
                    </FormItem>

                    <FormItem>
                      <FormLabel>Output (STDOUT) *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ví dụ: 15"
                          value={testCase.output || ""}
                          onChange={(e) =>
                            updateTestCase(index, "output", e.target.value)
                          }
                          rows={2}
                          className="font-mono text-sm"
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Kết quả mong đợi khi chạy chương trình (stdout).
                      </p>
                    </FormItem>
                  </div>
                )}

                <FormItem>
                  <FormLabel>Mô tả (tùy chọn)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mô tả test case này..."
                      value={testCase.description || ""}
                      onChange={(e) =>
                        updateTestCase(index, "description", e.target.value)
                      }
                    />
                  </FormControl>
                </FormItem>
              </div>
            ))}

            {(!validationRules.test_cases ||
              validationRules.test_cases.length === 0) && (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>Chưa có test case nào. Hãy thêm ít nhất 1 test case.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
