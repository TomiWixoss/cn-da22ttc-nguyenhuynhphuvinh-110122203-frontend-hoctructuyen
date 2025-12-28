"use client";

import React from "react";
import { useGamification } from "@/lib/hooks/use-gamification";
import { useCurrency } from "@/lib/hooks/use-currency";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/feedback";
import { Progress } from "@/components/ui/feedback";
import { Award, Coins, TrendingUp } from "lucide-react";
import { TierIcon } from "@/lib/hooks/use-tier-icon";
import {
  getVietnameseTierName,
  toRomanNumeral,
  getTierColor,
} from "@/lib/utils/tier-assets";

// Nội dung chi tiết sẽ được tái sử dụng
const StatsDetails = () => {
  const { userGamification, userLevelProgress } = useGamification();
  const { balance } = useCurrency();

  const currentLevel = userGamification?.current_level || 1;
  const tierName = userLevelProgress?.tier_info?.tier_name || "Wood";
  const levelInTier = userLevelProgress?.tier_info?.level_in_tier || 1;
  const levelProgress = userLevelProgress?.tier_info
    ? (userLevelProgress.tier_info.xp_in_tier /
        userLevelProgress.tier_info.xp_required_for_tier) *
      100
    : 0;

  return (
    <div className="space-y-12 w-full">
      {/* Level Progress Card - Non-clickable */}
      <div className="bg-background border-2 border-border rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Cấp {currentLevel}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className={cn("text-xs font-medium", getTierColor(tierName))}>
              {getVietnameseTierName(tierName)} {toRomanNumeral(levelInTier)}
            </span>
          </div>
        </div>

        <Progress value={levelProgress} className="h-2 mb-2" />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {userLevelProgress?.tier_info.xp_in_tier?.toLocaleString("vi-VN") ||
              0}{" "}
            XP
          </span>
          <span>
            {userLevelProgress?.tier_info.xp_required_for_tier?.toLocaleString(
              "vi-VN"
            ) || 0}{" "}
            XP
          </span>
        </div>
      </div>

      {/* Currency Info Card - Non-clickable */}
      <div className="bg-background border border-border rounded-lg p-3 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-foreground">Số dư</span>
          </div>
          <span className="text-lg font-bold text-yellow-600">
            {balance?.currencies?.SYNC?.balance?.toLocaleString("vi-VN") || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export const UserStatsDisplay = () => {
  // View khi sidebar mở rộng
  const ExpandedView = () => (
    <div className="hidden lg:flex w-full">
      <StatsDetails />
    </div>
  );

  // View khi sidebar thu gọn (chỉ icon + tooltip)
  const CollapsedView = () => (
    <div className="lg:hidden flex justify-center w-full">
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="p-2 rounded-md">
              <Award className="h-6 w-6 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="w-56 p-3">
            <StatsDetails />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  // View cho menu mobile (luôn mở rộng)
  const MobileView = () => (
    <div className="w-full">
      <StatsDetails />
    </div>
  );

  return (
    <>
      {/* Dành cho Desktop */}
      <div className="hidden md:block">
        <ExpandedView />
        <CollapsedView />
      </div>
      {/* Dành cho Mobile */}
      <div className="md:hidden">
        <MobileView />
      </div>
    </>
  );
};
