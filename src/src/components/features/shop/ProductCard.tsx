"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/forms/button";
import { Badge } from "@/components/ui/feedback/badge";
import { Skeleton } from "@/components/ui/feedback";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { PurchaseDialog } from "./PurchaseDialog";
import { usePurchaseMock } from "@/lib/hooks/shop";
import { useCurrency } from "@/lib/hooks/use-currency";
import type { ShopItem } from "@/lib/services/api/shop.service";
import gsap from "gsap";
import "./ticket-styles.css";

interface ProductCardProps {
  item: ShopItem | null;
  itemType: "avatars" | "emojis";
  className?: string;
  onPurchaseSuccess?: (itemId: string) => void;
  onRefreshInventory?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  itemType,
  className,
  onPurchaseSuccess,
  onRefreshInventory,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isTicketTorn, setIsTicketTorn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Khởi tạo đúng giá trị ngay từ đầu
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  // Ref để tham chiếu đến ticket element cụ thể
  const ticketRightRef = useRef<HTMLDivElement>(null);
  const ticketLeftRef = useRef<HTMLDivElement>(null);
  const ticketWrapRef = useRef<HTMLDivElement>(null);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    // Watch for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // GSAP entrance animation
  useEffect(() => {
    if (!ticketWrapRef.current) return;

    // Set initial state
    gsap.set(ticketWrapRef.current, {
      opacity: 0,
      y: 30,
      rotationX: -15,
    });

    // Animate in
    gsap.to(ticketWrapRef.current, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 0.6,
      ease: "back.out(1.2)",
      delay: Math.random() * 0.2, // Stagger effect
    });
  }, []);

  // GSAP hover animation
  useEffect(() => {
    if (!ticketWrapRef.current) return;

    const element = ticketWrapRef.current;

    const handleMouseEnter = () => {
      gsap.to(element, {
        y: -8,
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Hooks
  const { purchase, loading: purchaseLoading, isOwned } = usePurchaseMock();
  const { balance } = useCurrency();

  // Early return if item is null/undefined
  if (!item) {
    return null;
  }

  // Check if item is owned
  const owned = isOwned(item.id);
  const currentBalance = balance?.currencies?.SYNC?.balance || 0;

  /**
   * Handle purchase button click - open dialog
   */
  const handlePurchaseClick = () => {
    if (owned) return;
    setDialogOpen(true);
  };

  /**
   * Handle dialog close - reset ticket if not purchased
   */
  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open && !owned) {
      // Reset ticket animation immediately
      setIsTicketTorn(false);

      // Reset the specific ticket element CSS transform using ref
      const ticketElement = ticketRightRef.current;
      if (ticketElement) {
        ticketElement.style.transform = "none";
        ticketElement.style.opacity = "1";
        ticketElement.style.transition = "all 0.3s ease";

        // Remove transition after animation completes
        setTimeout(() => {
          if (ticketElement) {
            ticketElement.style.transition = "";
          }
        }, 300);
      }
    }
  };

  /**
   * Handle actual purchase from dialog
   */
  const handlePurchase = async (
    itemType: "avatars" | "emojis",
    itemId: string
  ) => {
    const result = await purchase(itemType, itemId);

    if (!result.success) {
      // Throw error with the message from API
      const error = new Error(result.message || "Purchase failed");
      (error as any).response = { data: { message: result.message } };
      throw error;
    }

    onPurchaseSuccess?.(itemId);

    // Reset ticket animation after successful purchase
    setIsTicketTorn(false);

    // Reset the specific ticket element CSS transform using ref
    const ticketElement = ticketRightRef.current;
    if (ticketElement) {
      ticketElement.style.transform = "none";
      ticketElement.style.opacity = "1";
      ticketElement.style.transition = "all 0.5s ease";

      // Remove transition after animation completes
      setTimeout(() => {
        if (ticketElement) {
          ticketElement.style.transition = "";
        }
      }, 500);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const getRarityConfig = (rarity: string) => {
    switch (rarity) {
      case "common":
        return {
          label: "Thông thường",
          color: "#6b7280", // Light mode - màu đậm
          darkColor: "#9ca3af", // Dark mode - màu sáng hơn
          bgLight: "#ecedef", // Light mode - nền sáng
          bgDark: "#374151", // Dark mode - nền tối
          borderColor: "border-gray-200 dark:border-gray-700",
        };
      case "rare":
        return {
          label: "Hiếm",
          color: "#3b82f6", // Light mode - xanh đậm
          darkColor: "#60a5fa", // Dark mode - xanh sáng
          bgLight: "#ecedef", // Light mode - nền sáng
          bgDark: "#1e3a8a", // Dark mode - nền xanh tối
          borderColor: "border-blue-200 dark:border-blue-700",
        };
      case "epic":
        return {
          label: "Sử thi",
          color: "#8b5cf6", // Light mode - tím đậm
          darkColor: "#a78bfa", // Dark mode - tím sáng
          bgLight: "#ecedef", // Light mode - nền sáng
          bgDark: "#4c1d95", // Dark mode - nền tím tối
          borderColor: "border-purple-200 dark:border-purple-700",
        };
      case "legendary":
        return {
          label: "Huyền thoại",
          color: "#eab308", // Light mode - vàng đậm
          darkColor: "#fbbf24", // Dark mode - vàng sáng
          bgLight: "#ecedef", // Light mode - nền sáng
          bgDark: "#713f12", // Dark mode - nền vàng tối
          borderColor: "border-yellow-200 dark:border-yellow-700",
        };
      default:
        return {
          label: "Thông thường",
          color: "#6b7280",
          darkColor: "#9ca3af",
          bgLight: "#ecedef",
          bgDark: "#374151",
          borderColor: "border-gray-200 dark:border-gray-700",
        };
    }
  };

  const rarityConfig = getRarityConfig(item.rarity);
  const canAfford = currentBalance >= item.price;

  // Ticket Style Layout
  return (
    <>
      {/* Ticket Card Container */}
      <div
        ref={ticketWrapRef}
        key={`ticket-${item.id}-${isDarkMode ? "dark" : "light"}`}
        className={cn(
          "ticket-wrap relative mx-auto",
          !canAfford && !owned && "cursor-not-allowed opacity-75",
          className
        )}
        style={{ width: "24em", color: "#fff", fontFamily: "sans-serif" }}
      >
        {/* Left Card - Main Info */}
        <div
          ref={ticketLeftRef}
          className="ticket-left relative overflow-hidden dark:shadow-lg"
          style={
            {
              background: `linear-gradient(to bottom, var(--ticket-color-top) 0%, var(--ticket-color-top) 26%, var(--ticket-color-bottom) 26%, var(--ticket-color-bottom) 100%)`,
              height: "11em",
              width: "16em",
              borderTopLeftRadius: "8px",
              borderBottomLeftRadius: "8px",
              padding: "1em",
              float: "left",
              "--ticket-color-top": isDarkMode
                ? rarityConfig.darkColor
                : rarityConfig.color,
              "--ticket-color-bottom": isDarkMode
                ? rarityConfig.bgDark
                : rarityConfig.bgLight,
            } as React.CSSProperties
          }
        >
          {/* Product Name as Header */}
          <h1 className="text-lg font-normal mt-0 mb-4 text-white dark:text-gray-100">
            {item.name}
          </h1>

          {/* Content Layout - Image and Info side by side */}
          <div className="flex items-start gap-3">
            {/* Product Image */}
            <div className="flex-shrink-0">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden mb-2">
                {!imageError && item.asset ? (
                  <>
                    {imageLoading && (
                      <Skeleton className="absolute inset-0 rounded-lg" />
                    )}
                    <Image
                      src={`/${item.asset.replace(/^\//, "")}`}
                      alt={item.name}
                      fill
                      className={cn(
                        "object-contain transition-opacity duration-300",
                        imageLoading ? "opacity-0" : "opacity-100"
                      )}
                      sizes="64px"
                      loading="lazy"
                      onLoad={() => setImageLoading(false)}
                      onError={() => {
                        setImageLoading(false);
                        setImageError(true);
                      }}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-400 dark:text-gray-500">
                      <div className="w-4 h-4 mx-auto mb-1 bg-gray-300 dark:bg-gray-600 rounded" />
                      <p className="text-xs">N/A</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Price with SynCoin Icon - Dưới ảnh */}
              <div className="flex items-center gap-2 justify-center">
                <Image
                  src="/ai-image/syncoin.png"
                  alt="SynCoin"
                  width={24}
                  height={24}
                  className="object-contain"
                />
                <h2
                  className="text-lg font-bold dark:brightness-125"
                  style={{ color: rarityConfig.color }}
                >
                  {item.price > 999
                    ? Math.floor(item.price / 1000) + "K"
                    : item.price}
                </h2>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-2">
              {/* Item Type */}
              <div className="ticket-info-section">
                <span className="dark:text-gray-400">loại vật phẩm</span>
                <h2 className="dark:text-gray-200">
                  {itemType === "avatars" ? "Avatar" : "Emoji"}
                </h2>
              </div>

              {/* Rarity - Độ hiếm */}
              <div className="ticket-info-section">
                <span className="dark:text-gray-400">độ hiếm</span>
                <h2 className="dark:text-gray-200">{rarityConfig.label}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card - Ticket Stub with Tear Effect */}
        <div
          ref={ticketRightRef}
          className={cn(
            "ticket-right relative dark:shadow-lg",
            "transition-all duration-300 ease-in-out",
            !owned && canAfford && "cursor-grab active:cursor-grabbing",
            owned && "cursor-default",
            isTicketTorn && "transform translate-y-20 rotate-12 opacity-50"
          )}
          style={
            {
              background: `linear-gradient(to bottom, var(--ticket-color-top) 0%, var(--ticket-color-top) 26%, var(--ticket-color-bottom) 26%, var(--ticket-color-bottom) 100%)`,
              height: "11em",
              width: "6.5em",
              borderLeft: ".18em dashed var(--ticket-border-color)",
              borderTopRightRadius: "8px",
              borderBottomRightRadius: "8px",
              padding: "1em",
              float: "left",
              "--ticket-color-top": isDarkMode
                ? rarityConfig.darkColor
                : rarityConfig.color,
              "--ticket-color-bottom": isDarkMode
                ? rarityConfig.bgDark
                : rarityConfig.bgLight,
              "--ticket-border-color": isDarkMode
                ? "rgba(255, 255, 255, 0.3)"
                : "#fff",
            } as React.CSSProperties
          }
          onMouseDown={(e) => {
            if (owned || !canAfford || isTicketTorn) return;

            const startX = e.clientX;
            const startY = e.clientY;
            const element = e.currentTarget;
            let isDragging = false;

            const handleMouseMove = (moveEvent: MouseEvent) => {
              const deltaX = moveEvent.clientX - startX;
              const deltaY = moveEvent.clientY - startY;
              const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

              if (distance > 10) {
                isDragging = true;
                // Animation kéo xuống dưới thay vì sang phải
                const dragProgress = Math.min(distance / 100, 1);
                const translateY = dragProgress * 30; // Kéo xuống dưới
                const translateX = deltaX * 0.1; // Chút ít movement ngang
                const rotation = dragProgress * 8; // Xoay nhẹ

                element.style.transform = `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg)`;
                element.style.opacity = `${1 - dragProgress * 0.3}`;

                // Rách ticket khi kéo đủ xa (100px)
                if (distance > 100) {
                  setIsTicketTorn(true);
                  element.style.transform = "translateY(80px) rotate(12deg)";
                  element.style.opacity = "0.5";

                  // Trigger purchase dialog
                  setTimeout(() => {
                    handlePurchaseClick();
                  }, 300);

                  document.removeEventListener("mousemove", handleMouseMove);
                  document.removeEventListener("mouseup", handleMouseUp);
                }
              }
            };

            const handleMouseUp = () => {
              if (!isDragging && !isTicketTorn) {
                // Click action - có thể hiển thị hint
              }

              // Reset position nếu không xé đủ xa và chưa torn
              if (!isTicketTorn) {
                element.style.transform = "none";
                element.style.opacity = "1";
              }

              document.removeEventListener("mousemove", handleMouseMove);
              document.removeEventListener("mouseup", handleMouseUp);
            };

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
          }}
        >
          {/* Perforated holes */}
          <div
            className="absolute w-4 h-4 rounded-full"
            style={{
              left: "-0.5em",
              top: "-0.4em",
              backgroundColor: isDarkMode ? "#111827" : "#ffffff",
            }}
          />
          <div
            className="absolute w-4 h-4 rounded-full"
            style={{
              left: "-0.5em",
              bottom: "-0.4em",
              backgroundColor: isDarkMode ? "#111827" : "#ffffff",
            }}
          />

          {/* Tear Hint - ở giữa */}
          {!owned && canAfford && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400 opacity-70">
                → Kéo để mua
              </div>
            </div>
          )}

          {/* Barcode ở dưới - Căn giữa hơn */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div
              className="ticket-barcode"
              style={{ marginLeft: "-30px" }}
            ></div>
          </div>

          {owned && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          )}

          {!canAfford && !owned && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-xs text-red-600 opacity-70">Thiếu xu</div>
            </div>
          )}
        </div>

        {/* Clear float */}
        <div style={{ clear: "both" }} />
      </div>

      {/* Purchase Dialog */}
      <PurchaseDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        item={item}
        currentBalance={currentBalance}
        onPurchase={handlePurchase}
        loading={purchaseLoading}
        itemType={itemType}
      />
    </>
  );
};

export default ProductCard;
