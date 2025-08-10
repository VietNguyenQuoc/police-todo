"use client";

import React from "react";
import { Calendar, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Message } from "@/components/ui/Message";
import { Badge } from "@/components/ui/Badge";
import { Task, TaskState } from "@/types";
import { cn } from "@/utils/cn";
import { Button } from "./Button";
import dayjs from "dayjs";

interface TaskCardProps {
  task: Task;
  state?: TaskState;
  showAssignedTo?: boolean;
  onCompleteTask?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  showAssignedTo = false,
  onCompleteTask,
  state,
}) => {
  const isCompleted = state === "completed";
  const isOverdue = state === "overdue";
  const isDueSoon = state === "dueSoon";

  const getStatusText = () => {
    if (isCompleted) return "Hoàn thành";
    if (isOverdue) return "Quá hạn";
    if (isDueSoon) return "Sắp đến hạn";
    return "Đang chờ";
  };

  const getStatusVariant = () => {
    if (isCompleted) return "success";
    if (isOverdue) return "error";
    if (isDueSoon) return "warning";
    return "default";
  };

  return (
    <Card
      className={cn(
        isOverdue && "border-red-300",
        isDueSoon && "border-yellow-300"
      )}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
            {task.title}
          </h3>
          <Badge variant={getStatusVariant()}>{getStatusText()}</Badge>
        </div>

        <p className="text-gray-600 mb-4 text-base leading-relaxed">
          {task.description}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>Hạn: {dayjs(task.dueDate).format("DD/MM/YYYY")}</span>
            </div>

            {showAssignedTo && (
              <div className="flex items-center space-x-1">
                <User size={14} />
                <span>Giao cho: {task.assignedToUser.name}</span>
              </div>
            )}
          </div>
        </div>

        {!isCompleted && isOverdue && (
          <Message type="error">
            ⚠️ Công việc này đã quá hạn và cần được hoàn thành ngay.
          </Message>
        )}

        {!isCompleted && isDueSoon && (
          <Message type="warning">
            🕒 Công việc này sắp đến hạn. Vui lòng ưu tiên hoàn thành.
          </Message>
        )}
        {!isCompleted && onCompleteTask && (
          <Button size="sm" onClick={onCompleteTask} className="mt-4">
            Hoàn thành
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
