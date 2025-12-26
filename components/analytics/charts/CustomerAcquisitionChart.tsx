"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Loader2, PieChart as PieChartIcon } from "lucide-react";

interface CustomerAcquisitionChartProps {
  data?: Array<{ name: string; value: number; color?: string }>;
  isLoading?: boolean;
}

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export function CustomerAcquisitionChart({
  data = [],
  isLoading = false,
}: CustomerAcquisitionChartProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    // Default demo data
    const defaultData = [
      { name: "Organic Search", value: 35 },
      { name: "Direct Traffic", value: 25 },
      { name: "Social Media", value: 20 },
      { name: "Email Campaign", value: 12 },
      { name: "Referrals", value: 8 },
    ];
    data = defaultData;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry) => `${entry.name}: ${entry.value}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          formatter={(value: number) => [`${value}%`, "Share"]}
        />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
}
