"use client";

import React from "react";
import { motion } from "framer-motion";

interface GameTimerUIProps {
  timeLeft: number;
  formatTime: (seconds: number) => string;
}

export const GameTimerUI: React.FC<GameTimerUIProps> = ({
  timeLeft,
  formatTime,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      // =======================================================================
      // THAY ĐỔI 2: Bảng màu HUD mới
      // =======================================================================
      className="fixed top-4 left-4 z-[1000] flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-b from-sky-200 to-sky-50/90 border-2 border-b-4 border-sky-400"
    >
      <img
        src="/kenney_new-platformer-pack-1.0/Sprites/Tiles/Default/hud_time.png"
        alt="Time icon"
        className="w-8 h-8 object-contain"
      />
      <span className="text-2xl font-bold text-sky-800 tabular-nums">
        {formatTime(timeLeft)}
      </span>
    </motion.div>
  );
};
