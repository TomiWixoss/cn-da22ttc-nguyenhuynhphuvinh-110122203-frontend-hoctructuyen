"use client";

import { useState } from "react";
import { User } from "@/lib/services/api/user.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/overlay/dropdown-menu";
import { Button } from "@/components/ui/forms/button";
import { MoreHorizontal, Edit, Key, Trash2 } from "lucide-react";
import { EditAccountDialog } from "./edit-account-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { DeleteAccountDialog } from "./delete-account-dialog";

interface AccountActionsProps {
  user: User;
  onSuccess: () => void;
}

export function AccountActions({ user, onSuccess }: AccountActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsResetPasswordOpen(true)}>
            <Key className="mr-2 h-4 w-4" />
            Đặt lại mật khẩu
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditAccountDialog
        user={user}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={onSuccess}
      />

      <ResetPasswordDialog
        user={user}
        open={isResetPasswordOpen}
        onOpenChange={setIsResetPasswordOpen}
        onSuccess={onSuccess}
      />

      <DeleteAccountDialog
        user={user}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onSuccess={onSuccess}
      />
    </>
  );
}
