"use client";

import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/layout";
import { User } from "lucide-react";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { InventoryPageOptimized } from "@/components/features/profile";
import { PageHeader } from "@/components/ui/layout/page-header";
import gsap from "gsap";

export default function StudentInventoryPage() {
  const { getUser } = useAuthStatus();
  const user = getUser();

  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Animate page entrance
  useEffect(() => {
    if (!user) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }
      ).fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.4"
      );
    }, pageRef);

    return () => ctx.revert();
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa đăng nhập</h3>
            <p className="text-muted-foreground text-center">
              Vui lòng đăng nhập để xem kho đồ của bạn.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={pageRef}
      className="container px-2 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div ref={headerRef}>
        <PageHeader
          title="Kho Đồ"
          description="Tùy chỉnh avatar và emoji của bạn"
          variant="inventory"
        />
      </div>

      {/* Nội dung chính - Component InventoryPageOptimized sử dụng my-data API */}
      <div ref={contentRef}>
        <InventoryPageOptimized className="mt-4 sm:mt-6" />
      </div>
    </div>
  );
}
