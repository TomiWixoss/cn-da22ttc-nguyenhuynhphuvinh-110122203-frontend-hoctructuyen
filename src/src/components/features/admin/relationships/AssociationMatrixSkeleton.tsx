"use client";

import React from "react";
import { Skeleton } from "@/components/ui/feedback";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/display";

interface AssociationMatrixSkeletonProps {
  title?: string;
  description?: string;
  rows?: number;
  cols?: number;
}

export function AssociationMatrixSkeleton({
  title = "Ma trận liên kết",
  description = "Đang tải dữ liệu ma trận...",
  rows = 5,
  cols = 5,
}: AssociationMatrixSkeletonProps) {
  return (
    <Card className="bg-gradient-to-br from-white to-slate-50/50 dark:from-card dark:to-card/80">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          <Skeleton className="h-6 w-48" />
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          <Skeleton className="h-4 w-96 max-w-full" />
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {/* Desktop view - Table Skeleton */}
        <div className="hidden lg:block overflow-x-auto border rounded-lg bg-card dark:bg-card">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-slate-100 dark:bg-muted/50 hover:bg-slate-100 dark:hover:bg-muted/50">
                <TableHead className="min-w-[300px] sticky left-0 bg-background/95 dark:bg-card/95 z-10">
                  <Skeleton className="h-4 w-32" />
                </TableHead>
                {Array.from({ length: cols }).map((_, i) => (
                  <TableHead key={i} className="text-center min-w-[150px]">
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow key={rowIndex} className="dark:border-border/50">
                  <TableCell className="sticky left-0 bg-background/95 dark:bg-card/95 z-10">
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  {Array.from({ length: cols }).map((_, colIndex) => (
                    <TableCell key={colIndex} className="text-center">
                      <Skeleton className="h-5 w-5 mx-auto" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile view - Card list Skeleton */}
        <div className="lg:hidden space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="border rounded-lg p-3 bg-muted/30 dark:bg-muted/20"
            >
              <Skeleton className="h-5 w-3/4 mb-3" />
              <div className="space-y-2">
                {Array.from({ length: cols }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Save Button Skeleton */}
        <div className="flex justify-end mt-4 sm:mt-6">
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
