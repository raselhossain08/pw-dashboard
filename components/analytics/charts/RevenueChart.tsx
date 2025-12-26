"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2, BarChart3 } from "lucide-react";

interface RevenueChartProps {
  data?: Array<{ label: string; value: number; date?: string }>;
  period?: "day" | "week" | "month" | "year";
  isLoading?: boolean;
  chartPeriod?: "monthly" | "quarterly" | "yearly";
}

export function RevenueChart({
  data = [],
  period = "month",
  isLoading = false,
  chartPeriod = "monthly",
}: RevenueChartProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 bg-linear-to-br from-gray-50 to-gray-100 border border-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No revenue data available</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="label"
          tick={{ fill: "#666", fontSize: 12 }}
          tickLine={{ stroke: "#666" }}
        />
        <YAxis
          tick={{ fill: "#666", fontSize: 12 }}
          tickLine={{ stroke: "#666" }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          formatter={(value: number) => [
            `$${value.toLocaleString()}`,
            "Revenue",
          ]}
          labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#8b5cf6"
          strokeWidth={3}
          dot={{ fill: "#8b5cf6", r: 4 }}
          activeDot={{ r: 6 }}
          name="Revenue"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
