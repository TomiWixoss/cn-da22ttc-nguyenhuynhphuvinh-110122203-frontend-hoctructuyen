"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/forms";
import { Trophy, User } from "lucide-react";
import { useGamification } from "@/lib/hooks/use-gamification";
import { gamificationService } from "@/lib/services/api";
import { cn } from "@/lib/utils";
import { SimpleCounter } from "@/components/ui/effects";
import gsap from "gsap";

interface LeaderboardProps {
  limit?: number;
  showTimeframe?: boolean;
  timeframe?: string;
  className?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  limit = 10,
  showTimeframe = true,
  timeframe: initialTimeframe = "all",
  className,
}) => {
  const { leaderboard, isLeaderboardLoading, fetchLeaderboard } =
    useGamification();
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [currentLimit, setCurrentLimit] = useState(limit);
  const [previousLength, setPreviousLength] = useState(0);
  const topThreeRef = useRef<HTMLDivElement>(null);
  const remainingRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const showMoreButtonRef = useRef<HTMLDivElement>(null);

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
    setCurrentLimit(limit);
    fetchLeaderboard(limit, value);
  };

  const handleShowMore = () => {
    setPreviousLength(leaderboard.length);
    const newLimit = currentLimit + 10;
    setCurrentLimit(newLimit);
    fetchLeaderboard(newLimit, timeframe);
  };

  // Animation khi component mount
  useEffect(() => {
    if (!isLeaderboardLoading && leaderboard.length > 0) {
      const ctx = gsap.context(() => {
        // Animate header
        if (headerRef.current) {
          gsap.fromTo(
            headerRef.current,
            { opacity: 0, y: -30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power3.out",
            }
          );
        }

        // Animate top 3 podiums
        if (topThreeRef.current) {
          const podiums = topThreeRef.current.querySelectorAll(".podium-item");
          gsap.fromTo(
            podiums,
            { opacity: 0, y: 50, scale: 0.8 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              stagger: 0.15,
              ease: "back.out(1.7)",
              delay: 0.3,
            }
          );
        }

        // Animate remaining items
        if (remainingRef.current) {
          const items =
            remainingRef.current.querySelectorAll(".leaderboard-item");
          gsap.fromTo(
            items,
            { opacity: 0, x: -30 },
            {
              opacity: 1,
              x: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: "power2.out",
              delay: 0.8,
            }
          );
        }
      });

      return () => ctx.revert();
    }
  }, [isLeaderboardLoading, leaderboard]);

  // Animation khi thay đổi timeframe
  useEffect(() => {
    if (
      !isLeaderboardLoading &&
      leaderboard.length > 0 &&
      timeframe !== "all"
    ) {
      const ctx = gsap.context(() => {
        // Fade in effect khi data thay đổi
        if (topThreeRef.current) {
          gsap.fromTo(
            topThreeRef.current,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.4,
              ease: "power2.inOut",
            }
          );
        }

        if (remainingRef.current) {
          gsap.fromTo(
            remainingRef.current,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.4,
              ease: "power2.inOut",
            }
          );
        }
      });

      return () => ctx.revert();
    }
  }, [timeframe]);

  // Animation cho items mới khi "Xem thêm"
  useEffect(() => {
    if (
      !isLeaderboardLoading &&
      leaderboard.length > previousLength &&
      previousLength > 0
    ) {
      const ctx = gsap.context(() => {
        if (remainingRef.current) {
          const allItems =
            remainingRef.current.querySelectorAll(".leaderboard-item");
          // Chỉ animate các items mới (từ previousLength - 3 trở đi, vì 3 items đầu là top 3)
          const newItems = Array.from(allItems).slice(previousLength - 3);

          if (newItems.length > 0) {
            // Animate items mới
            gsap.fromTo(
              newItems,
              { opacity: 0, x: -30, scale: 0.95 },
              {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 0.5,
                stagger: 0.08,
                ease: "power2.out",
                onComplete: () => {
                  // Scroll xuống item đầu tiên của batch mới
                  if (newItems[0]) {
                    (newItems[0] as HTMLElement).scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }
                },
              }
            );
          }
        }
      });

      return () => ctx.revert();
    }
  }, [isLeaderboardLoading, leaderboard.length, previousLength]);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return "👑";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${position}`;
    }
  };

  // Helper function để lấy tier dựa trên level
  const getTierByLevel = (level: number): string => {
    if (level >= 1 && level <= 12) return "wood";
    if (level >= 13 && level <= 24) return "bronze";
    if (level >= 25 && level <= 36) return "silver";
    if (level >= 37 && level <= 48) return "gold";
    if (level >= 49 && level <= 60) return "platinum";
    if (level >= 61 && level <= 72) return "onyx";
    if (level >= 73 && level <= 84) return "sapphire";
    if (level >= 85 && level <= 96) return "ruby";
    if (level >= 97 && level <= 108) return "amethyst";
    if (level >= 109) return "master";
    return "wood";
  };

  // Helper function để lấy tier icon path dựa trên level
  const getTierIconPath = (level: number) => {
    const tier = getTierByLevel(level);
    // Sử dụng level % 12 để cycle qua các icon (1-12)
    const iconNumber = ((level - 1) % 12) + 1;
    return `/vector-ranks-pack/${tier}/diamond-${tier}-${iconNumber}.png`;
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Content */}
      <div className="space-y-4">
        {isLeaderboardLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 animate-pulse"
              >
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8 md:py-12 text-muted-foreground px-4">
            <div className="p-3 md:p-4 bg-amber-100 rounded-full w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 md:mb-4 flex items-center justify-center">
              <Trophy className="w-8 h-8 md:w-12 md:h-12 text-amber-600 opacity-50" />
            </div>
            <p className="text-base md:text-lg font-medium">
              Chưa có dữ liệu xếp hạng
            </p>
            <p className="text-xs md:text-sm mt-1">
              Hãy tham gia các quiz để xuất hiện trong bảng xếp hạng!
            </p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {/* Top 3 Podium */}
            {leaderboard.length > 0 && (
              <div className="mb-6 md:mb-12">
                {/* Header with Time Filter Buttons */}
                <div ref={headerRef} className="mb-4 md:mb-8 px-4">
                  <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
                    {/* Left Button - Week */}
                    {showTimeframe && (
                      <Button
                        variant={timeframe === "week" ? "default" : "outline"}
                        onClick={() => handleTimeframeChange("week")}
                        className="flex-1 md:flex-none md:min-w-[140px]"
                      >
                        Tuần này
                      </Button>
                    )}

                    {/* Center Title */}
                    <div className="text-center flex-shrink-0">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Top 3 Xuất Sắc
                      </h3>
                      <div className="w-16 md:w-24 h-1 bg-yellow-500 dark:bg-yellow-600 mx-auto rounded-full"></div>
                    </div>

                    {/* Right Button - Month */}
                    {showTimeframe && (
                      <Button
                        variant={timeframe === "month" ? "default" : "outline"}
                        onClick={() => handleTimeframeChange("month")}
                        className="flex-1 md:flex-none md:min-w-[140px]"
                      >
                        Tháng này
                      </Button>
                    )}
                  </div>
                </div>

                {/* Podium Structure - Desktop: Horizontal, Mobile: Vertical */}
                <div
                  ref={topThreeRef}
                  className="flex flex-col md:flex-row md:items-end justify-center gap-4 md:gap-8 mb-6 md:mb-8 max-w-5xl mx-auto px-4"
                >
                  {leaderboard.slice(0, 3).map((entry, index) => {
                    const position = entry.position;
                    const podiumHeight =
                      position === 1
                        ? "md:h-72"
                        : position === 2
                        ? "md:h-64"
                        : "md:h-56";
                    const podiumColor =
                      position === 1
                        ? "bg-yellow-100 dark:bg-yellow-950/30 border-yellow-400 dark:border-yellow-700"
                        : position === 2
                        ? "bg-gray-100 dark:bg-gray-800 border-gray-400 dark:border-gray-600"
                        : "bg-orange-100 dark:bg-orange-950/30 border-orange-400 dark:border-orange-700";

                    return (
                      <div
                        key={entry.user_id}
                        className={cn(
                          "podium-item flex flex-row md:flex-col items-center relative w-full md:w-auto",
                          // Desktop order (podium style)
                          "md:order-none",
                          index === 0 && "md:order-2", // Top 1 ở giữa
                          index === 1 && "md:order-1", // Top 2 bên trái
                          index === 2 && "md:order-3" // Top 3 bên phải
                        )}
                      >
                        {/* Avatar */}
                        <div className="flex justify-center md:mb-4 shrink-0">
                          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden border-4 bg-white dark:bg-gray-800">
                            {entry.avatar_url &&
                            entry.avatar_url !==
                              "/assets/avatars/default.png" ? (
                              <img
                                src={entry.avatar_url}
                                alt={entry.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
                                <User className="h-8 w-8 md:h-12 md:w-12" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Podium Base - Mobile: Horizontal card, Desktop: Vertical podium */}
                        <div
                          className={cn(
                            "flex-1 md:flex-none md:w-32 border-2 md:border-t-0 rounded-lg md:rounded-b-lg flex flex-col justify-center relative px-3 py-3 md:py-4 ml-3 md:ml-0",
                            "min-h-[80px]", // Mobile minimum height
                            podiumHeight, // Desktop specific heights
                            podiumColor
                          )}
                        >
                          {/* User Info */}
                          <div className="text-left md:text-center space-y-1 md:space-y-2">
                            {/* User Name */}
                            <h4 className="font-semibold text-sm md:text-sm leading-tight text-gray-900 dark:text-gray-100 px-1 break-words line-clamp-2 md:line-clamp-none">
                              {entry.name}
                            </h4>

                            {/* Rank Icon - Hiển thị độc lập */}
                            <div className="flex justify-center mb-2">
                              <img
                                src={getTierIconPath(entry.current_level)}
                                alt={`Rank ${entry.current_level}`}
                                className="w-10 h-10 md:w-12 md:h-12 object-contain"
                              />
                            </div>

                            {/* Level & Points - Mobile: Inline, Desktop: Stacked */}
                            <div className="flex md:flex-col items-center md:items-center gap-2 md:gap-1">
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 md:py-1 bg-white/50 dark:bg-gray-800/50 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                                Cấp {entry.current_level}
                              </div>

                              <div className="flex items-baseline gap-1 md:block md:mb-2">
                                <SimpleCounter
                                  value={entry.total_points}
                                  duration={1.5}
                                  separator={true}
                                  className="text-base md:text-xl font-bold text-gray-900 dark:text-gray-100"
                                />
                                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                  điểm kiến thức
                                </p>
                              </div>
                            </div>

                            {/* Stats - Hidden on mobile for space */}
                            <div className="hidden md:block text-xs text-gray-600 dark:text-gray-400 space-y-1">
                              <div className="font-medium">
                                {gamificationService.calculateAccuracyRate(
                                  entry.stats.total_correct_answers,
                                  entry.stats.total_questions_answered
                                )}
                                % chính xác
                              </div>
                              <div className="font-medium">
                                Streak: {entry.stats.best_streak}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Remaining Rankings */}
            {leaderboard.length > 3 && (
              <div className="px-2 md:px-0">
                <div ref={remainingRef} className="space-y-2 md:space-y-3">
                  {leaderboard.slice(3).map((entry) => (
                    <div
                      key={entry.user_id}
                      className="leaderboard-item flex items-center gap-2 md:gap-4 p-3 md:p-4 bg-white dark:bg-gray-800 rounded-lg md:rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
                    >
                      {/* Rank */}
                      <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-semibold text-xs md:text-sm bg-gray-100 dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 shrink-0">
                        {getRankIcon(entry.position)}
                      </div>

                      {/* Avatar */}
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                        {entry.avatar_url &&
                        entry.avatar_url !== "/assets/avatars/default.png" ? (
                          <img
                            src={entry.avatar_url}
                            alt={entry.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                            <User className="h-4 w-4 md:h-5 md:w-5" />
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
                          <p className="font-semibold text-sm md:text-lg truncate text-gray-900 dark:text-gray-100">
                            {entry.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 md:py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 w-fit">
                              Cấp {entry.current_level}
                            </span>
                            {/* Rank Icon - Hiển thị bên phải badge Cấp */}
                            <img
                              src={getTierIconPath(entry.current_level)}
                              alt={`Rank ${entry.current_level}`}
                              className="w-6 h-6 md:w-7 md:h-7 object-contain"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-6 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full"></span>
                            {gamificationService.calculateAccuracyRate(
                              entry.stats.total_correct_answers,
                              entry.stats.total_questions_answered
                            )}
                            % chính xác
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-400 rounded-full"></span>
                            {entry.stats.best_streak} streak
                          </span>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right shrink-0">
                        <SimpleCounter
                          value={entry.total_points}
                          duration={1.2}
                          separator={true}
                          className="font-bold text-base md:text-xl text-gray-900 dark:text-gray-100"
                        />
                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          điểm kiến thức
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Show more button */}
        {leaderboard.length >= limit && (
          <div className="text-center pt-6">
            <Button
              variant="outline"
              onClick={() => fetchLeaderboard(limit + 10, timeframe)}
              disabled={isLeaderboardLoading}
            >
              Xem thêm
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
