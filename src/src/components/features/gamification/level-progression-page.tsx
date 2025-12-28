"use client";

import React from "react";
import { LevelProgressTracker } from "./level-progress-tracker";

export default function LevelProgressionPage() {
  return (
    <div className="container px-2 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto py-4 sm:py-6">
      <LevelProgressTracker />
    </div>
  );
}
