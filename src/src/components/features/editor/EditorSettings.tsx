"use client";

import React, { useState } from "react";
import { Settings, Type, Hash, WrapText, Braces } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms";
import { Button } from "@/components/ui/forms";
import { Label } from "@/components/ui/forms/label";
import { Switch } from "@/components/ui/forms";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/feedback";

interface EditorSettingsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  lineNumbers: boolean;
  onLineNumbersChange: (value: boolean) => void;
  wordWrap: boolean;
  onWordWrapChange: (value: boolean) => void;
  tabSize: number;
  onTabSizeChange: (size: number) => void;
  autoCloseBrackets: boolean;
  onAutoCloseBracketsChange: (value: boolean) => void;
}

export const EditorSettings: React.FC<EditorSettingsProps> = ({
  fontSize,
  onFontSizeChange,
  lineNumbers,
  onLineNumbersChange,
  wordWrap,
  onWordWrapChange,
  tabSize,
  onTabSizeChange,
  autoCloseBrackets,
  onAutoCloseBracketsChange,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            Cài Đặt Editor
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Font Size */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Type className="h-4 w-4" />
              Kích thước chữ
            </Label>
            <Select
              value={fontSize.toString()}
              onValueChange={(val) => onFontSizeChange(parseInt(val))}
            >
              <SelectTrigger className="rounded-2xl border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12px - Nhỏ</SelectItem>
                <SelectItem value="14">14px - Vừa</SelectItem>
                <SelectItem value="16">16px - Lớn</SelectItem>
                <SelectItem value="18">18px - Rất lớn</SelectItem>
                <SelectItem value="20">20px - Khổng lồ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tab Size */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Hash className="h-4 w-4" />
              Kích thước Tab
            </Label>
            <Select
              value={tabSize.toString()}
              onValueChange={(val) => onTabSizeChange(parseInt(val))}
            >
              <SelectTrigger className="rounded-2xl border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 spaces</SelectItem>
                <SelectItem value="4">4 spaces</SelectItem>
                <SelectItem value="8">8 spaces</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Line Numbers */}
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Hash className="h-4 w-4" />
              Hiển thị số dòng
            </Label>
            <Switch
              checked={lineNumbers}
              onCheckedChange={onLineNumbersChange}
            />
          </div>

          {/* Word Wrap */}
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <WrapText className="h-4 w-4" />
              Tự động xuống dòng
            </Label>
            <Switch checked={wordWrap} onCheckedChange={onWordWrapChange} />
          </div>

          {/* Auto Close Brackets */}
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Braces className="h-4 w-4" />
              Tự động đóng ngoặc
            </Label>
            <Switch
              checked={autoCloseBrackets}
              onCheckedChange={onAutoCloseBracketsChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
