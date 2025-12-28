"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/feedback";
import { Button } from "@/components/ui/forms/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/navigation/tabs";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  Download,
  FileArchive,
} from "lucide-react";
import { questionService } from "@/lib/services/api/question.service";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";

// Simple Alert component
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

interface ImportQuestionsDialogProps {
  onImportSuccess?: () => void;
  children?: React.ReactNode;
}

interface ImportResult {
  success: boolean;
  message: string;
  imported: number;
  totalMediaInZip?: number;
  totalMediaLinked?: number;
  linkedMedia?: Array<{
    questionId: number;
    answerId?: number;
    mediaFile: string;
    type: "question" | "answer";
  }>;
  mediaNotFound?: string[];
  errors?: Array<{
    row: number;
    message: string;
  }>;
}

export function ImportQuestionsDialog({
  onImportSuccess,
  children,
}: ImportQuestionsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importMode, setImportMode] = useState<"excel" | "zip">("zip");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lấy subject_id từ assignment hiện tại
  const { currentAssignmentId, assignments } = useAssignmentContext();
  const currentAssignment = assignments.find(
    (a) => a.assignment_id.toString() === currentAssignmentId
  );
  const subjectId = currentAssignment?.subject_id;

  const validateAndSetFile = (file: File) => {
    const fileExtension = file.name.toLowerCase().split(".").pop();

    if (importMode === "zip") {
      // Kiểm tra file ZIP
      const validZipTypes = [
        "application/zip",
        "application/x-zip-compressed",
        "application/x-zip",
      ];

      if (!validZipTypes.includes(file.type) && fileExtension !== "zip") {
        toast.error("Vui lòng chọn file ZIP (.zip)");
        return false;
      }

      // Kiểm tra kích thước file ZIP (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File ZIP quá lớn. Vui lòng chọn file nhỏ hơn 50MB");
        return false;
      }
    } else {
      // Kiểm tra file Excel/CSV
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
        "application/csv",
      ];

      const validExtensions = ["xlsx", "xls", "csv"];

      if (
        !validTypes.includes(file.type) &&
        !validExtensions.includes(fileExtension || "")
      ) {
        toast.error("Vui lòng chọn file Excel (.xlsx, .xls) hoặc CSV (.csv)");
        return false;
      }

      // Kiểm tra kích thước file (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File quá lớn. Vui lòng chọn file nhỏ hơn 10MB");
        return false;
      }
    }

    setSelectedFile(file);
    setImportResult(null);
    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
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

  const handleUploadAreaClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Chỉ trigger khi click trực tiếp vào div container hoặc các element con không phải input
    event.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadZipTemplate = () => {
    const link = document.createElement("a");
    link.href = "/sample_questions_package.zip";
    link.download = "mau-import-cau-hoi.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã tải xuống file mẫu ZIP");
  };

  const handleDownloadExcelTemplate = () => {
    const link = document.createElement("a");
    link.href = "/tkw_questions-test.xlsx";
    link.download = "mau-import-cau-hoi.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã tải xuống file mẫu Excel");
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn file để import");
      return;
    }

    if (!subjectId) {
      toast.error("Không tìm thấy môn học. Vui lòng chọn phân công giảng dạy");
      return;
    }

    try {
      setIsUploading(true);
      setImportResult(null);

      let response;

      if (importMode === "zip") {
        // Import từ ZIP
        response = await questionService.importQuestionsFromZip(
          selectedFile,
          subjectId
        );
      } else {
        // Import từ Excel/CSV
        const fileExtension = selectedFile.name.toLowerCase().split(".").pop();
        const isCSV = fileExtension === "csv";

        response = isCSV
          ? await questionService.importQuestionsFromCSV(
              selectedFile,
              subjectId
            )
          : await questionService.importQuestionsFromExcel(
              selectedFile,
              subjectId
            );
      }

      if (response.success) {
        const result: ImportResult = {
          success: true,
          message: response.message || "Import thành công",
          imported: response.data.totalImported || 0,
          totalMediaInZip:
            "totalMediaInZip" in response.data
              ? response.data.totalMediaInZip
              : undefined,
          totalMediaLinked:
            "totalMediaLinked" in response.data
              ? response.data.totalMediaLinked
              : undefined,
          linkedMedia:
            "linkedMedia" in response.data
              ? response.data.linkedMedia
              : undefined,
          mediaNotFound:
            "mediaNotFound" in response.data
              ? response.data.mediaNotFound
              : undefined,
          errors:
            "errors" in response.data
              ? response.data.errors?.map((e) => ({
                  row: e.row,
                  message: "message" in e ? e.message : (e as any).error,
                }))
              : undefined,
        };

        setImportResult(result);

        if (result.errors && result.errors.length > 0) {
          toast.warning(
            `Đã import ${result.imported} câu hỏi với ${result.errors.length} lỗi`
          );
        } else {
          toast.success(`Đã import ${result.imported} câu hỏi`);
        }

        // Call success callback after a short delay
        setTimeout(() => {
          onImportSuccess?.();
        }, 1500);
      } else {
        const result: ImportResult = {
          success: false,
          message: response.message || "Import thất bại",
          imported: 0,
        };
        setImportResult(result);
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error importing questions:", error);
      const result: ImportResult = {
        success: false,
        message: "Có lỗi xảy ra khi import câu hỏi",
        imported: 0,
      };
      setImportResult(result);
      toast.error(result.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setIsOpen(false);
      setSelectedFile(null);
      setImportResult(null);
      setImportMode("zip");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleModeChange = (mode: string) => {
    setImportMode(mode as "excel" | "zip");
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          // Reset state khi mở dialog
          setSelectedFile(null);
          setImportResult(null);
          setIsDragOver(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
        setIsOpen(open);
      }}
    >
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import câu hỏi
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import câu hỏi
          </DialogTitle>
          <DialogDescription>
            Chọn phương thức import câu hỏi vào hệ thống
          </DialogDescription>
        </DialogHeader>

        <Tabs value={importMode} onValueChange={handleModeChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="zip" className="flex items-center gap-2">
              <FileArchive className="h-4 w-4" />
              Import từ ZIP (Khuyến nghị)
            </TabsTrigger>
            <TabsTrigger value="excel" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Import từ Excel/CSV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="zip" className="space-y-4 mt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="text-sm">
                    Nén file Excel và tất cả file media (hình ảnh, video) vào
                    một file ZIP duy nhất. Hệ thống sẽ tự động liên kết media
                    với câu hỏi.
                  </p>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadZipTemplate}
                      className="text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Tải file mẫu ZIP
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="zip-file">File ZIP</Label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={!isUploading ? handleUploadAreaClick : undefined}
              >
                <div className="text-center space-y-4 pointer-events-none">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <FileArchive className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {isDragOver
                        ? "Thả file ZIP vào đây"
                        : "Kéo thả file ZIP vào đây hoặc nhấp để chọn"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hỗ trợ file .zip • Tối đa 50MB
                    </p>
                  </div>
                </div>
                <Input
                  id="zip-file"
                  type="file"
                  accept=".zip"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  ref={fileInputRef}
                  className="sr-only"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="excel" className="space-y-4 mt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="text-sm">
                    Chọn file Excel (.xlsx, .xls) hoặc CSV (.csv) chứa câu hỏi.
                    Phù hợp cho câu hỏi không có media hoặc media đã được upload
                    trước.
                  </p>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadExcelTemplate}
                      className="text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Tải file mẫu Excel
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="excel-file">File Excel/CSV</Label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={!isUploading ? handleUploadAreaClick : undefined}
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
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  ref={fileInputRef}
                  className="sr-only"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          {/* Selected File Display */}
          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                {importMode === "zip" ? (
                  <FileArchive className="h-4 w-4 text-green-600" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                )}
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              {!isUploading && (
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
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || isUploading}
            className="min-w-[100px]"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Đang import...
              </div>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
