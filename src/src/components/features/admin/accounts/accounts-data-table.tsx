"use client";

import { useState, useEffect, useMemo } from "react";
import { userService, User } from "@/lib/services/api/user.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/display/table";
import { Input } from "@/components/ui/forms/input";
import { Button } from "@/components/ui/forms/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import { Badge } from "@/components/ui/feedback/badge";
import { AccountActions } from "./account-actions";
import { Search, Plus } from "lucide-react";
import { AccountsDataTableSkeleton } from "./AccountsDataTableSkeleton";
import { PaginationWithInfo } from "@/components/ui/navigation";

interface AccountsDataTableProps {
  onCreateClick: () => void;
}

const ITEMS_PER_PAGE = 10;

export function AccountsDataTable({ onCreateClick }: AccountsDataTableProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch tất cả users một lần
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Lấy hết không phân trang
      const response = await userService.getAllUsers({
        page: 1,
        limit: 1000, // Lấy nhiều để đảm bảo lấy hết
      });
      // Hiển thị tất cả user bao gồm cả sinh viên
      setAllUsers(response.data.users);
    } catch (error: any) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Lọc và tìm kiếm ở frontend
  const filteredUsers = useMemo(() => {
    let filtered = [...allUsers];

    // Lọc theo vai trò
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.Role.name === roleFilter);
    }

    // Tìm kiếm theo tên hoặc email
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [allUsers, roleFilter, searchTerm]);

  // Phân trang ở frontend
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, searchTerm]);

  const getRoleBadge = (roleName: string) => {
    const roleMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "outline" }
    > = {
      admin: { label: "Admin", variant: "default" },
      teacher: { label: "Giảng viên", variant: "secondary" },
      student: { label: "Sinh viên", variant: "outline" },
    };

    const role = roleMap[roleName] || { label: roleName, variant: "outline" };
    return <Badge variant={role.variant}>{role.label}</Badge>;
  };

  if (loading) {
    return <AccountsDataTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Controls Section - ĐÚNG Y HỆT như trang students */}
      <div className="flex flex-col space-y-4 mb-6">
        {/* Mobile layout */}
        <div className="sm:hidden flex flex-col gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm tài khoản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={onCreateClick}
          >
            <Plus className="w-4 h-4" />
            Thêm tài khoản
          </Button>
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm tài khoản..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Button className="flex items-center gap-2" onClick={onCreateClick}>
              <Plus className="w-4 h-4" />
              Thêm tài khoản
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              Lọc vai trò:
            </span>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px] sm:w-[160px]">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Giảng viên</SelectItem>
                <SelectItem value="student">Sinh viên</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100 dark:bg-muted/50 hover:bg-slate-100 dark:hover:bg-muted/50">
              <TableHead>Mã</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Không tìm thấy tài khoản nào
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell className="font-medium">{user.user_id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.Role.name)}</TableCell>
                  <TableCell>
                    <AccountActions user={user} onSuccess={fetchUsers} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationWithInfo
          currentPage={currentPage}
          totalPages={totalPages}
          total={filteredUsers.length}
          limit={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
