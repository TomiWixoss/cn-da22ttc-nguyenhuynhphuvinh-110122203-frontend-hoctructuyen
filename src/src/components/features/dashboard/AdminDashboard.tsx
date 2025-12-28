"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { GraduationCap, Archive, Users } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-6">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Quản trị hệ thống</h1>
          <p className="text-muted-foreground text-lg">
            Chọn một mục để bắt đầu quản lý
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Link href="/dashboard/admin/programs">
            <Card className="border-2 hover:border-primary hover:shadow-xl transition-all cursor-pointer h-full group">
              <CardHeader className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <GraduationCap className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center text-xl">
                  Chương trình Đào tạo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Quản lý các chương trình đào tạo, môn học, chương, và mục tiêu
                  học tập
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/admin/training-batches">
            <Card className="border-2 hover:border-primary hover:shadow-xl transition-all cursor-pointer h-full group">
              <CardHeader className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Archive className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center text-xl">
                  Khóa Đào tạo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Quản lý các khóa đào tạo, phân công giảng viên và sinh viên
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/admin/accounts">
            <Card className="border-2 hover:border-primary hover:shadow-xl transition-all cursor-pointer h-full group">
              <CardHeader className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-center text-xl">
                  Quản lý Tài khoản
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Quản lý tài khoản người dùng, phân quyền và cấp lại mật khẩu
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
