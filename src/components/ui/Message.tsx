import React from "react";

type MessageType = "warning" | "info" | "success" | "error";

interface MessageProps {
  type: MessageType;
  children: React.ReactNode;
  className?: string;
}

const messageTypeMap: Record<
  MessageType,
  { bg: string; border: string; text: string }
> = {
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
  },
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
  },
};

export const Message: React.FC<MessageProps> = ({
  type,
  children,
  className = "",
}) => {
  const { bg, border, text } = messageTypeMap[type];

  return (
    <div
      className={`mt-3 p-2 ${bg} border ${border} rounded text-sm ${text} ${className}`}
    >
      {children}
    </div>
  );
};
