"use client";

import React, { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/forms/button";
import { AnimatedCounter } from "@/components/ui/effects";
import Image from "next/image";
import confetti from "canvas-confetti";

interface EggOpeningResult {
  egg_type: string;
  is_golden: boolean;
  reward_type: "item" | "currency";
  item?: {
    item_type: "AVATAR" | "EMOJI";
    item_id: number;
    item_name: string;
    item_code: string;
    image_path: string;
    rarity: string;
    rarity_display: string;
    rarity_color: string;
    rarity_gradient: string;
  };
  currency?: {
    currency_type: "SYNC";
    amount: number;
    original_item_rarity: string;
  };
}

interface PracticeResultsUIProps {
  onBackToMenu: () => void;
  rewardsSummary: {
    total_exp_earned: number;
    total_syncoin_earned: number;
    syncoin_from_gameplay: number;
    syncoin_from_duplicates: number;
  };
  eggOpeningResults: EggOpeningResult[];
}

// Component Icon Đồng Xu tùy chỉnh để giống với thiết kế
const CustomCoinIcon = () => (
  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-indigo-600 ring-2 ring-white/50">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-300 to-indigo-500 opacity-80" />
    </div>
  </div>
);

export default function PracticeResultsUI({
  onBackToMenu,
  rewardsSummary,
  eggOpeningResults,
}: PracticeResultsUIProps) {
  // Lấy danh sách vật phẩm từ kết quả backend
  const itemRewards = useMemo(() => {
    return eggOpeningResults
      .filter((r) => r.reward_type === "item" && r.item)
      .map((r) => r.item!);
  }, [eggOpeningResults]);

  // Hiệu ứng pháo hoa confetti khi component mount
  useEffect(() => {
    // Hàm bắn confetti từ nhiều góc
    const fireConfetti = () => {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 2000,
      };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Bắn confetti từ bên trái
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ["#FFD700", "#FFA500", "#FF69B4", "#00CED1", "#9370DB"],
        });

        // Bắn confetti từ bên phải
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ["#FFD700", "#FFA500", "#FF69B4", "#00CED1", "#9370DB"],
        });
      }, 250);
    };

    // Delay nhỏ để animation dialog hoàn thành trước
    const timer = setTimeout(() => {
      fireConfetti();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-[1500] w-full h-full flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
        // THAY ĐỔI 1: Tăng chiều rộng tối đa của dialog
        className="w-full max-w-2xl bg-[#005c9d] rounded-2xl text-white p-6 md:p-8 text-center border-2 border-cyan-400/50"
      >
        {/* Header */}
        <Trophy
          size={56}
          className="mx-auto mb-4 text-yellow-300 drop-shadow-[0_2px_8px_rgba(252,211,77,0.7)]"
        />
        <h1 className="text-3xl md:text-4xl font-bold mb-1 tracking-wide">
          Luyện Tập Hoàn Tất!
        </h1>
        <p className="text-base text-cyan-200/90 mb-6">
          Bạn đã hoàn thành xuất sắc chặng đường này.
        </p>

        {/* Dải phân cách */}
        <div className="w-full h-px bg-cyan-300/30 my-6"></div>

        {/* THAY ĐỔI 2: Tạo bố cục 2 cột cho màn hình lớn */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left">
          {/* CỘT BÊN TRÁI: THỐNG KÊ */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-center text-cyan-200/90 mb-2">
              Thống Kê
            </h3>
            {/* Số xu thu thập */}
            <div className="flex items-center justify-between bg-black/20 p-3 rounded-lg">
              <div className="flex items-center gap-4">
                <CustomCoinIcon />
                <span className="text-lg font-bold">Xu Thu Thập</span>
              </div>
              <AnimatedCounter
                value={rewardsSummary.total_syncoin_earned}
                duration={1.5}
                className="text-3xl font-bold text-yellow-300"
              />
            </div>

            {/* EXP nhận được */}
            <div className="flex items-center justify-between bg-black/20 p-3 rounded-lg">
              <div className="flex items-center gap-4">
                <Star className="w-10 h-10 text-pink-400 stroke-2" />
                <span className="text-lg font-bold">Kinh Nghiệm (EXP)</span>
              </div>
              <AnimatedCounter
                value={rewardsSummary.total_exp_earned}
                duration={1.5}
                delay={0.2}
                prefix="+"
                className="text-3xl font-bold text-pink-400"
              />
            </div>
          </div>

          {/* CỘT BÊN PHẢI: VẬT PHẨM NHẬN ĐƯỢC */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-center text-cyan-200/90 mb-2">
              Vật Phẩm Nhận Được
            </h3>
            {/* THAY ĐỔI 3: Container cho lưới vật phẩm, có cuộn nếu quá nhiều */}
            <div className="bg-black/20 p-3 rounded-lg min-h-[150px] max-h-[240px] overflow-y-auto">
              {itemRewards.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {itemRewards.map((reward) => (
                    <motion.div
                      key={reward.item_id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center text-center p-2 rounded-lg aspect-square justify-center"
                      style={{ backgroundColor: `${reward.rarity_color}20` }}
                    >
                      <Image
                        src={reward.image_path}
                        alt={reward.item_name}
                        width={56}
                        height={56}
                      />
                      <span className="text-xs font-semibold mt-1 truncate w-full">
                        {reward.item_name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-cyan-300/70">
                  <p>Không có vật phẩm mới.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="mt-8">
          <Button
            size="xl"
            onClick={onBackToMenu}
            is3DNoLayout={true}
            className="w-full h-14 text-lg font-bold"
          >
            Về Menu
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
