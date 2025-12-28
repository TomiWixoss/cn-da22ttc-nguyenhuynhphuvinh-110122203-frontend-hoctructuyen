"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameLeaderboardUIProps {
  position?: number;
  total?: number;
}

export const GameLeaderboardUI: React.FC<GameLeaderboardUIProps> = ({
  position,
  total,
}) => {
  const hasData = position !== undefined && total !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      // =======================================================================
      // THAY ĐỔI 3: Bảng màu HUD mới, đồng bộ với Timer
      // =======================================================================
      className="fixed top-4 right-4 z-[1000] flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-b from-sky-200 to-sky-50/90 border-2 border-b-4 border-sky-400"
    >
      <Trophy className="h-8 w-8 text-sky-700" />
      <span
        className={cn(
          "text-2xl font-bold text-sky-800 tabular-nums",
          !hasData && "animate-pulse"
        )}
      >
        {hasData ? `${position}/${total}` : "..."}
      </span>
    </motion.div>
  );
};
