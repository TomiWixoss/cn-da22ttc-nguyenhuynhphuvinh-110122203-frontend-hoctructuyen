"use client";

import { useState } from "react";
import { User, userService } from "@/lib/services/api/user.service";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/overlay/alert-dialog";
import { Button } from "@/components/ui/forms/button";
import { toast } from "sonner";

interface DeleteAccountDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteAccountDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: DeleteAccountDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await userService.deleteUser(user.user_id);
      toast.success("Xóa tài khoản thành công!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa tài khoản");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa tài khoản</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa tài khoản <strong>{user.name}</strong> (
            {user.email})?
            <br />
            <br />
            Hành động này không thể hoàn tác. Nếu tài khoản này đang phụ trách
            các khóa học hoặc có dữ liệu liên quan, việc xóa có thể bị từ chối.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Đang xóa..." : "Xóa tài khoản"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
