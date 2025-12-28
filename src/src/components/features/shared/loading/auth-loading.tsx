"use client";

import React from "react";
import { LogoTransparent } from "@/components/ui/display";
import { cn } from "@/lib/utils";
import "@/styles/synlearnia-logo-effects.css";

interface AuthLoadingProps {
  className?: string;
}

export const AuthLoading: React.FC<AuthLoadingProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "flex h-screen w-full items-center justify-center bg-background",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center p-8 rounded-lg">
        <div className="mb-8">
          {/* Icon xoay tốc độ cao */}
          <div className="animate-spin" style={{ animationDuration: "0.5s" }}>
            <LogoTransparent
              size="xl"
              showText={false}
              imageClassName="h-16 w-16"
            />
          </div>
        </div>

        {/* Tiêu đề với hiệu ứng màu */}
        <h2 className="text-2xl font-bold text-center mb-3 synlearnia-logo-text">
          Synlearnia
        </h2>
        <p className="text-muted-foreground text-center">
          Nền tảng học tập thông minh
        </p>
      </div>
    </div>
  );
};
