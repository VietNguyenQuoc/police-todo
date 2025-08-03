import React from "react";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";

type BadgeVariant = "default" | "success" | "warning" | "error";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

const badgeVariantMap: Record<
  BadgeVariant,
  {
    styles: string;
    icon: LucideIcon;
  }
> = {
  default: {
    styles: "bg-gray-100 text-gray-800",
    icon: Clock,
  },
  success: {
    styles: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  warning: {
    styles: "bg-yellow-100 text-yellow-800",
    icon: AlertTriangle,
  },
  error: {
    styles: "bg-red-100 text-red-800",
    icon: AlertCircle,
  },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  children,
  className = "",
  showIcon = true,
}) => {
  const { styles, icon: Icon } = badgeVariantMap[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
        styles,
        className
      )}
    >
      {showIcon && <Icon size={12} className="mr-1" />}
      {children}
    </span>
  );
};
