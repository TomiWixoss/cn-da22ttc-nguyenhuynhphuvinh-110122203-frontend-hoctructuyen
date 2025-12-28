"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { ChevronUp, ChevronDown, Check, Lock, Gift, Star } from "lucide-react";
import { levelProgressService } from "@/lib/services/api/level-progress.service";
import type { LevelProgressData } from "@/lib/types/level-progress";
import { cn } from "@/lib/utils";
import { getVietnameseTierName } from "@/lib/utils/tier-assets";
import gsap from "gsap";

interface LevelProgressTrackerProps {
  className?: string;
}

export const LevelProgressTracker: React.FC<LevelProgressTrackerProps> = ({
  className,
}) => {
  const [data, setData] = useState<LevelProgressData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTierIndex, setActiveTierIndex] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP refs
  const headerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const pathContainerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);
  const pathsRef = useRef<(SVGPathElement | null)[]>([]);

  // State cho modal thưởng với delay
  const [rewardModal, setRewardModal] = useState<{
    show: boolean;
    level: number;
    reward: any;
  }>({ show: false, level: 0, reward: null });

  // Ref để quản lý timeout
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handler cho hover vào node có thưởng với delay
  const handleRewardHover = (node: any) => {
    if (node.avatar_reward) {
      // Clear leave timeout nếu đang chờ
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
        leaveTimeoutRef.current = null;
      }

      // Clear hover timeout cũ
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      // Set timeout để hiện modal sau 300ms
      hoverTimeoutRef.current = setTimeout(() => {
        setRewardModal({
          show: true,
          level: node.level,
          reward: node.avatar_reward,
        });
      }, 300);
    }
  };

  const handleRewardLeave = () => {
    // Clear hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // Set timeout để ẩn modal sau 200ms
    leaveTimeoutRef.current = setTimeout(() => {
      setRewardModal({ show: false, level: 0, reward: null });
    }, 200);
  };

  // Handler cho hover vào modal để giữ nó hiển thị
  const handleModalHover = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  const handleModalLeave = () => {
    setRewardModal({ show: false, level: 0, reward: null });
  };

  // Cleanup timeouts khi component unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await levelProgressService.getLevelProgressTracker();
        setData(res);
        const idx = res.tiers.findIndex(
          (t) => t.tier_name.toLowerCase() === res.current_tier.toLowerCase()
        );
        setActiveTierIndex(idx >= 0 ? idx : 0);
      } catch (e) {
        setError("Không thể tải tiến trình cấp độ");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Track container width for responsive positioning
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const currentTier = useMemo(
    () => (data ? data.tiers[activeTierIndex] : null),
    [data, activeTierIndex]
  );

  // GSAP Animation: Initial page load - nhẹ nhàng hơn
  useEffect(() => {
    if (!loading && data && headerRef.current && tabsRef.current) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline();

        // Header animation - fade in đơn giản
        tl.fromTo(
          headerRef.current,
          {
            opacity: 0,
            y: -20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          }
        )
          // Tabs animation - fade in
          .fromTo(
            tabsRef.current,
            {
              opacity: 0,
              y: 10,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
            },
            "-=0.3"
          );
      });

      return () => ctx.revert();
    }
  }, [loading, data]);

  // GSAP Animation: Level nodes và paths - hiện từng cục một từ trên xuống
  useEffect(() => {
    if (!loading && currentTier && nodesRef.current.length > 0) {
      const validNodes = nodesRef.current.filter((node) => node !== null);
      const validPaths = pathsRef.current.filter((path) => path !== null);

      if (validNodes.length > 0) {
        // Set tất cả về invisible ban đầu - CHỈ animate opacity và scale trong chính node
        validNodes.forEach((node) => {
          const button = node.querySelector("button");
          if (button) {
            gsap.set(button, {
              opacity: 0,
              scale: 0,
            });
          }
        });

        // Set paths về invisible và prepare for draw animation
        if (validPaths.length > 0) {
          validPaths.forEach((path) => {
            const length = path.getTotalLength();
            gsap.set(path, {
              strokeDasharray: length,
              strokeDashoffset: length,
              opacity: 0,
            });
          });
        }

        // Animate từng node và path một, từ trên xuống dưới
        validNodes.forEach((node, index) => {
          const button = node.querySelector("button");

          // Animate node button (không động vào container)
          if (button) {
            gsap.to(button, {
              opacity: 1,
              scale: 1,
              duration: 0.4,
              delay: index * 0.15, // Delay 150ms giữa mỗi node
              ease: "back.out(1.5)",
            });
          }

          // Animate path đến node tiếp theo (nếu có)
          if (index < validPaths.length) {
            const path = validPaths[index];
            gsap.to(path, {
              strokeDashoffset: 0,
              opacity: 1,
              duration: 0.5,
              delay: index * 0.15 + 0.2, // Bắt đầu vẽ path sau khi node xuất hiện
              ease: "power2.inOut",
            });
          }
        });
      }
    }
  }, [loading, currentTier, activeTierIndex]);

  // GSAP Animation: Tier change - fade đơn giản
  useEffect(() => {
    if (pathContainerRef.current && !loading && data) {
      gsap.fromTo(
        pathContainerRef.current,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        }
      );
    }
  }, [activeTierIndex, loading, data]);

  // Tính toán tiến trình của tier hiện tại
  const tierProgress = useMemo(() => {
    if (!currentTier || !data) return { completed: 0, total: 0, percentage: 0 };

    const completed = currentTier.levels.filter(
      (level) => level.is_unlocked
    ).length;
    const total = currentTier.levels.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, percentage };
  }, [currentTier, data]);

  // Tính toán XP progress cho level hiện tại với thông tin chi tiết
  const getCurrentLevelProgress = () => {
    if (!data || !currentTier) return null;

    const currentLevel = currentTier.levels.find((l) => l.is_current);
    if (!currentLevel) return null;

    // Giả sử user có một số XP hiện tại (mock data - trong thực tế sẽ lấy từ API)
    const currentXP = Math.floor(currentLevel.xp_required * 0.7); // 70% tiến trình
    const requiredXP = currentLevel.xp_required;
    const percentage = (currentXP / requiredXP) * 100;
    const remainingXP = requiredXP - currentXP;

    return {
      percentage: Math.min(percentage, 100),
      currentLevel: currentLevel.level,
      currentXP,
      requiredXP,
      remainingXP,
    };
  };

  // Helper function để Việt hóa description
  const vietnamizeDescription = (description: string): string => {
    return description
      .replace(/tier Silver/gi, `bậc ${getVietnameseTierName("Silver")}`)
      .replace(/tier Bronze/gi, `bậc ${getVietnameseTierName("Bronze")}`)
      .replace(/tier Wood/gi, `bậc ${getVietnameseTierName("Wood")}`)
      .replace(/tier Gold/gi, `bậc ${getVietnameseTierName("Gold")}`)
      .replace(/tier Platinum/gi, `bậc ${getVietnameseTierName("Platinum")}`)
      .replace(/tier Onyx/gi, `bậc ${getVietnameseTierName("Onyx")}`)
      .replace(/tier Sapphire/gi, `bậc ${getVietnameseTierName("Sapphire")}`)
      .replace(/tier Ruby/gi, `bậc ${getVietnameseTierName("Ruby")}`)
      .replace(/tier Amethyst/gi, `bậc ${getVietnameseTierName("Amethyst")}`)
      .replace(/tier Master/gi, `bậc ${getVietnameseTierName("Master")}`);
  };

  const claimReward = async (level: number) => {
    try {
      await levelProgressService.claimAvatar(level);
      setData((prev) => {
        if (!prev) return prev;
        const clone: LevelProgressData = JSON.parse(JSON.stringify(prev));
        for (const tier of clone.tiers) {
          const node = tier.levels.find((l) => l.level === level);
          if (node && node.avatar_reward) {
            node.reward_claimed = true;
            if (!clone.user_avatars.includes(node.avatar_reward.avatar)) {
              clone.user_avatars.push(node.avatar_reward.avatar);
            }
            break;
          }
        }
        return clone;
      });
    } catch (e) {
      // ignore for mock demo
    }
  };

  const levelProgress = getCurrentLevelProgress();

  // Helper function để lấy gradient color theo tier
  const getTierGradient = (tierName: string) => {
    const tier = tierName.toLowerCase();
    switch (tier) {
      case "wood":
        return "from-amber-600 to-yellow-700";
      case "bronze":
        return "from-orange-600 to-red-700";
      case "silver":
        return "from-slate-400 to-slate-600";
      case "gold":
        return "from-yellow-400 to-yellow-600";
      case "platinum":
        return "from-cyan-400 to-blue-600";
      case "onyx":
        return "from-gray-800 to-black";
      case "sapphire":
        return "from-blue-600 to-indigo-700";
      case "ruby":
        return "from-red-600 to-pink-700";
      case "amethyst":
        return "from-purple-600 to-violet-700";
      case "master":
        return "from-gradient-start via-gradient-middle to-gradient-end";
      default:
        return "from-slate-600 to-slate-700";
    }
  };

  // Helper function để chuyển số thành số La Mã
  const toRoman = (num: number): string => {
    const romanNumerals = [
      { value: 12, symbol: "XII" },
      { value: 11, symbol: "XI" },
      { value: 10, symbol: "X" },
      { value: 9, symbol: "IX" },
      { value: 8, symbol: "VIII" },
      { value: 7, symbol: "VII" },
      { value: 6, symbol: "VI" },
      { value: 5, symbol: "V" },
      { value: 4, symbol: "IV" },
      { value: 3, symbol: "III" },
      { value: 2, symbol: "II" },
      { value: 1, symbol: "I" },
    ];

    for (const numeral of romanNumerals) {
      if (num >= numeral.value) {
        return numeral.symbol;
      }
    }
    return "I";
  };

  // Helper function để lấy tier icon path
  const getTierIconPath = (tierName: string, level: number) => {
    const tier = tierName.toLowerCase();
    // Sử dụng level % 12 để cycle qua các icon (1-12)
    const iconNumber = ((level - 1) % 12) + 1;
    return `/vector-ranks-pack/${tier}/diamond-${tier}-${iconNumber}.png`;
  };

  // Helper function để lấy màu của level node theo style Duolingo
  const getLevelNodeColor = (node: any) => {
    if (node.is_current) {
      return {
        background: "rgb(28, 176, 246)", // macaw color
        border: "rgb(24, 153, 214)", // whale color
        shadow: "rgb(20, 83, 163)", // narwhal color
        text: "white",
      };
    } else if (node.is_unlocked) {
      return {
        background: "rgb(88, 204, 2)", // owl color
        border: "rgb(88, 167, 0)", // tree-frog color
        shadow: "rgb(68, 147, 0)", // darker green
        text: "white",
      };
    } else {
      return {
        background: "rgb(229, 229, 229)", // swan color
        border: "rgb(175, 175, 175)", // hare color
        shadow: "rgb(119, 119, 119)", // wolf color
        text: "rgb(119, 119, 119)", // wolf color
      };
    }
  };

  // Helper function để tính vị trí cho đường path cong - so le với tier icon - RESPONSIVE
  const getNodePosition = (index: number) => {
    const nodeWidth = 70; // Độ rộng của 1 node
    // Responsive zigzag width - nhỏ hơn trên mobile
    const zigzagWidth =
      containerWidth < 640 ? 60 : containerWidth < 768 ? 100 : 180;
    const centerX = containerWidth / 2; // Tâm container
    // Responsive vertical spacing - nhỏ hơn trên mobile
    const verticalSpacing = containerWidth < 640 ? 120 : 140;

    // Tạo pattern zigzag từ center với spacing nhỏ hơn
    const isEven = index % 2 === 0;
    let horizontalOffset;

    if (isEven) {
      horizontalOffset = centerX - nodeWidth / 2; // center
    } else {
      // So le trái phải
      const direction = Math.floor(index / 2) % 2 === 0 ? -1 : 1;
      horizontalOffset =
        centerX + (direction * zigzagWidth) / 2 - nodeWidth / 2;
    }

    return {
      x: horizontalOffset,
      y: index * verticalSpacing + 20,
    };
  };

  // Skeleton Loading Component
  if (loading) {
    return (
      <div className={cn("flex flex-col space-y-4", className)}>
        {/* Header Skeleton */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 animate-pulse">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="text-center">
              {/* Icon skeleton */}
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-300 dark:bg-slate-700" />
              </div>

              {/* Title skeleton */}
              <div className="h-8 sm:h-10 w-48 sm:w-64 bg-slate-300 dark:bg-slate-700 rounded-lg mx-auto mb-2 sm:mb-3" />

              {/* Stats skeleton */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="h-6 w-32 bg-slate-300 dark:bg-slate-700 rounded-full" />
                <div className="h-6 w-40 bg-slate-300 dark:bg-slate-700 rounded-full" />
              </div>

              {/* Progress bar skeleton */}
              <div className="max-w-md mx-auto px-2 sm:px-0">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-3 w-20 bg-slate-300 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-12 bg-slate-300 dark:bg-slate-700 rounded" />
                </div>
                <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-2.5 sm:h-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <div className="p-1.5 sm:p-2">
            <div className="flex gap-1 justify-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 w-20 sm:w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Level Path Skeleton */}
        <div className="rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="relative p-4 sm:p-8 flex justify-center min-h-[800px]">
            <div className="relative w-full max-w-4xl">
              {/* Node skeletons */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: "50%",
                    top: `${i * 120 + 20}px`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Tier icon skeleton */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />

                    {/* Node button skeleton */}
                    <div className="w-[70px] h-[65px] bg-slate-300 dark:bg-slate-600 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={cn("flex flex-col space-y-4", className)}>
        <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!data || !currentTier) return null;

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {/* Enhanced Header with gradient background and decorative blur effects */}
      <div
        ref={headerRef}
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      >
        {/* Decorative blur effects */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl" />

        <div className="relative z-10 p-4 sm:p-6 md:p-8">
          <div className="text-center">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r ${getTierGradient(
                  currentTier.tier_name
                )} p-0.5`}
              >
                <div className="w-full h-full rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden">
                  <img
                    src={getTierIconPath(
                      currentTier.tier_name,
                      currentTier.max_level
                    )}
                    alt={`${currentTier.tier_name} tier icon`}
                    className="w-9 h-9 sm:w-12 sm:h-12 object-contain"
                  />
                </div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent mb-2 sm:mb-3">
              Bậc {getVietnameseTierName(currentTier.tier_name)}
            </h1>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-white/90 text-xs sm:text-sm mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 sm:px-3 bg-white/10 rounded-full">
                  Cấp {currentTier.min_level} - {currentTier.max_level}
                </span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-white/50 rounded-full" />
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 sm:px-3 bg-white/10 rounded-full">
                  {tierProgress.completed}/{tierProgress.total} cấp hoàn thành
                </span>
              </div>
            </div>

            {/* Progress bar with enhanced styling */}
            <div className="max-w-md mx-auto px-2 sm:px-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-white/70">Tiến trình bậc</span>
                <span className="text-xs text-white font-medium">
                  {Math.round(tierProgress.percentage)}%
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2.5 sm:h-3">
                <div
                  className={`h-2.5 sm:h-3 rounded-full transition-all duration-700 bg-gradient-to-r ${getTierGradient(
                    currentTier.tier_name
                  )}`}
                  style={{ width: `${tierProgress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Tabs Navigation */}
      <div
        ref={tabsRef}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
      >
        <div className="p-1.5 sm:p-2">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
            <div className="flex gap-1 justify-start sm:justify-center min-w-max sm:min-w-0">
              {data.tiers.map((tier, index) => {
                const isActive = index === activeTierIndex;
                const isUnlocked = tier.levels.some(
                  (level) => level.is_unlocked
                );
                const isCurrentTier =
                  tier.tier_name.toLowerCase() ===
                  data.current_tier.toLowerCase();

                return (
                  <button
                    key={tier.tier_name}
                    onClick={() => setActiveTierIndex(index)}
                    className={cn(
                      "relative flex-shrink-0 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap text-center",
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600"
                        : isUnlocked || isCurrentTier
                        ? "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                        : "text-slate-500 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300" // Cho phép click vào bậc chưa mở khóa
                    )}
                    // Bỏ disabled để cho phép xem tất cả các bậc
                  >
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                      {/* Tier name */}
                      <span className="font-semibold text-xs sm:text-sm">
                        {getVietnameseTierName(tier.tier_name)}
                      </span>

                      {/* Current indicator */}
                      {isCurrentTier && (
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3D Level Path */}
      <div ref={pathContainerRef} className="rounded-lg overflow-hidden">
        <div
          ref={containerRef}
          className="relative p-2 sm:p-4 flex justify-center"
          style={{
            minHeight: `${Math.max(
              1800,
              currentTier.levels.length * (containerWidth < 640 ? 120 : 140) +
                300
            )}px`, // Responsive height
          }}
        >
          {/* Container cho path - căn giữa */}
          <div className="relative w-full max-w-4xl">
            {/* SVG Path cho đường cong với màu sắc theo trạng thái */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
            >
              <defs>
                {/* Gradient cho path hoàn thành */}
                <linearGradient
                  id="completedGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.6" />
                </linearGradient>
                {/* Gradient cho path hiện tại */}
                <linearGradient
                  id="currentGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.6" />
                </linearGradient>
                {/* Gradient cho path chưa mở khóa */}
                <linearGradient
                  id="lockedGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#9ca3af" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6b7280" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Vẽ path cho từng đoạn theo trạng thái với XP progress */}
              {currentTier.levels.length > 1 &&
                currentTier.levels.slice(1).map((level, index) => {
                  const currentPos = getNodePosition(index);
                  const nextPos = getNodePosition(index + 1);
                  const currentLevel = currentTier.levels[index];
                  const nextLevel = currentTier.levels[index + 1];

                  const pathD = `M ${currentPos.x + 40} ${
                    currentPos.y + 40
                  } Q ${nextPos.x + (index % 2 === 0 ? -30 : 30)} ${
                    nextPos.y
                  } ${nextPos.x + 40} ${nextPos.y + 40}`;

                  // Xác định màu của đoạn path
                  let strokeColor = "url(#lockedGradient)";
                  let strokeWidth = 3;
                  let strokeDasharray = "6,4";

                  if (currentLevel.is_unlocked && nextLevel.is_unlocked) {
                    strokeColor = "url(#completedGradient)";
                    strokeWidth = 4;
                    strokeDasharray = "none";
                  } else if (currentLevel.is_unlocked && nextLevel.is_current) {
                    strokeColor = "url(#currentGradient)";
                    strokeWidth = 4;
                    strokeDasharray = "8,4";
                  } else if (currentLevel.is_current && levelProgress) {
                    // Hiện thị XP progress path từ current node đến next node
                    const pathLength = 200; // Độ dài ước tính cho path
                    const progressLength =
                      (levelProgress.percentage / 100) * pathLength;

                    return (
                      <g key={`progress-path-${index}`}>
                        {/* Background path */}
                        <path
                          d={pathD}
                          stroke="url(#lockedGradient)"
                          strokeWidth={4}
                          fill="none"
                          strokeDasharray="none"
                        />
                        {/* XP Progress path - kéo dần theo XP */}
                        <path
                          d={pathD}
                          stroke="url(#currentGradient)"
                          strokeWidth={5}
                          fill="none"
                          strokeDasharray={`${progressLength} ${
                            pathLength - progressLength
                          }`}
                          strokeDashoffset="0"
                          className="transition-all duration-700"
                          strokeLinecap="round"
                        />
                      </g>
                    );
                  }

                  return (
                    <path
                      key={`path-${index}`}
                      ref={(el) => {
                        pathsRef.current[index] = el;
                      }}
                      d={pathD}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      fill="none"
                      strokeDasharray={strokeDasharray}
                      className={
                        currentLevel.is_unlocked ? "" : "animate-pulse"
                      }
                    />
                  );
                })}
            </svg>

            {/* Level Nodes */}
            {currentTier.levels.map((node, index) => {
              const position = getNodePosition(index);
              return (
                <div
                  key={node.level}
                  ref={(el) => {
                    nodesRef.current[index] = el;
                  }}
                  className="absolute will-change-transform"
                  style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    zIndex: 10,
                  }}
                >
                  {/* Duolingo-style 3D Level Button với Tier Icon */}
                  <div className="relative group">
                    {/* Main button with Duolingo 3D styling */}
                    <button
                      className={cn(
                        "relative w-[70px] h-[65px] flex items-center justify-center font-bold text-lg",
                        "outline-none border-none",
                        !node.is_unlocked && "cursor-not-allowed"
                      )}
                      onMouseEnter={(e) => {
                        handleRewardHover(node);
                        if (node.is_unlocked) {
                          gsap.to(e.currentTarget, {
                            scale: 1.08,
                            y: -4,
                            duration: 0.25,
                            ease: "power2.out",
                          });
                        }
                      }}
                      onMouseLeave={(e) => {
                        handleRewardLeave();
                        gsap.to(e.currentTarget, {
                          scale: 1,
                          y: 0,
                          duration: 0.25,
                          ease: "power2.out",
                        });
                        e.currentTarget.style.transform = "translateY(0px)";
                        e.currentTarget.style.boxShadow = `
                          0 10px 0 ${getLevelNodeColor(node).shadow},
                          inset 0 -4px 8px rgba(0,0,0,0.15),
                          inset 0 4px 0 rgba(255,255,255,0.3)
                        `;
                      }}
                      style={{
                        backgroundColor: getLevelNodeColor(node).background,
                        color: getLevelNodeColor(node).text,
                        borderRadius: "50% / 60%", // Oval shape - wider at top, narrower at bottom
                        boxShadow: `
                          0 10px 0 ${getLevelNodeColor(node).shadow},
                          inset 0 -4px 8px rgba(0,0,0,0.15),
                          inset 0 4px 0 rgba(255,255,255,0.3)
                        `,
                        filter: "none",
                        WebkitTapHighlightColor: "transparent",
                        touchAction: "manipulation",
                        transform: "translateZ(0)",
                      }}
                      onClick={() =>
                        node.is_unlocked &&
                        node.avatar_reward &&
                        !node.reward_claimed &&
                        claimReward(node.level)
                      }
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = "translateY(6px)";
                        e.currentTarget.style.boxShadow = `
                          0 4px 0 ${getLevelNodeColor(node).shadow},
                          0 2px 4px rgba(0,0,0,0.15),
                          inset 0 -2px 4px rgba(0,0,0,0.25),
                          inset 0 2px 0 rgba(255,255,255,0.15)
                        `;
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = "translateY(0px)";
                        e.currentTarget.style.boxShadow = `
                          0 10px 0 ${getLevelNodeColor(node).shadow},
                          inset 0 -4px 8px rgba(0,0,0,0.15),
                          inset 0 4px 0 rgba(255,255,255,0.3)
                        `;
                      }}
                    >
                      {/* Level content - luôn hiển thị số cấp độ */}
                      <span className="text-xl font-bold">{node.level}</span>
                    </button>

                    {/* Tier Icon - hiển thị TO HƠN và TÁCH RA khỏi node - RESPONSIVE */}
                    <div
                      className={cn(
                        "absolute top-1/2 transform -translate-y-1/2 z-10", // Bỏ transition-all để không bị ảnh hưởng hover
                        index % 2 === 0
                          ? "-left-16 sm:-left-20 md:-left-24"
                          : "-right-16 sm:-right-20 md:-right-24" // Responsive positioning
                      )}
                    >
                      <div className="relative flex flex-col items-center pointer-events-none">
                        {" "}
                        {/* Thêm pointer-events-none */}
                        {/* Tier Icon TO HƠN - không có glow effect - RESPONSIVE */}
                        <div className="relative">
                          <img
                            src={getTierIconPath(
                              currentTier.tier_name,
                              node.level
                            )}
                            alt={`${currentTier.tier_name} level ${node.level}`}
                            className={cn(
                              "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain transition-all duration-300", // Responsive sizes
                              node.is_unlocked
                                ? "opacity-100 scale-100"
                                : "opacity-60 grayscale scale-90"
                            )}
                          />
                        </div>
                        {/* Tier text hiển thị ngay bên dưới - RESPONSIVE */}
                        <div className="mt-0.5 sm:mt-1 px-1.5 sm:px-2 py-0.5 bg-black/70 dark:bg-white/20 text-white text-[10px] sm:text-xs rounded-full font-semibold text-center whitespace-nowrap">
                          {getVietnameseTierName(currentTier.tier_name)}{" "}
                          {toRoman(index + 1)}
                        </div>
                      </div>
                    </div>

                    {/* XP Progress indicator cho current level - RESPONSIVE */}
                    {node.is_current && levelProgress && (
                      <div className="absolute -bottom-8 sm:-bottom-10 left-1/2 transform -translate-x-1/2 bg-blue-900/90 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap z-20">
                        {Math.round(levelProgress.percentage)}% XP
                      </div>
                    )}

                    {/* Reward indicator với style Duolingo - RESPONSIVE */}
                    {node.avatar_reward && (
                      <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 z-20">
                        <div
                          className={cn(
                            "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white transition-all border-b-2 border-r-1",
                            node.reward_claimed
                              ? "border-green-600"
                              : node.is_unlocked
                              ? "border-orange-600 animate-pulse"
                              : "border-gray-400"
                          )}
                          style={{
                            backgroundColor: node.reward_claimed
                              ? "rgb(88, 204, 2)" // owl green
                              : node.is_unlocked
                              ? "rgb(255, 200, 0)" // bee yellow
                              : "rgb(175, 175, 175)", // hare gray
                            borderBottomColor: node.reward_claimed
                              ? "rgb(68, 147, 0)" // darker green
                              : node.is_unlocked
                              ? "rgb(205, 121, 0)" // guinea-pig orange
                              : "rgb(119, 119, 119)", // wolf gray
                            borderRightColor: node.reward_claimed
                              ? "rgb(88, 167, 0)" // tree-frog
                              : node.is_unlocked
                              ? "rgb(255, 177, 0)" // lion
                              : "rgb(119, 119, 119)", // wolf gray
                            boxShadow: `
                              0 2px 0 ${
                                node.reward_claimed
                                  ? "rgb(68, 147, 0)"
                                  : node.is_unlocked
                                  ? "rgb(205, 121, 0)"
                                  : "rgb(119, 119, 119)"
                              },
                              0 3px 6px rgba(0,0,0,0.15),
                              0 5px 10px rgba(0,0,0,0.1),
                              inset 0 -1px 0 rgba(0,0,0,0.1),
                              inset 0 1px 0 rgba(255,255,255,0.2)
                            `,
                          }}
                        >
                          {node.reward_claimed ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Star className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Enhanced level info tooltip với thông tin XP chi tiết */}
                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-[999] pointer-events-none">
                      {node.is_current && levelProgress ? (
                        <div className="text-center">
                          <div className="font-semibold text-blue-300">
                            Cấp {node.level} (Hiện tại)
                          </div>
                          <div className="mt-1">
                            <span className="text-green-300">
                              {levelProgress.currentXP.toLocaleString()}
                            </span>
                            <span className="text-slate-300"> / </span>
                            <span className="text-yellow-300">
                              {levelProgress.requiredXP.toLocaleString()}
                            </span>
                            <span className="text-slate-300"> XP</span>
                          </div>
                          <div className="text-orange-300 font-medium">
                            Còn {levelProgress.remainingXP.toLocaleString()} XP
                            để lên cấp {node.level + 1}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="font-semibold">
                            Cấp {node.level}{" "}
                            {node.is_unlocked
                              ? "(Hoàn thành)"
                              : "(Chưa mở khóa)"}
                          </div>
                          <div className="text-slate-300">
                            {node.xp_required.toLocaleString()} XP yêu cầu
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Reward Modal - Hiển thị bên phải node */}
            {rewardModal.show && rewardModal.reward && (
              <div
                className="absolute z-[999] pointer-events-none"
                style={{
                  left: `${(() => {
                    const nodeIndex = currentTier.levels.findIndex(
                      (l) => l.level === rewardModal.level
                    );
                    const position = getNodePosition(nodeIndex);
                    return position.x + 100; // Hiển thị bên phải node 100px
                  })()}px`,
                  top: `${(() => {
                    const nodeIndex = currentTier.levels.findIndex(
                      (l) => l.level === rewardModal.level
                    );
                    const position = getNodePosition(nodeIndex);
                    return position.y - 20; // Điều chỉnh vị trí dọc
                  })()}px`,
                }}
              >
                <div
                  className="bg-white dark:bg-slate-800 rounded-2xl p-4 w-80 transform transition-all pointer-events-auto border border-slate-200 dark:border-slate-700 relative z-[1000]"
                  onMouseEnter={handleModalHover}
                  onMouseLeave={handleModalLeave}
                >
                  {/* Arrow pointer */}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
                    <div className="w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-white dark:border-r-slate-800"></div>
                    <div className="absolute w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-slate-200 dark:border-r-slate-700 -left-px"></div>
                  </div>

                  <div className="text-left">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <img
                          src={rewardModal.reward.avatar_path}
                          alt={rewardModal.reward.avatar_name}
                          className="w-16 h-16 rounded-lg object-contain bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                          🎉 Phần thưởng cấp {rewardModal.level}
                        </h3>

                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          {rewardModal.reward.avatar_name}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                          {vietnamizeDescription(
                            rewardModal.reward.description ||
                              "Phần thưởng đặc biệt cho cấp độ này"
                          )}
                        </p>

                        {currentTier.levels.find(
                          (l) => l.level === rewardModal.level
                        )?.is_unlocked && (
                          <div>
                            {currentTier.levels.find(
                              (l) => l.level === rewardModal.level
                            )?.reward_claimed ? (
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                                <Check className="w-3 h-3" />
                                Đã nhận thưởng
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  claimReward(rewardModal.level);
                                  handleModalLeave();
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full text-sm font-medium transition-all transform hover:scale-105"
                              >
                                <Gift className="w-3 h-3" />
                                Nhận thưởng
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelProgressTracker;
