"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Định nghĩa lại interface để bao gồm cả độ hiếm và đường dẫn ảnh vàng
interface EggData {
  id: string;
  imagePath: string;
  goldenImagePath: string; // Thêm thuộc tính này
  isGolden: boolean;
  name: string;
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
}

interface GameEggUIProps {
  collectedEggs: EggData[];
}

// Interface cho dữ liệu trứng đã được gom nhóm
interface GroupedEgg {
  key: string;
  imagePath: string;
  goldenImagePath: string; // Thêm thuộc tính này
  count: number;
  isGolden: boolean;
  name: string;
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
}

// Bảng màu tương ứng với từng độ hiếm để làm style
const RARITY_STYLES = {
  COMMON: "border-gray-400 bg-gray-100/90 text-gray-800",
  UNCOMMON: "border-green-500 bg-green-100/90 text-green-800",
  RARE: "border-sky-500 bg-sky-100/90 text-sky-800",
  EPIC: "border-purple-500 bg-purple-100/90 text-purple-800",
  LEGENDARY: "border-amber-500 bg-amber-100/90 text-amber-800",
};

export const GameEggUI: React.FC<GameEggUIProps> = ({ collectedEggs }) => {
  const groupedEggs = useMemo((): GroupedEgg[] => {
    if (!collectedEggs || collectedEggs.length === 0) {
      return [];
    }

    const eggMap = new Map<string, GroupedEgg>();
    collectedEggs.forEach((egg) => {
      const key = `${egg.id}_${egg.isGolden}`;
      const existing = eggMap.get(key);

      if (existing) {
        existing.count++;
      } else {
        eggMap.set(key, {
          key,
          imagePath: egg.imagePath,
          goldenImagePath: egg.goldenImagePath, // Thêm thuộc tính này
          count: 1,
          isGolden: egg.isGolden,
          name: egg.name,
          rarity: egg.rarity, // Lưu lại độ hiếm
        });
      }
    });

    return Array.from(eggMap.values());
  }, [collectedEggs]);

  if (groupedEggs.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="fixed top-20 left-4 z-[1000] flex flex-col items-start gap-2"
    >
      <AnimatePresence>
        {groupedEggs.map((eggGroup) => {
          // --- THAY ĐỔI DUY NHẤT NẰM Ở ĐÂY ---
          // Chọn đúng đường dẫn ảnh để hiển thị
          const imageToDisplay =
            eggGroup.isGolden && eggGroup.goldenImagePath
              ? eggGroup.goldenImagePath
              : eggGroup.imagePath;

          return (
            <motion.div
              key={eggGroup.key}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex items-center gap-3 px-3 py-1.5 rounded-xl",
                "border-2 border-b-4",
                // --- THAY ĐỔI CHÍNH NẰM Ở ĐÂY ---
                // 1. Áp dụng style dựa trên độ hiếm
                RARITY_STYLES[eggGroup.rarity] || RARITY_STYLES.COMMON,

                // 2. Nếu là trứng vàng, áp dụng style đặc biệt đè lên
                eggGroup.isGolden &&
                  "border-yellow-400 bg-gradient-to-br from-yellow-200 to-amber-100 animate-pulse"
              )}
            >
              <Image
                src={imageToDisplay} // <-- SỬ DỤNG BIẾN MỚI
                alt={eggGroup.name}
                width={32}
                height={32}
                className="object-contain"
              />
              <span
                className={cn(
                  "text-xl font-bold tabular-nums",
                  eggGroup.isGolden && "text-yellow-800"
                )}
              >
                x{eggGroup.count}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};
