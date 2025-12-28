"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { Card, CardContent } from "@/components/ui/layout";
import { BarChart3, Package, Grid3X3 } from "lucide-react";
import { CollectionProgress } from "@/lib/types/avatar";
import gsap from "gsap";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface CollectionManagementProps {
  collectionProgress: CollectionProgress | null;
  isCollectionProgressLoading: boolean;
}

export function CollectionManagement({
  collectionProgress,
  isCollectionProgressLoading,
}: CollectionManagementProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overviewChartRef = useRef<HTMLDivElement>(null);
  const detailChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCollectionProgressLoading || !collectionProgress) return;

    const ctx = gsap.context(() => {
      // Animate chart containers with stagger
      gsap.from([overviewChartRef.current, detailChartRef.current], {
        scale: 0.9,
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, [collectionProgress, isCollectionProgressLoading]);

  const getCollectionChartData = () => {
    if (!collectionProgress) return null;

    return {
      labels: ["Ảnh đại diện", "Biểu tượng cảm xúc"],
      datasets: [
        {
          label: "Đã mở khóa",
          data: [
            collectionProgress.avatars.owned,
            collectionProgress.emojis.owned,
          ],
          backgroundColor: [
            "rgba(34, 197, 94, 0.8)",
            "rgba(245, 158, 11, 0.8)",
          ],
          borderColor: ["rgb(34, 197, 94)", "rgb(245, 158, 11)"],
          borderWidth: 2,
        },
        {
          label: "Chưa mở khóa",
          data: [
            collectionProgress.avatars.total - collectionProgress.avatars.owned,
            collectionProgress.emojis.total - collectionProgress.emojis.owned,
          ],
          backgroundColor: [
            "rgba(229, 231, 235, 0.6)",
            "rgba(229, 231, 235, 0.6)",
          ],
          borderColor: ["rgb(156, 163, 175)", "rgb(156, 163, 175)"],
          borderWidth: 1,
        },
      ],
    };
  };

  const getOverviewChartData = () => {
    if (!collectionProgress) return null;

    const totalOwned = collectionProgress.overall.owned;
    const totalItems = collectionProgress.overall.total;
    const remaining = totalItems - totalOwned;

    return {
      labels: ["Đã sở hữu", "Chưa sở hữu"],
      datasets: [
        {
          data: [totalOwned, remaining],
          backgroundColor: [
            "rgba(34, 197, 94, 0.8)",
            "rgba(229, 231, 235, 0.6)",
          ],
          borderColor: ["rgb(34, 197, 94)", "rgb(156, 163, 175)"],
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 12,
          usePointStyle: true,
          font: {
            size:
              typeof window !== "undefined" && window.innerWidth < 640
                ? 10
                : 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        cornerRadius: 8,
        titleFont: {
          size:
            typeof window !== "undefined" && window.innerWidth < 640 ? 11 : 13,
        },
        bodyFont: {
          size:
            typeof window !== "undefined" && window.innerWidth < 640 ? 10 : 12,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(107, 114, 128, 0.8)",
          font: {
            size:
              typeof window !== "undefined" && window.innerWidth < 640
                ? 10
                : 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
        },
        ticks: {
          color: "rgba(107, 114, 128, 0.8)",
          stepSize: 1,
          font: {
            size:
              typeof window !== "undefined" && window.innerWidth < 640
                ? 10
                : 12,
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 12,
          usePointStyle: true,
          font: {
            size:
              typeof window !== "undefined" && window.innerWidth < 640
                ? 10
                : 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        cornerRadius: 8,
        titleFont: {
          size:
            typeof window !== "undefined" && window.innerWidth < 640 ? 11 : 13,
        },
        bodyFont: {
          size:
            typeof window !== "undefined" && window.innerWidth < 640 ? 10 : 12,
        },
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.parsed;
            const total = context.dataset.data.reduce(
              (sum: number, val: number) => sum + val,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout:
      typeof window !== "undefined" && window.innerWidth < 640 ? "50%" : "60%",
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Thống Kê Sưu Tập với Biểu đồ - RESPONSIVE */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          {isCollectionProgressLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="h-64 sm:h-80 lg:h-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-64 sm:h-80 lg:h-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ) : collectionProgress ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Biểu đồ tổng quan - RESPONSIVE */}
              <div ref={overviewChartRef}>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Tổng quan sưu tập
                </h3>
                <div className="h-64 sm:h-80 lg:h-96">
                  {getOverviewChartData() && (
                    <Doughnut
                      data={getOverviewChartData()!}
                      options={{
                        ...doughnutOptions,
                        plugins: {
                          ...doughnutOptions.plugins,
                          tooltip: {
                            ...doughnutOptions.plugins.tooltip,
                            callbacks: {
                              label: function (context: any) {
                                const label = context.label || "";
                                const value = context.parsed;
                                const total = context.dataset.data.reduce(
                                  (sum: number, val: number) => sum + val,
                                  0
                                );
                                const percentage = (
                                  (value / total) *
                                  100
                                ).toFixed(1);
                                return `${label}: ${value} vật phẩm (${percentage}%)`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Biểu đồ so sánh chi tiết - RESPONSIVE */}
              <div ref={detailChartRef}>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Chi tiết từng loại sưu tập
                </h3>
                <div className="h-64 sm:h-80 lg:h-96">
                  {getCollectionChartData() && (
                    <Bar
                      data={getCollectionChartData()!}
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          tooltip: {
                            ...chartOptions.plugins.tooltip,
                            callbacks: {
                              label: function (context: any) {
                                const datasetLabel =
                                  context.dataset.label || "";
                                const value = context.parsed.y;
                                const categoryIndex = context.dataIndex;
                                const categoryLabels = [
                                  "Ảnh đại diện",
                                  "Biểu tượng cảm xúc",
                                ];
                                const category = categoryLabels[categoryIndex];

                                if (datasetLabel === "Đã mở khóa") {
                                  let totalAvailable = 0;
                                  let completionRate = "";

                                  if (categoryIndex === 0) {
                                    totalAvailable =
                                      collectionProgress?.avatars.total || 0;
                                    completionRate = `${
                                      collectionProgress?.avatars.percentage ||
                                      0
                                    }%`;
                                  } else if (categoryIndex === 1) {
                                    totalAvailable =
                                      collectionProgress?.emojis.total || 0;
                                    completionRate = `${
                                      collectionProgress?.emojis.percentage || 0
                                    }%`;
                                  }

                                  return `${category}: ${value}/${totalAvailable} (${completionRate})`;
                                }

                                return `${datasetLabel}: ${value}`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Không thể tải tiến độ sưu tập</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
