import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

type StatCardColor = "blue" | "yellow" | "green" | "red";

interface StatCardProps {
  icon: LucideIcon;
  color: StatCardColor;
  label: string;
  value: number;
}

const colorMap: Record<StatCardColor, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
  green: { bg: "bg-green-100", text: "text-green-600" },
  red: { bg: "bg-red-100", text: "text-red-600" },
};

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  color,
  label,
  value,
}) => {
  const { bg, text } = colorMap[color];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${bg} rounded-lg`}>
            <Icon className={`h-4 w-4 md:h-5 md:w-5 ${text}`} />
          </div>
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
