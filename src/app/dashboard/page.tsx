"use client";

import React, { useState, useEffect } from "react";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { CreateUserForm } from "@/components/forms/CreateUserForm";
import { CreateTaskForm } from "@/components/forms/CreateTaskForm";
import { TaskCard } from "@/components/TaskCard";
import { TaskWithUser, AuthUser, ApiResponse } from "@/types";

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tasks, setTasks] = useState<TaskWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");

    if (!token || !userData) {
      router.push("/auth");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData) as AuthUser;
      setUser(parsedUser);
      fetchTasks();
    } catch (error) {
      console.error("Invalid user data:", error);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      router.push("/auth");
    }
  }, [router]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        setTasks(result.data || []);
      } else {
        toast.error("Không thể tải danh sách công việc");
      }
    } catch (error) {
      toast.error("Lỗi mạng. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUserSuccess = () => {
    setShowCreateUserModal(false);
    // Optionally refresh any user-related data
  };

  const handleCreateTaskSuccess = () => {
    setShowCreateTaskModal(false);
    fetchTasks(); // Refresh tasks
  };

  const getTaskStats = () => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const pendingTasks = tasks.filter((task) => task.status === "pending");
    const completedTasks = tasks.filter((task) => task.status === "completed");
    const overdueTasks = tasks.filter((task) => {
      const dueDate =
        task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      return task.status === "pending" && dueDate < now;
    });
    const dueSoonTasks = tasks.filter((task) => {
      const dueDate =
        task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      return (
        task.status === "pending" &&
        dueDate <= threeDaysFromNow &&
        dueDate >= now
      );
    });

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
              {user.role === "admin"
                ? "Bảng Điều Khiển Quản Trị"
                : "Công Việc Của Tôi"}
            </h1>
            <p className="text-gray-600 mt-1">
              {user.role === "admin"
                ? "Quản lý công việc và thành viên trong nhóm"
                : "Xem và theo dõi các công việc được giao"}
            </p>
          </div>

          {user.role === "admin" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowCreateUserModal(true)}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <Users size={18} />
                <span>Thêm Thành Viên</span>
              </Button>
              <Button
                onClick={() => setShowCreateTaskModal(true)}
                className="flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>Tạo Công Việc</span>
              </Button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng Công Việc</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đang Chờ</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pending}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hoàn Thành</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.completed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quá Hạn</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.overdue}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Section */}
        <div className="space-y-6">
          {stats.dueSoon > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span>Sắp Đến Hạn ({stats.dueSoon})</span>
              </h2>
              <div className="grid gap-4">
                {tasks
                  .filter((task) => {
                    const now = new Date();
                    const threeDaysFromNow = new Date(
                      now.getTime() + 3 * 24 * 60 * 60 * 1000
                    );
                    const dueDate =
                      task.dueDate instanceof Date
                        ? task.dueDate
                        : new Date(task.dueDate);
                    return (
                      task.status === "pending" &&
                      dueDate <= threeDaysFromNow &&
                      dueDate >= now
                    );
                  })
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      showAssignedTo={user.role === "admin"}
                    />
                  ))}
              </div>
            </div>
          )}

          {stats.overdue > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span>Quá Hạn ({stats.overdue})</span>
              </h2>
              <div className="grid gap-4">
                {tasks
                  .filter((task) => {
                    const now = new Date();
                    const dueDate =
                      task.dueDate instanceof Date
                        ? task.dueDate
                        : new Date(task.dueDate);
                    return task.status === "pending" && dueDate < now;
                  })
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      showAssignedTo={user.role === "admin"}
                    />
                  ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tất Cả Công Việc ({tasks.length})
            </h2>
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có công việc nào
                  </h3>
                  <p className="text-gray-600">
                    {user.role === "admin"
                      ? "Tạo công việc đầu tiên để bắt đầu."
                      : "Chưa có công việc nào được giao cho bạn."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    showAssignedTo={user.role === "admin"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <Modal
        isOpen={showCreateUserModal}
        onClose={() => setShowCreateUserModal(false)}
        title="Thêm Thành Viên Mới"
      >
        <CreateUserForm
          onSuccess={handleCreateUserSuccess}
          onCancel={() => setShowCreateUserModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        title="Tạo Công Việc Mới"
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
