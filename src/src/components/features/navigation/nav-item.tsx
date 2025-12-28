/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NavItem as NavItemType } from "@/lib/types/nav";
import * as LucideIcons from "lucide-react";
import { TeacherLink } from "@/components/ui/navigation/TeacherLink";
import { useAssignmentContext } from "@/lib/contexts/assignment-context";

interface NavItemProps {
  item: NavItemType;
  className?: string;
}

export function NavItem({ item, className }: NavItemProps) {
  const { title, href, icon, isActive, badge } = item;
  const { currentAssignmentId, isTeacher } = useAssignmentContext();

  const IconComponent = icon ? (LucideIcons as any)[icon] : null;

  // Sử dụng TeacherLink cho tất cả dashboard routes khi teacher có assignment context
  const LinkComponent =
    href.startsWith("/dashboard") && isTeacher && currentAssignmentId
      ? TeacherLink
      : Link;

  return (
    <div className={cn("group", className)}>
      <LinkComponent
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-md transition-all duration-200 border-2",
          // SỬ DỤNG: Sử dụng group class để điều khiển padding và căn chỉnh
          // Mặc định (thu gọn): căn giữa, padding đều
          "p-2.5 justify-center",
          // SỬA LỖI: Kết hợp cả hai
          "lg:justify-start lg:px-3 group-[.w-64]:justify-start group-[.w-64]:px-3",
          isActive
            ? "bg-primary/10 text-primary font-semibold border-primary/50"
            : "text-muted-foreground hover:text-primary hover:bg-primary/5 border-transparent",
          className
        )}
      >
        {IconComponent && (
          <IconComponent
            className={cn(
              "h-[18px] w-[18px] min-w-[18px] flex-shrink-0",
              isActive
                ? "text-primary"
                : "text-muted-foreground group-hover:text-primary transition-colors"
            )}
          />
        )}

        {/* SỬ DỤNG: Sử dụng group class đệ hiển thị text khi sidebar mở rộng */}
        <span className="truncate hidden lg:inline group-[.w-64]:inline">
          {title}
        </span>

        {badge && (
          <span className="ml-auto hidden lg:inline group-[.w-64]:inline flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
            {badge}
          </span>
        )}
      </LinkComponent>
    </div>
  );
}
