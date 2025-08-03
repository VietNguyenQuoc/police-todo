"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CreateUserData, ApiResponse } from "@/types";

interface CreateUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUserData>();

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");

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

  const onSubmit = async (data: CreateUserData) => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          phoneNumber: data.phoneNumber.replace(/\D/g, ""),
          password: data.password,
          role: "member",
        }),
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        toast.success("Tạo thành viên thành công!");
        reset();
        onSuccess();
      } else {
        toast.error(result.error || "Tạo thành viên thất bại");
      }
    } catch (error) {
      toast.error("Lỗi mạng. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Họ và Tên"
        type="text"
        placeholder="Nhập họ và tên đầy đủ"
        error={errors.name?.message}
        {...register("name", {
          required: "Vui lòng nhập họ và tên",
          minLength: {
            value: 2,
            message: "Tên phải có ít nhất 2 ký tự",
          },
          maxLength: {
            value: 50,
            message: "Tên không được vượt quá 50 ký tự",
          },
        })}
      />

      <Input
        label="Số Điện Thoại"
        type="tel"
        placeholder="(555) 123-4567"
        error={errors.phoneNumber?.message}
        {...register("phoneNumber", {
          required: "Vui lòng nhập số điện thoại",
          minLength: {
            value: 10,
            message: "Số điện thoại phải có ít nhất 10 chữ số",
          },
          onChange: (e) => {
            e.target.value = formatPhoneNumber(e.target.value);
          },
        })}
      />

      <Input
        label="Mật Khẩu"
        type="password"
        placeholder="Nhập mật khẩu"
        error={errors.password?.message}
        {...register("password", {
          required: "Vui lòng nhập mật khẩu",
          minLength: {
            value: 6,
            message: "Mật khẩu phải có ít nhất 6 ký tự",
          },
        })}
      />

      <div className="flex space-x-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          className="flex-1"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Tạo Thành Viên
        </Button>
      </div>
    </form>
  );
};
