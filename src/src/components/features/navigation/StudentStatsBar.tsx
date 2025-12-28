"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/lib/hooks/use-currency";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/feedback";

interface StudentStatsBarProps {
  className?: string;
  variant?: "full" | "icon-only"; // Thêm variant để kiểm soát hiển thị
}

export const StudentStatsBar: React.FC<StudentStatsBarProps> = ({
  className,
  variant = "full",
}) => {
  const { balance, loading: currencyLoading } = useCurrency();

  if (currencyLoading) {
    return (
      <div
        className={cn(
          "flex items-center",
          variant === "full" ? "justify-start" : "justify-center",
          className
        )}
      >
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          {variant === "full" && (
            <div className="w-16 h-6 bg-gray-200 rounded"></div>
          )}
        </div>
      </div>
    );
  }

  const syncBalance = balance?.currencies?.SYNC?.balance || 0;

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // View khi sidebar thu gọn - chỉ icon với tooltip
  const CollapsedView = () => (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center p-1 rounded-md hover:bg-primary/5 transition-colors cursor-pointer">
            <div className="w-8 h-8 relative flex-shrink-0">
              <Image
                src="/ai-image/syncoin.png"
                alt="SynCoin"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-semibold">
          <span style={{ color: "#4FBBA6" }}>{formatNumber(syncBalance)}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // View khi sidebar mở rộng - hiển thị đầy đủ
  const ExpandedView = () => (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 relative flex-shrink-0">
        <Image
          src="/ai-image/syncoin.png"
          alt="SynCoin"
          width={32}
          height={32}
          className="object-contain"
        />
      </div>
      <span
        className="text-lg font-semibold tabular-nums leading-none"
        style={{ color: "#4FBBA6" }}
      >
        {formatNumber(syncBalance)}
      </span>
    </div>
  );

  // Nếu variant là "icon-only", chỉ hiển thị icon với tooltip
  if (variant === "icon-only") {
    return (
      <div className={cn("flex justify-center", className)}>
        <CollapsedView />
      </div>
    );
  }

  // Mặc định hiển thị đầy đủ
  return (
    <div className={cn("flex justify-start", className)}>
      <ExpandedView />
    </div>
  );
};
