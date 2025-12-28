"use client";

import React from "react";
import { Skeleton } from "@/components/ui/feedback";
import { Card, CardContent } from "@/components/ui/layout";

interface ProgramsCardGridSkeletonProps {
  itemsPerPage?: number;
}

export function ProgramsCardGridSkeleton({
  itemsPerPage = 6,
}: ProgramsCardGridSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Filters and Search Skeleton */}
      <div className="flex flex-col space-y-4 mb-6">
        {/* Mobile layout */}
        <div className="sm:hidden flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[140px]" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </div>

        {/* Mobile: Filter controls */}
        <div className="sm:hidden flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 flex-shrink-0" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      {/* Programs Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {Array.from({ length: itemsPerPage }).map((_, i) => (
          <Card
            key={i}
            className="h-full border-2 border-border bg-gradient-to-br from-white to-slate-50/50 dark:from-card dark:to-card/80"
          >
            <CardContent className="px-4">
              <div className="flex flex-col h-full px-2">
                {/* Header: Icon và Dropdown menu */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center min-w-0 flex-1">
                    <Skeleton className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-8 flex-shrink-0" />
                </div>

                {/* Tên chương trình */}
                <div className="flex-1 flex items-start py-2">
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                </div>

                {/* Thông tin chi tiết */}
                <div className="mt-auto pt-2 border-t border-border/50 space-y-3">
                  {/* Mô tả */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}
