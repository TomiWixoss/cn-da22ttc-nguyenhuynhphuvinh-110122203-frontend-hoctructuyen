import { Metadata } from "next";
import { LoginForm } from "@/components/features/auth/login-form";
import { WavesBackground } from "@/components/ui/effects/waves-background";

export const metadata: Metadata = {
  title: "Đăng nhập | Synlearnia",
  description:
    "Đăng nhập vào Synlearnia - Nền tảng học tập và thi trực tuyến thông minh",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header với hiệu ứng sóng */}
      <WavesBackground height="40vh" className="relative">
        <div className="flex flex-col items-center justify-center h-full text-center pt-12">
          {/* Header form trong vùng sóng */}
          <div className="text-white dark:text-foreground">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Đăng nhập
            </h2>
            <p className="text-white/80 dark:text-muted-foreground text-lg">
              Nhập thông tin đăng nhập của bạn để tiếp tục
            </p>
          </div>
        </div>
      </WavesBackground>

      {/* Form đăng nhập */}
      <div className="flex flex-col items-center justify-center px-6 md:p-10 lg:p-12 -mt-34">
        <div className="w-full max-w-md mx-auto relative z-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
