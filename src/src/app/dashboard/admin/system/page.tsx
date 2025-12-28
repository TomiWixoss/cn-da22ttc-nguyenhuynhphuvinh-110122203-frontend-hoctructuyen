"use client";

import { useState } from "react";
import { AdminOnly } from "@/components/features/auth/role-guard";
import { PageHeader } from "@/components/ui/layout/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout";
import { Button } from "@/components/ui/forms";
import { Switch } from "@/components/ui/forms/switch";
import { Badge } from "@/components/ui/feedback";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/overlay";
import {
  Settings,
  RefreshCw,
  Server,
  Cpu,
  HardDrive,
  Clock,
  CheckCircle,
  XCircle,
  FileCode,
  ClipboardList,
  Trophy,
  BarChart3,
  Bot,
  Loader2,
  Activity,
} from "lucide-react";
import {
  useFeatureStatus,
  useSetAllFeatures,
} from "@/lib/hooks/use-feature-toggle";
import {
  FeatureKey,
  FeatureFlags,
  FEATURE_CONFIGS,
} from "@/lib/types/feature-toggle";

// Icon mapping
const featureIcons: Record<FeatureKey, React.ReactNode> = {
  CODE_PRACTICE: <FileCode className="h-5 w-5" />,
  QUIZ: <ClipboardList className="h-5 w-5" />,
  GAMIFICATION: <Trophy className="h-5 w-5" />,
  ANALYTICS: <BarChart3 className="h-5 w-5" />,
  AI_TUTOR: <Bot className="h-5 w-5" />,
};

export default function SystemManagementPage() {
  const { data: statusData, isLoading: statusLoading } = useFeatureStatus();
  const setAllFeatures = useSetAllFeatures();

  const [pendingChanges, setPendingChanges] = useState<Partial<FeatureFlags>>(
    {}
  );
  const [showRestartDialog, setShowRestartDialog] = useState(false);

  const features = statusData?.features;
  const memory = statusData?.memory;
  const uptime = statusData?.uptime ?? 0;

  // Merge pending changes với current features
  const displayFeatures = features
    ? { ...features, ...pendingChanges }
    : undefined;

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  // Format uptime
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  // Handle toggle change
  const handleToggle = (feature: FeatureKey, enabled: boolean) => {
    setPendingChanges((prev) => ({
      ...prev,
      [feature]: enabled,
    }));
  };

  // Save and restart
  const handleSaveAndRestart = () => {
    if (!hasPendingChanges) return;
    setShowRestartDialog(true);
  };

  // Confirm action
  const handleConfirmAction = async () => {
    if (!features) return;

    const newConfig = { ...features, ...pendingChanges };

    await setAllFeatures.mutateAsync({
      features: newConfig,
      restart: true,
    });

    setPendingChanges({});
    setShowRestartDialog(false);
  };

  if (statusLoading) {
    return (
      <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Đang tải...</span>
          </div>
        </div>
      </AdminOnly>
    );
  }

  return (
    <AdminOnly fallback={<div>Bạn không có quyền truy cập trang này.</div>}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <PageHeader
          title="Quản lý Hệ thống"
          description="Quản lý Feature Toggles và giám sát tài nguyên server"
          variant="default"
        />

        {/* System Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <Server className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Trạng thái
                  </p>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    <p className="font-bold text-green-600">Hoạt động</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Cpu className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Heap Used
                  </p>
                  <p className="font-bold text-lg">
                    {memory?.heapUsed?.toFixed(1) ?? "-"}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      MB
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <HardDrive className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    RSS Memory
                  </p>
                  <p className="font-bold text-lg">
                    {memory?.rss?.toFixed(1) ?? "-"}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      MB
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Uptime
                  </p>
                  <p className="font-bold text-lg">{formatUptime(uptime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Toggles */}
        <Card className="border-2">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Feature Toggles
              </CardTitle>
              {hasPendingChanges && (
                <Badge variant="warning">Có thay đổi chưa lưu</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {FEATURE_CONFIGS.map((config) => {
                const isEnabled = displayFeatures?.[config.key] ?? true;
                const hasChange = pendingChanges[config.key] !== undefined;

                return (
                  <div
                    key={config.key}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      hasChange
                        ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-xl transition-colors ${
                          isEnabled
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                        }`}
                      >
                        {featureIcons[config.key]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{config.label}</p>
                          {isEnabled ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          {config.key === "QUIZ" && (
                            <Badge variant="secondary" className="text-xs">
                              Core
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {config.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ảnh hưởng: {config.affectedMenus.join(", ")}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) =>
                        handleToggle(config.key, checked)
                      }
                      disabled={config.key === "QUIZ"}
                    />
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={() => setPendingChanges({})}
                disabled={!hasPendingChanges}
              >
                Hủy thay đổi
              </Button>
              <Button
                onClick={handleSaveAndRestart}
                disabled={!hasPendingChanges || setAllFeatures.isPending}
              >
                {setAllFeatures.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Lưu & Restart Server
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Restart Confirmation Dialog */}
        <AlertDialog
          open={showRestartDialog}
          onOpenChange={setShowRestartDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận Lưu & Restart</AlertDialogTitle>
              <AlertDialogDescription>
                Server sẽ khởi động lại trong 2-3 giây. Kết nối sẽ bị gián đoạn
                chốc lát.
                <br />
                <br />
                Bạn có chắc chắn muốn tiếp tục?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmAction}>
                Lưu & Restart
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminOnly>
  );
}
