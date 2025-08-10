"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CreateTaskData, ApiResponse, User } from "@/types";
import { useStorage } from "@/hooks/useStorage";

interface CreateTaskFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const storage = useStorage();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateTaskData>();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = storage?.getItem("auth_token");

      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  // Get tomorrow's date as minimum due date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const onSubmit = async (data: CreateTaskData) => {
    setIsLoading(true);

    try {
      const token = storage?.getItem("auth_token");

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        toast.success("Tạo công việc thành công!");
        reset();
        onSuccess();
      } else {
        toast.error(result.message || "Tạo công việc thất bại");
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
        label="Tiêu đề công việc"
        placeholder="Nhập tiêu đề công việc"
        error={errors.title?.message}
        {...register("title", {
          required: "Vui lòng nhập tiêu đề công việc",
          maxLength: {
            value: 100,
            message: "Tiêu đề không được vượt quá 100 ký tự",
          },
        })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mô Tả
        </label>
        <textarea
          rows={4}
          className="block w-full px-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Nhập mô tả công việc"
          {...register("description", {
            required: "Vui lòng nhập mô tả công việc",
            maxLength: {
              value: 500,
              message: "Mô tả không được vượt quá 500 ký tự",
            },
          })}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Giao Cho
        </label>
        <select
          className="block w-full px-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          {...register("assignedTo", {
            required: "Vui lòng chọn thành viên để giao công việc",
          })}
        >
          <option value="">Chọn thành viên</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.phoneNumber})
            </option>
          ))}
        </select>
        {errors.assignedTo && (
          <p className="mt-1 text-sm text-red-600">
            {errors.assignedTo.message}
          </p>
        )}
      </div>

      <Input
        label="Hạn hoàn thành"
        type="date"
        min={getTomorrowDate()}
        error={errors.dueDate?.message}
        {...register("dueDate", {
          required: "Vui lòng chọn hạn hoàn thành",
          validate: (value) => {
            const selectedDate = new Date(value);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            if (selectedDate < tomorrow) {
              return "Hạn hoàn thành phải từ ngày mai trở đi";
            }
            return true;
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
          Tạo công việc
        </Button>
      </div>
    </form>
  );
};
