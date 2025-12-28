"use client";

import { cn } from "@/lib/utils";
import { NavSection as NavSectionType } from "@/lib/types/nav";
import { NavItem } from "./nav-item";

interface NavSectionProps {
  section: NavSectionType;
  className?: string;
}

export function NavSection({ section, className }: NavSectionProps) {
  const { items } = section;

  return (
    <div className={cn("py-2", className)}>
      <div className="space-y-1.5">
        {items.map((item, index) => (
          <NavItem key={index} item={item} />
        ))}
      </div>
    </div>
  );
}
