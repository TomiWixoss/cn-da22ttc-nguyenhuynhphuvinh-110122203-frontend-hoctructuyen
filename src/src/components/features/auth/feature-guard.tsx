"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useFeatureStatus } from "@/lib/hooks/use-feature-toggle";
import { FeatureKey, DEFAULT_FEATURE_FLAGS } from "@/lib/types/feature-toggle";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/forms";
import { Card, CardContent } from "@/components/ui/layout";

interface FeatureGuardProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
  showDisabledMessage?: boolean;
}

/**
 * Component bảo vệ route/content dựa trên feature flag
 * Nếu feature bị tắt, hiển thị thông báo hoặc fallback
 */
export function FeatureGuard({
  feature,
  children,
  fallback,
  showDisabledMessage = true,
}: FeatureGuardProps) {
  const router = useRouter();
  const { data, isLoading } = useFeatureStatus();
  const features = data?.features ?? DEFAULT_FEATURE_FLAGS;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Feature is enabled
  if (features[feature]) {
    return <>{children}</>;
  }

  // Feature is disabled - show fallback or message
  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showDisabledMessage) {
    return null;
  }

  // Default disabled message
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-md w-full border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                Tính năng tạm đóng
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                Tính năng này đang tạm thời được tắt để tối ưu hệ thống.
                <br />
                Vui lòng quay lại sau hoặc liên hệ quản trị viên.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="mt-4"
            >
              Quay về Trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * HOC để wrap page component với feature guard
 */
export function withFeatureGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: FeatureKey
) {
  return function FeatureGuardedComponent(props: P) {
    return (
      <FeatureGuard feature={feature}>
        <WrappedComponent {...props} />
      </FeatureGuard>
    );
  };
}

/**
 * Component ẩn content nếu feature bị tắt (không hiện message)
 */
export function FeatureOnly({
  feature,
  children,
}: {
  feature: FeatureKey;
  children: ReactNode;
}) {
  return (
    <FeatureGuard feature={feature} showDisabledMessage={false}>
      {children}
    </FeatureGuard>
  );
}
