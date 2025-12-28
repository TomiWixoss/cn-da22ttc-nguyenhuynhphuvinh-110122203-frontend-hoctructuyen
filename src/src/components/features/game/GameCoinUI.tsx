"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { AnimatedCounter } from "@/components/ui/effects";

interface GameCoinUIProps {
  totalCoinValue: number;
}

export const GameCoinUI: React.FC<GameCoinUIProps> = ({ totalCoinValue }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="fixed top-4 left-4 z-[1000] flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-b from-sky-200 to-sky-50/90 border-2 border-b-4 border-sky-400"
    >
      <Image
        src="/ai-image/syncoin.png"
        alt="Coin icon"
        width={32}
        height={32}
        className="object-contain"
      />
      <AnimatedCounter
        value={totalCoinValue}
        duration={0.8}
        className="text-2xl font-bold text-sky-800"
      />
    </motion.div>
  );
};
