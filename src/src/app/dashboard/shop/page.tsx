"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";
import { ShopPage } from "@/components/features/shop";
import { PageHeader } from "@/components/ui/layout";

export default function Shop() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Cửa Hàng"
        description="Khám phá và mua sắm các vật phẩm tùy chỉnh cho avatar của bạn"
        variant="shop"
      />

      {/* Shop Content */}
      <ShopPage />
    </div>
  );
}
