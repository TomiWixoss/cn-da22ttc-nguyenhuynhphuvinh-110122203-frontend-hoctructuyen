"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface WavesBackgroundProps {
  className?: string;
  height?: string;
  children?: React.ReactNode;
}

export const WavesBackground: React.FC<WavesBackgroundProps> = ({
  className = "",
  height = "100vh",
  children,
}) => {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        // Light mode: gradient xanh dương-tím
        "bg-gradient-to-br from-[#543ab7] to-[#00acc1]",
        // Dark mode: gradient slate tối
        "dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900",
        className
      )}
      style={{
        minHeight: height,
      }}
    >
      {/* Content Area */}
      {children && (
        <div className="relative z-10 w-full h-full">{children}</div>
      )}

      {/* Waves SVG - Light Mode */}
      <div className="absolute bottom-0 left-0 w-full dark:hidden">
        <svg
          className="relative w-full"
          style={{
            height: "15vh",
            minHeight: "100px",
            maxHeight: "150px",
            marginBottom: "-7px",
          }}
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shapeRendering="auto"
        >
          <defs>
            <path
              id="gentle-wave-light"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g className="parallax">
            <use
              xlinkHref="#gentle-wave-light"
              x="48"
              y="0"
              fill="rgba(250,251,252,0.7)"
              className="animate-wave-1"
            />
            <use
              xlinkHref="#gentle-wave-light"
              x="48"
              y="3"
              fill="rgba(250,251,252,0.5)"
              className="animate-wave-2"
            />
            <use
              xlinkHref="#gentle-wave-light"
              x="48"
              y="5"
              fill="rgba(250,251,252,0.3)"
              className="animate-wave-3"
            />
            <use
              xlinkHref="#gentle-wave-light"
              x="48"
              y="7"
              fill="rgba(250,251,252,1)"
              className="animate-wave-4"
            />
          </g>
        </svg>
      </div>

      {/* Waves SVG - Dark Mode */}
      <div className="absolute bottom-0 left-0 w-full hidden dark:block">
        <svg
          className="relative w-full"
          style={{
            height: "15vh",
            minHeight: "100px",
            maxHeight: "150px",
            marginBottom: "-7px",
          }}
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shapeRendering="auto"
        >
          <defs>
            <path
              id="gentle-wave-dark"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g className="parallax">
            <use
              xlinkHref="#gentle-wave-dark"
              x="48"
              y="0"
              fill="rgba(10,14,26,0.7)"
              className="animate-wave-1"
            />
            <use
              xlinkHref="#gentle-wave-dark"
              x="48"
              y="3"
              fill="rgba(10,14,26,0.5)"
              className="animate-wave-2"
            />
            <use
              xlinkHref="#gentle-wave-dark"
              x="48"
              y="5"
              fill="rgba(10,14,26,0.3)"
              className="animate-wave-3"
            />
            <use
              xlinkHref="#gentle-wave-dark"
              x="48"
              y="7"
              fill="rgba(10,14,26,1)"
              className="animate-wave-4"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default WavesBackground;
