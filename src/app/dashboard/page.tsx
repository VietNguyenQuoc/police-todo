"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  Plus,
  Users,
  CheckSquare,
  AlertCircle,
  Calendar,
  Clock,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { StatCard } from "@/components/ui/StatCard";
import { CreateUserForm } from "@/components/forms/CreateUserForm";
import { CreateTaskForm } from "@/components/forms/CreateTaskForm";
import { TaskCard } from "@/components/ui/TaskCard";
import { Task, AuthUser, ApiResponse, TaskStatus } from "@/types";
import { useStorage } from "@/hooks/useStorage";
import { getTaskState } from "./utils";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const router = useRouter();
  const storage = useStorage();
  const token = useMemo(() => storage?.getItem("auth_token"), [storage]);
  const user = useMemo(() => {
    const userData = storage?.getItem("user_data");
    return userData ? (JSON.parse(userData) as AuthUser) : null;
  }, []);

  const { loading: isLoadingMoreTasks } = useInfiniteScroll({
    onTrigger: async () => {
      await fetchTasks(tasks.at(-1)?.id);
    },
  });

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!token || !user) {
      router.push("/auth");
      return;
    }

    fetchTasks();
  }, [router]);

  const fetchTasks = async (cursor = "") => {
    try {
      const response = await fetch(`/api/tasks?cursor=${cursor}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ApiResponse<Task[]> = await response.json();

      if (result.success) {
        setTasks((tasks) => tasks.concat(result.data || []));
      } else {
        toast.error(result.message || "Lỗi hệ thống");
      }
    } catch (error) {
      toast.error("Lỗi mạng. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    setTasks((state) => {
      return state.map((task) => {
        if (task.id === taskId) {
          return { ...task, status };
        }
        return task;
      });
    });
  };

  const handleCreateUserSuccess = () => {
    setShowCreateUserModal(false);
    // Optionally refresh any user-related data
  };

  const handleCreateTaskSuccess = () => {
    setShowCreateTaskModal(false);
    fetchTasks(); // Refresh tasks
  };

  const handleCompleteTask = async (taskId: string) => {
    updateTaskStatus(taskId, "completed");

    const response = await fetch("api/tasks", {
      method: "PATCH",
      body: JSON.stringify({
        id: taskId,
        status: "completed",
        assignedTo: user?.id,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const body = (await response.json()) as ApiResponse;

    if (body.success) {
      toast.success("Cập nhật công việc thành công");
    } else {
      toast.error(body.message || "Lỗi hệ thống");
    }
  };

  const getTaskStats = () => {
    const pendingTasks = tasks.filter((task) => task.status === "pending");
    const completedTasks = tasks.filter((task) => task.status === "completed");
    const overdueTasks = tasks.filter(
      (task) => getTaskState(task) === "overdue"
    );
    const dueSoonTasks = tasks.filter(
      (task) => getTaskState(task) === "dueSoon"
    );

    return {
      total: tasks.length,
      pending: pendingTasks.length,
      completed: completedTasks.length,
      overdue: overdueTasks.length,
      dueSoon: dueSoonTasks.length,
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const stats = getTaskStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="bottom-right" />
      <Header user={user} />

      <main className="container-safe py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isAdmin ? "Bảng điều khiển quản trị" : "Công việc của tôi"}
            </h1>
            <p className="text-gray-600 mt-1">
              {isAdmin
                ? "Quản lý công việc và thành viên trong nhóm"
                : "Xem và theo dõi các công việc được giao"}
            </p>
          </div>

          {isAdmin && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowCreateUserModal(true)}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <Users size={18} />
                <span>Thêm thành viên</span>
              </Button>
              <Button
                onClick={() => setShowCreateTaskModal(true)}
                className="flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>Tạo công việc</span>
              </Button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Calendar}
            color="blue"
            label="Tổng công việc"
            value={stats.total}
          />

          <StatCard
            icon={Clock}
            color="yellow"
            label="Đang chờ"
            value={stats.pending}
          />

          <StatCard
            icon={CheckSquare}
            color="green"
            label="Hoàn thành"
            value={stats.completed}
          />

          <StatCard
            icon={AlertCircle}
            color="red"
            label="Sắp đến hạn"
            value={stats.dueSoon}
          />
        </div>

        {/* Tasks Section */}
        <div className="space-y-6">
          {stats.overdue > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                <span>Quá hạn ({stats.overdue})</span>
              </h2>
              <div className="grid gap-4">
                {tasks
                  .filter((task) => getTaskState(task) === "overdue")
                  .map((task) => (
                    <TaskCard
                      state="overdue"
                      key={task.id}
                      task={task}
                      showAssignedTo={isAdmin}
                      onCompleteTask={() => handleCompleteTask(task.id)}
                    />
                  ))}
              </div>
            </div>
          )}

          {stats.dueSoon > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
                <span>Sắp đến hạn ({stats.dueSoon})</span>
              </h2>
              <div className="grid gap-4">
                {tasks
                  .filter((task) => getTaskState(task) === "dueSoon")
                  .map((task) => (
                    <TaskCard
                      state="dueSoon"
                      key={task.id}
                      task={task}
                      showAssignedTo={isAdmin}
                      onCompleteTask={() => handleCompleteTask(task.id)}
                    />
                  ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tất cả công việc ({tasks.length})
            </h2>
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có công việc nào
                  </h3>
                  <p className="text-gray-600">
                    {isAdmin
                      ? "Tạo công việc đầu tiên để bắt đầu."
                      : "Chưa có công việc nào được giao cho bạn."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <TaskCard
                    state={getTaskState(task)}
                    key={task.id}
                    task={task}
                    showAssignedTo={isAdmin}
                    onCompleteTask={() => handleCompleteTask(task.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* {isLoadingMoreTasks && (
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )} */}
      </main>

      {/* Modals */}
      <Modal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        title="Thêm thành viên mới"
      >
        <CreateUserForm
          onSuccess={handleCreateUserSuccess}
          onCancel={() => setShowCreateUserModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        title="Tạo công việc mới"
        size="lg"
      >
        <CreateTaskForm
          onSuccess={handleCreateTaskSuccess}
          onCancel={() => setShowCreateTaskModal(false)}
        />
      </Modal>
    </div>
  );
}
