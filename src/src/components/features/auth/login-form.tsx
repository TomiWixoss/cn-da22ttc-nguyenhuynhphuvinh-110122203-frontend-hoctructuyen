"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { z } from "zod";

import { Button } from "@/components/ui/forms";
import { Input } from "@/components/ui/forms";
import { Card, CardContent, CardFooter } from "@/components/ui/layout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/forms";
import { useLoginMutation } from "@/lib/hooks/use-auth";
import { loginSchema } from "@/lib/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();

  // Khởi tạo form với react-hook-form và zod validation
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Xử lý khi form được submit
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate(values, {
      onSuccess: () => {
        router.push("/dashboard");
      },
      onError: (error) => {
        console.error("Đăng nhập thất bại:", error);
      },
    });
  }

  return (
    <Card className="w-full md:border-4 border-0 bg-card/95 md:bg-card backdrop-blur-sm">
      <CardContent className="px-4 sm:px-6 md:px-10">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 md:space-y-8"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-medium">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example@example.com"
                      type="email"
                      className="h-10 md:h-12 text-base px-3 md:px-4 transition-all bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-medium">
                    Mật khẩu
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        className="h-10 md:h-12 text-base px-3 md:px-4 transition-all bg-background"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-4 py-2 cursor-pointer hover:bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5" />
                      ) : (
                        <FiEye className="h-5 w-5" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      </span>
                    </Button>
                  </div>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />
            {loginMutation.error && (
              <div className="text-destructive text-base mt-2">
                {loginMutation.error.message}
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-10 md:h-12 text-sm md:text-base font-medium mt-4 transition-all cursor-pointer"
              disabled={loginMutation.isPending}
              is3DNoLayout={true}
            >
              {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
