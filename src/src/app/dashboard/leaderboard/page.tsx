"use client";

import React from "react";
import { Trophy } from "lucide-react";
import Leaderboard from "@/components/features/gamification/leaderboard";
import { PageHeader } from "@/components/ui/layout/page-header";

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-3 py-4 md:p-6 space-y-4 md:space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Bảng Xếp Hạng"
        description="Xem thứ hạng của bạn và so sánh với các học viên khác trong hệ thống"
        variant="leaderboard"
      />

      {/* Single Leaderboard */}
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <Leaderboard limit={20} showTimeframe={true} />
        </div>
      </div>
    </div>
  );
}
