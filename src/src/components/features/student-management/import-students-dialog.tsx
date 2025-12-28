"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/forms/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import {
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/feedback/dialog";
import {
  Upload,
  AlertCircle,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import studentManagementService from "@/lib/services/api/student-management.service";
import { CourseSelectByAssignment } from "@/components/features/course/course-select-by-assignment";

// Alert component
interface AlertProps {
  variant?: "default" | "destructive";
  children: React.ReactNode;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant = "default",
  children,
  className,
}) => {
  const baseClasses = "p-4 rounded-lg border flex items-start gap-3";
  const variantClasses = {
    default:
      "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-300",
    destructive:
      "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className || ""}`}
    >
      {children}
    </div>
  );
};

const AlertDescription: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div className="text-sm">{children}</div>;
};

interface ImportStudentsDialogProps {
  onSuccess: () => void;
  onCancel: () => void;
  defaultCourseId?: number;
}

interface ImportResult {
  success: boolean;
  message: string;
  created: number;
  enrolled: number;
  skipped: number;
  errors?: Array<{
    row: number;
    message: string;
  }>;
}

export default function ImportStudentsDialog({
  onSuccess,
  onCancel,
  defaultCourseId,
}: ImportStudentsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(
    defaultCourseId || null
  );
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/student_sample.csv";
    link.download = "student_sample.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã tải template thành công!");
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls") &&
      !selectedFile.name.endsWith(".csv")
    ) {
      toast.error("Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV (.csv)");
      return false;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File quá lớn. Vui lòng chọn file nhỏ hơn 10MB");
      return false;
    }

    setFile(selectedFile);
    setImportResult(null);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Vui lòng chọn file Excel hoặc CSV");
      return;
    }

    if (!selectedCourse) {
      toast.error("Vui lòng chọn khóa học để thực hiện Smart Import");
      return;
    }

    try {
      setLoading(true);
      setImportResult(null);

      const response =
        await studentManagementService.smartImportAndEnrollStudents(
          file,
          selectedCourse
        );

      if (response.success) {
        const result: ImportResult = {
          success: true,
          message: response.message || "Import thành công",
          created: response.data.created || 0,
          enrolled: response.data.enrolled || 0,
          skipped: response.data.skipped || 0,
          errors: response.data.errors || [],
        };

        setImportResult(result);

        if (result.errors && result.errors.length > 0) {
          toast.warning(`Đã import với ${result.errors.length} lỗi`);
        } else {
          toast.success(
            `Import thành công! Tạo mới: ${result.created}, Đăng ký: ${result.enrolled}`
          );
        }

        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        const result: ImportResult = {
          success: false,
          message: response.message || "Import thất bại",
          created: 0,
          enrolled: 0,
          skipped: 0,
        };
        setImportResult(result);
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error importing students:", error);
      const result: ImportResult = {
        success: false,
        message: "Có lỗi xảy ra khi import sinh viên",
        created: 0,
        enrolled: 0,
        skipped: 0,
      };
      setImportResult(result);
      toast.error(result.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Import Sinh viên từ Excel/CSV
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Smart Import sẽ:</strong>
              </p>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• Kiểm tra sinh viên đã tồn tại trong hệ thống</li>
                <li>• Tạo mới sinh viên chưa có</li>
                <li>
                  • Tự động đăng ký tất cả sinh viên vào khóa học{" "}
                  {defaultCourseId ? "hiện tại" : "đã chọn"}
                </li>
                <li>
                  • <strong>CSV:</strong> Cần có 5 cột theo thứ tự: username,
                  email, password, full_name, student_code (có header)
                </li>
                <li>
                  • <strong>Excel:</strong> Cột A: Username, B: Email, C: Mật
                  khẩu, D: Họ tên, E: Mã sinh viên
                </li>
                <li>• File CSV phải có encoding UTF-8</li>
              </ul>
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Tải file mẫu
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {!defaultCourseId && (
          <div className="space-y-2">
            <Label>Chọn khóa học</Label>
            <CourseSelectByAssignment
              value={selectedCourse || undefined}
              onValueChange={(courseId) => setSelectedCourse(courseId || null)}
              placeholder="Chọn khóa học"
              showEmptyOption={false}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="file">File Excel/CSV</Label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={!loading ? handleUploadAreaClick : undefined}
          >
            <div className="text-center space-y-4 pointer-events-none">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {isDragOver
                    ? "Thả file vào đây"
                    : "Kéo thả file vào đây hoặc nhấp để chọn"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Hỗ trợ Excel (.xlsx, .xls) và CSV (.csv) • Tối đa 10MB
                </p>
              </div>
            </div>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              disabled={loading}
              ref={fileInputRef}
              className="sr-only"
            />
          </div>
        </div>

        {/* Selected File Display */}
        {file && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-md">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            {!loading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Import Result */}
        {importResult && (
          <div className="space-y-2">
            <Alert variant={importResult.success ? "default" : "destructive"}>
              <div className="flex items-start gap-2">
                {importResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription>
                    <div className="font-medium">{importResult.message}</div>
                    {importResult.success && (
                      <div className="text-xs mt-1">
                        Tạo mới: {importResult.created} • Đăng ký:{" "}
                        {importResult.enrolled} • Bỏ qua: {importResult.skipped}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>

            {/* Error Details */}
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Chi tiết lỗi ({importResult.errors.length} lỗi):
                </Label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {importResult.errors.slice(0, 5).map((error, index) => (
                    <div
                      key={index}
                      className="text-xs p-2 bg-orange-50 dark:bg-orange-950/30 rounded border-l-2 border-orange-200 dark:border-orange-900/50"
                    >
                      <span className="font-medium">Dòng {error.row}:</span>{" "}
                      {error.message}
                    </div>
                  ))}
                  {importResult.errors.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      ... và {importResult.errors.length - 5} lỗi khác
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleImport}
            disabled={loading || !file || !selectedCourse}
            className="min-w-[100px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Đang import...
              </div>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Smart Import
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
