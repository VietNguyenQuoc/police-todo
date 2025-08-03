"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuthUser } from "@/types";

interface HeaderProps {
  user?: AuthUser;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    router.push("/auth");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-top space-x-4">
          <h1 className="text-xl font-bold text-gray-900">Chào {user?.name}</h1>
          {user && (
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
              {user.role === "admin" ? "Quản trị viên" : "Thành viên"}
            </span>
          )}
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut size={16} />
              <span className="sm:inline">Đăng xuất</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
