"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { LoginData, ApiResponse } from "@/types";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>();

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem("auth_token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, "");

    // Format as (XXX) XXX-XXXX
    if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6,
        10
      )}`;
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return cleaned;
    }
  };

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: data.phoneNumber.replace(/\D/g, ""), // Send only digits
          password: data.password,
        }),
      });

      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        localStorage.setItem("auth_token", result.token!);
        localStorage.setItem("user_data", JSON.stringify(result.data.user));
        toast.success("Đăng nhập thành công!");
        router.push("/dashboard");
      } else {
        toast.error(result.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      toast.error("Lỗi mạng. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Toaster position="bottom-right" />

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Quản Lý Công Việc
          </CardTitle>
          <p className="text-gray-600 mt-2">Đăng nhập vào tài khoản của bạn</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Số Điện Thoại"
              type="tel"
              placeholder="(555) 123-4567"
              error={errors.phoneNumber?.message}
              {...register("phoneNumber", {
                required: "Vui lòng nhập số điện thoại",
                // minLength: {
                //   value: 10,
                //   message: "Số điện thoại phải có ít nhất 10 chữ số",
                // },
                onChange: (e) => {
                  e.target.value = formatPhoneNumber(e.target.value);
                },
              })}
            />

            <Input
              label="Mật Khẩu"
              type="password"
              placeholder="Nhập mật khẩu của bạn"
              error={errors.password?.message}
              {...register("password", {
                required: "Vui lòng nhập mật khẩu",
                // minLength: {
                //   value: 6,
                //   message: "Mật khẩu phải có ít nhất 6 ký tự",
                // },
              })}
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Đăng Nhập
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Liên hệ quản trị viên nếu bạn cần truy cập tài khoản.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
