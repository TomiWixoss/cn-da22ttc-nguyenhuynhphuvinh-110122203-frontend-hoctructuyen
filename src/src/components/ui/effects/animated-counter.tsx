"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: boolean;
  delay?: number;
}

/**
 * Animated Counter Component
 * Animates number changes with smooth spring animation
 *
 * @param value - Target number to animate to
 * @param duration - Animation duration in seconds (default: 1)
 * @param className - Additional CSS classes
 * @param decimals - Number of decimal places (default: 0)
 * @param prefix - Text to show before number (e.g., "$", "+")
 * @param suffix - Text to show after number (e.g., "%", "pts")
 * @param separator - Whether to add thousand separators (default: true)
 * @param delay - Delay before animation starts in seconds (default: 0)
 */
export function AnimatedCounter({
  value,
  duration = 1,
  className,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = true,
  delay = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(spring, (current) => {
    const formatted = current.toFixed(decimals);
    const number = parseFloat(formatted);

    if (separator) {
      return number.toLocaleString("vi-VN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }

    return formatted;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      spring.set(value);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [spring, value, delay]);

  useEffect(() => {
    const unsubscribe = display.on("change", (latest) => {
      setDisplayValue(latest as any);
    });

    return () => unsubscribe();
  }, [display]);

  return (
    <motion.span
      className={cn("tabular-nums", className)}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      {prefix}
      {displayValue}
      {suffix}
    </motion.span>
  );
}

/**
 * Simple Counter with basic animation (lighter version)
 * Uses CSS counter animation instead of Framer Motion
 */
export function SimpleCounter({
  value,
  duration = 1,
  className,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = true,
}: Omit<AnimatedCounterProps, "delay">) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Easing function (easeOutExpo)
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentCount = Math.floor(easeOut * value);

      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  const formattedValue = separator
    ? count.toLocaleString("vi-VN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : count.toFixed(decimals);

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
