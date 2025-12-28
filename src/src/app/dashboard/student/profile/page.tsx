"use client";

import { useMemo, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/layout";
import { useAuthStatus } from "@/lib/hooks/use-auth";
import { User } from "lucide-react";
import { useAvatar } from "@/lib/hooks/use-avatar";
import { useGamification } from "@/lib/hooks/use-gamification";
import {
  ProfileOverview,
  CollectionManagement,
  CodeAnalyticsSection,
} from "@/components/features/profile";
import { PageHeader } from "@/components/ui/layout/page-header";
import gsap from "gsap";

export default function StudentProfilePage() {
  const { getUser } = useAuthStatus();
  const user = getUser();
  const { myAvatarData, collectionProgress, isCollectionProgressLoading } =
    useAvatar();

  // Thêm useGamification để lấy thông tin thống kê
  const { userGamification, formattedPoints } = useGamification();

  const equippedAvatarId = useMemo(
    () => myAvatarData?.customization?.equipped_avatar?.avatar_id,
    [myAvatarData]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const ctx = gsap.context(() => {
      // Animate header
      gsap.from(headerRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.6,
        ease: "power3.out",
      });

      // Animate profile section
      gsap.from(profileRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });

      // Animate collection section
      gsap.from(collectionRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        delay: 0.4,
        ease: "power3.out",
      });
    }, containerRef);

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
              Vui lòng đăng nhập để xem thông tin cá nhân.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="container px-2 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div ref={headerRef}>
        <PageHeader
          title="Hồ Sơ Cá Nhân"
          description="Quản lý thông tin và thành tích của bạn"
          variant="profile"
        />
      </div>

      {/* Render tất cả nội dung chung ở một chỗ - RESPONSIVE */}
      <div className="space-y-4 sm:space-y-6 md:space-y-8 mt-4 sm:mt-6">
        {/* Thông tin cá nhân và thống kê thành tích */}
        <div ref={profileRef}>
          <ProfileOverview
            user={user}
            equippedAvatarId={equippedAvatarId}
            userGamification={userGamification}
            formattedPoints={formattedPoints}
          />
        </div>

        {/* Thống kê Code Analytics */}
        <CodeAnalyticsSection />

        {/* Thống kê sưu tập */}
        <div ref={collectionRef}>
          <CollectionManagement
            collectionProgress={collectionProgress}
            isCollectionProgressLoading={isCollectionProgressLoading}
          />
        </div>
      </div>
    </div>
  );
}
