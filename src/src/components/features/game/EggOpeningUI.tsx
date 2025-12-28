"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Interface cho kết quả từ backend
interface EggOpeningResult {
  egg_type: "BASIC" | "CAT" | "DRAGON" | "RAINBOW" | "LEGENDARY";
  is_golden: boolean;
  reward_type: "item" | "currency";
  item?: {
    item_type: "AVATAR" | "EMOJI";
    item_id: number;
    item_name: string;
    item_code: string;
    image_path: string;
    rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
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

// Cấu trúc state mới cho từng quả trứng
type EggStatus = "unopened" | "opened";

interface EggState {
  id: string;
  eggData: any;
  status: EggStatus;
  reward: EggOpeningResult | null;
}

interface EggOpeningUIProps {
  eggsToOpen: any[];
  eggOpeningResults: EggOpeningResult[];
  onComplete: () => void;
}

const EggOpeningUI: React.FC<EggOpeningUIProps> = ({
  eggsToOpen,
  eggOpeningResults,
  onComplete,
}) => {
  const [eggStates, setEggStates] = useState<EggState[]>([]);
  const [allEggsOpened, setAllEggsOpened] = useState(false);

  // Khởi tạo state ban đầu từ props
  useEffect(() => {
    setEggStates(
      eggsToOpen.map((egg, index) => ({
        id: `${egg.id}_${index}_${Math.random()}`,
        eggData: egg,
        status: "unopened",
        reward: null,
      }))
    );
  }, [eggsToOpen]);

  // Xử lý click để mở trứng - lấy kết quả từ backend
  const handleEggClick = (index: number) => {
    if (eggStates[index].status !== "unopened" || allEggsOpened) return;

    // Lấy kết quả từ backend (đã được tính toán sẵn)
    const reward = eggOpeningResults[index];

    // Cập nhật trạng thái của quả trứng
    setEggStates((currentStates) =>
      currentStates.map((eggState, i) =>
        i === index ? { ...eggState, status: "opened", reward } : eggState
      )
    );
  };

  // Kiểm tra khi nào tất cả trứng đã được mở
  useEffect(() => {
    const openedCount = eggStates.filter((e) => e.status === "opened").length;
    const totalEggs = eggStates.length;

    if (totalEggs > 0 && openedCount === totalEggs) {
      setAllEggsOpened(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  }, [eggStates, onComplete]);

  return (
    <div className="absolute inset-0 z-[2000] bg-black/60 backdrop-blur-lg flex flex-col items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        {/* Thay đổi văn bản từ "Mở trứng" thành "Đập trứng" */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
          {allEggsOpened ? "Đã nhận vật phẩm!" : "Đập Trứng!"}
        </h1>
        <p className="text-lg text-slate-200 mt-2">
          {allEggsOpened
            ? "Đang chuẩn bị bảng kết quả..."
            : "Click vào từng quả trứng để xem vật phẩm bên trong!"}
        </p>
      </motion.div>

      {/* Giao diện lưới trứng - hiển thị tất cả trứng cùng lúc */}
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {eggStates.map((eggState, index) => (
            <div
              key={eggState.id}
              className="relative aspect-square cursor-pointer"
              onClick={() => handleEggClick(index)}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Card Vật phẩm/Vàng (hiện ra sau khi đập) */}
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 rounded-lg"
                style={{
                  backfaceVisibility: "hidden",
                  backgroundColor:
                    eggState.reward?.reward_type === "item"
                      ? `${eggState.reward.item?.rarity_color}20`
                      : "rgba(252, 211, 77, 0.2)",
                }}
                initial={{ rotateY: 180 }}
                animate={{ rotateY: eggState.status === "opened" ? 0 : 180 }}
                transition={{ duration: 0.6 }}
              >
                {eggState.reward?.reward_type === "item" &&
                  eggState.reward.item && (
                    <>
                      <Image
                        src={eggState.reward.item.image_path}
                        alt={eggState.reward.item.item_name}
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                      <p className="text-xs font-bold mt-1 text-white truncate w-full">
                        {eggState.reward.item.item_name}
                      </p>
                      <p
                        className="text-[10px]"
                        style={{
                          color: eggState.reward.item.rarity_color,
                        }}
                      >
                        {eggState.reward.item.rarity_display}
                      </p>
                    </>
                  )}
                {eggState.reward?.reward_type === "currency" &&
                  eggState.reward.currency && (
                    <>
                      <Image
                        src="/ai-image/syncoin.png"
                        alt="SynCoin"
                        width={64}
                        height={64}
                        className="object-contain"
                      />
                      <p className="text-sm font-bold mt-1 text-yellow-300 truncate w-full">
                        +{eggState.reward.currency.amount} SynCoin
                      </p>
                      <p className="text-[10px] text-yellow-400">
                        (Vật phẩm trùng)
                      </p>
                    </>
                  )}
              </motion.div>

              {/* Card Quả trứng (ẩn đi sau khi đập) */}
              <motion.div
                className={cn(
                  "absolute inset-0 flex items-center justify-center rounded-lg",
                  "bg-white/10 hover:bg-white/20 transition-colors duration-300"
                )}
                style={{
                  backfaceVisibility: "hidden",
                }}
                initial={{ rotateY: 0 }}
                animate={{ rotateY: eggState.status === "opened" ? -180 : 0 }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src={
                    eggState.eggData.isGolden
                      ? eggState.eggData.goldenImagePath
                      : eggState.eggData.imagePath
                  }
                  alt="Trứng"
                  width={80}
                  height={80}
                  className={cn(
                    "object-contain",
                    eggState.eggData.isGolden && "animate-pulse"
                  )}
                />
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Hiển thị loading khi hoàn tất */}
      {allEggsOpened && (
        <div className="mt-8 flex items-center text-white text-xl">
          <Loader2 className="animate-spin mr-3" />
          Hoàn tất...
        </div>
      )}
    </div>
  );
};

export default EggOpeningUI;
