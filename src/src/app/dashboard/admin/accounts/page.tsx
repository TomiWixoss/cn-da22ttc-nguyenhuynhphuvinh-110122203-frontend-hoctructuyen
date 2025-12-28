"use client";

import React, { useState } from "react";
import { AdminOnly } from "@/components/features/auth/role-guard";
import { PageHeader } from "@/components/ui/layout/page-header";
import { AccountsDataTable } from "@/components/features/admin/accounts/accounts-data-table";
import { CreateAccountDialog } from "@/components/features/admin/accounts/create-account-dialog";

export default function AccountsManagementPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAccountCreated = () => {
    setRefreshKey((prev) => prev + 1);
    setIsCreateDialogOpen(false);
  };

  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="Quản lý tài khoản"
          description="Quản lý tất cả tài khoản trong hệ thống"
          variant="default"
        />

        <AccountsDataTable
          key={refreshKey}
          onCreateClick={() => setIsCreateDialogOpen(true)}
        />

        <CreateAccountDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={handleAccountCreated}
        />
      </div>
    </AdminOnly>
  );
}
