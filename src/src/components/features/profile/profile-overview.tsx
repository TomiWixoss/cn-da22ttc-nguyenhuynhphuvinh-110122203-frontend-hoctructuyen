"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/layout";
import { User, Trophy, Target, TrendingUp, Star, Lock } from "lucide-react";
import { ConnectedAvatarDisplay } from "@/components/features/avatar";
import { User as UserType } from "@/lib/types/auth";
import { Button } from "@/components/ui/forms/button";
import { ChangePasswordDialog } from "./change-password-dialog";
import { SimpleCounter } from "@/components/ui/effects";
import gsap from "gsap";

interface ProfileOverviewProps {
  user: UserType;
  equippedAvatarId?: number;
  userGamification?: any;
  formattedPoints?: string;
}

export function ProfileOverview({
  user,
  equippedAvatarId,
  userGamification,
  formattedPoints,
}: ProfileOverviewProps) {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const ctx = gsap.context(() => {
      // Animate avatar with scale and rotation
      gsap.from(avatarRef.current, {
        scale: 0,
        rotation: -180,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
      });

      // Animate user info
      gsap.from(infoRef.current, {
        x: -30,
        opacity: 0,
        duration: 0.6,
        delay: 0.3,
        ease: "power3.out",
      });

      // Animate stats cards with stagger
      const statCards = statsRef.current?.querySelectorAll(".stat-card");
      if (statCards) {
        gsap.from(statCards, {
          scale: 0.8,
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.5,
          ease: "back.out(1.5)",
        });
      }
    }, cardRef);

    return () => ctx.revert();
  }, [user, equippedAvatarId]);

  // Add hover animations for stat cards
  useEffect(() => {
    const statCards = statsRef.current?.querySelectorAll(".stat-card");
    if (!statCards) return;

    const handleMouseEnter = (e: Event) => {
      gsap.to(e.currentTarget, {
        scale: 1.05,
        y: -5,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = (e: Event) => {
      gsap.to(e.currentTarget, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    statCards.forEach((card) => {
      card.addEventListener("mouseenter", handleMouseEnter);
      card.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      statCards.forEach((card) => {
        card.removeEventListener("mouseenter", handleMouseEnter);
        card.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <User className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa đăng nhập</h3>
          <p className="text-muted-foreground text-center">
            Vui lòng đăng nhập để xem thông tin cá nhân.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div ref={cardRef} className="space-y-6">
      <Card>
        <CardContent className="p-4 sm:p-6">
          {/* Avatar và thông tin cơ bản - RESPONSIVE */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div ref={avatarRef} className="flex-shrink-0">
              <ConnectedAvatarDisplay
                key={`avatar-${equippedAvatarId}`}
                size="large"
                showName={false}
                showRarity={false}
              />
            </div>

            <div
              ref={infoRef}
              className="space-y-2 text-center sm:text-left w-full sm:w-auto flex-1"
            >
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold">
                  {user.fullName}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground break-all">
                {user.email}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Sinh viên
              </p>

              {/* Nút đổi mật khẩu */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Đổi mật khẩu
                </Button>
              </div>
            </div>
          </div>

          {/* 4 card thống kê bên dưới - RESPONSIVE */}
          <div
            ref={statsRef}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            <Card className="stat-card border-2 border-blue-200 cursor-pointer">
              <CardContent className="p-3 sm:p-4 text-center">
                <Trophy className="h-5 w-5 sm:h-7 sm:w-7 text-blue-600 mx-auto mb-1 sm:mb-2" />
                <h4 className="font-semibold text-blue-800 text-xs sm:text-sm mb-1">
                  Điểm kiến thức
                </h4>
                <div className="text-base sm:text-xl font-bold text-blue-600">
                  {formattedPoints || "0"}
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card border-2 border-green-200 cursor-pointer">
              <CardContent className="p-3 sm:p-4 text-center">
                <Target className="h-5 w-5 sm:h-7 sm:w-7 text-green-600 mx-auto mb-1 sm:mb-2" />
                <h4 className="font-semibold text-green-800 text-xs sm:text-sm mb-1">
                  Câu đúng
                </h4>
                <SimpleCounter
                  value={userGamification?.stats?.total_correct_answers || 0}
                  duration={1.2}
                  className="text-base sm:text-xl font-bold text-green-600"
                />
              </CardContent>
            </Card>

            <Card className="stat-card border-2 border-purple-200 cursor-pointer">
              <CardContent className="p-3 sm:p-4 text-center">
                <TrendingUp className="h-5 w-5 sm:h-7 sm:w-7 text-purple-600 mx-auto mb-1 sm:mb-2" />
                <h4 className="font-semibold text-purple-800 text-xs sm:text-sm mb-1">
                  Streak tốt nhất
                </h4>
                <SimpleCounter
                  value={userGamification?.stats?.best_streak || 0}
                  duration={1}
                  className="text-base sm:text-xl font-bold text-purple-600"
                />
              </CardContent>
            </Card>

            <Card className="stat-card border-2 border-amber-200 cursor-pointer">
              <CardContent className="p-3 sm:p-4 text-center">
                <Star className="h-5 w-5 sm:h-7 sm:w-7 text-amber-600 mx-auto mb-1 sm:mb-2" />
                <h4 className="font-semibold text-amber-800 text-xs sm:text-sm mb-1">
                  Điểm tuyệt đối
                </h4>
                <SimpleCounter
                  value={userGamification?.stats?.perfect_scores || 0}
                  duration={1}
                  className="text-base sm:text-xl font-bold text-amber-600"
                />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Dialog đổi mật khẩu */}
      <ChangePasswordDialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />
    </div>
  );
}
