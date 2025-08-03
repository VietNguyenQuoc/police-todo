"use client";

import React from "react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { Calendar, User, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { TaskWithUser } from "@/types";
import { cn } from "@/utils/cn";

interface TaskCardProps {
  task: TaskWithUser;
  showAssignedTo?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  showAssignedTo = false,
}) => {
  const now = new Date();
  const dueDate =
    task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
  const threeDaysFromNow = addDays(now, 3);

  const isOverdue = isBefore(dueDate, now) && task.status === "pending";
  const isDueSoon =
    isAfter(dueDate, now) &&
    isBefore(dueDate, threeDaysFromNow) &&
    task.status === "pending";

  const getStatusColor = () => {
    if (task.status === "completed") return "text-green-600";
    if (isOverdue) return "text-red-600";
    if (isDueSoon) return "text-yellow-600";
    return "text-gray-600";
  };

  const getStatusText = () => {
    if (task.status === "completed") return "Hoàn Thành";
    if (isOverdue) return "Quá Hạn";
    if (isDueSoon) return "Sắp Đến Hạn";
    return "Đang Chờ";
  };

  return (
    <Card
      className={cn(
        "task-card",
        isOverdue && "overdue",
        isDueSoon && "due-soon"
      )}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
            {task.title}
          </h3>
          <span
            className={cn(
              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
              task.status === "completed" && "bg-green-100 text-green-800",
              isOverdue && "bg-red-100 text-red-800",
              isDueSoon && "bg-yellow-100 text-yellow-800",
              !isOverdue &&
                !isDueSoon &&
                task.status === "pending" &&
                "bg-gray-100 text-gray-800"
            )}
          >
            <Clock size={12} className="mr-1" />
            {getStatusText()}
          </span>
        </div>

        <p className="text-gray-600 mb-4 text-base leading-relaxed">
          {task.description}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>Hạn: {format(dueDate, "dd/MM/yyyy")}</span>
            </div>

            {showAssignedTo && (
              <div className="flex items-center space-x-1">
                <User size={14} />
                <span>Giao cho: {task.assignedToUser.name}</span>
              </div>
            )}
          </div>
        </div>

        {task.status === "pending" && isOverdue && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            ⚠️ Công việc này đã quá hạn và cần được hoàn thành ngay.
          </div>
        )}

        {task.status === "pending" && isDueSoon && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
            🕒 Công việc này sắp đến hạn. Vui lòng ưu tiên hoàn thành.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
