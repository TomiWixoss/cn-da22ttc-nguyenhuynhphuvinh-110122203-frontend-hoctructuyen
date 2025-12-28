"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag } from "lucide-react";

interface CheckpointNotificationProps {
  isVisible: boolean;
  message: string;
  duration?: number;
}

export const CheckpointNotification: React.FC<CheckpointNotificationProps> = ({
  isVisible,
  message,
  duration = 3000, // Mặc định là 3 giây
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100, transition: { duration: 0.5 } }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          // Vị trí ở trên cùng, chính giữa màn hình
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[3000] pointer-events-none"
        >
          {/* Panel thông báo với phong cách đồng bộ */}
          <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-b from-sky-200 to-sky-50/90 border-2 border-b-4 border-sky-400">
            <div className="flex items-center gap-3">
              <Flag className="w-8 h-8 text-sky-700" />
              <span className="text-xl font-bold text-sky-800">{message}</span>
            </div>
            {/* Thanh tiến trình đếm ngược thời gian hiển thị */}
            <div className="w-full h-1.5 bg-sky-400/30 rounded-full mt-2 overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
