"use client";

import React from "react";
import { Skeleton } from "@/components/ui/feedback";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/layout";

export function SemesterAssignmentDashboardSkeleton() {
  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-full sm:w-40" />
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        {/* Tabs List */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-32 flex-shrink-0" />
          ))}
        </div>

        {/* Tab Content - Assignment Matrix */}
        <Card className="bg-gradient-to-br from-white to-slate-50/50 dark:from-card dark:to-card/80">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96 max-w-full" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            {/* Matrix Table Skeleton */}
            <div className="space-y-4">
              {/* Header Row */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Skeleton className="h-10 w-48 flex-shrink-0" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-32 flex-shrink-0" />
                ))}
              </div>

              {/* Data Rows */}
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-2 overflow-x-auto">
                  <Skeleton className="h-12 w-48 flex-shrink-0" />
                  {Array.from({ length: 5 }).map((_, colIndex) => (
                    <Skeleton
                      key={colIndex}
                      className="h-12 w-32 flex-shrink-0"
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
