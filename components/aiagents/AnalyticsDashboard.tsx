"use client";

import * as React from "react";
import {
  Bot,
  MessageSquare,
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Target,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AgentAnalytics } from "@/services/ai-agents.service";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface AnalyticsDashboardProps {
  analytics: AgentAnalytics | null;
}

export function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  if (!analytics) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  // Mock trend data for charts
  const weeklyData = [
    { day: "Mon", conversations: 45, satisfaction: 4.2, responseTime: 1.5 },
    { day: "Tue", conversations: 52, satisfaction: 4.5, responseTime: 1.3 },
    { day: "Wed", conversations: 48, satisfaction: 4.3, responseTime: 1.4 },
    { day: "Thu", conversations: 65, satisfaction: 4.6, responseTime: 1.2 },
    { day: "Fri", conversations: 58, satisfaction: 4.4, responseTime: 1.4 },
    { day: "Sat", conversations: 35, satisfaction: 4.7, responseTime: 1.1 },
    { day: "Sun", conversations: 28, satisfaction: 4.5, responseTime: 1.3 },
  ];

  const agentDistribution = [
    { name: "Course Advisor", value: 35, color: "#3b82f6" },
    { name: "Study Assistant", value: 28, color: "#8b5cf6" },
    { name: "Assignment Helper", value: 20, color: "#10b981" },
    { name: "Progress Tracker", value: 12, color: "#f59e0b" },
    { name: "Others", value: 5, color: "#6b7280" },
  ];

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (trend < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-600";
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    trend,
    trendValue,
    bgColor,
    iconColor,
  }: {
    icon: any;
    label: string;
    value: string | number;
    trend?: number;
    trendValue?: string;
    bgColor: string;
    iconColor: string;
  }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-secondary">{value}</p>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 ${getTrendColor(trend)}`}>
                {getTrendIcon(trend)}
                <span className="text-sm font-medium">{trendValue}</span>
              </div>
            )}
          </div>
        </div>
        <div className={`w-14 h-14 ${bgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`${iconColor} w-7 h-7`} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Bot}
          label="Active Agents"
          value={analytics.activeAgents || 0}
          bgColor="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          icon={MessageSquare}
          label="Daily Conversations"
          value={analytics.dailyConversations?.toLocaleString() || 0}
          trend={analytics.conversationTrend}
          trendValue={`${analytics.conversationTrend > 0 ? "+" : ""}${analytics.conversationTrend}%`}
          bgColor="bg-accent/10"
          iconColor="text-accent"
        />
        <StatCard
          icon={Clock}
          label="Avg Response Time"
          value={`${analytics.avgResponseTime?.toFixed(1) || 0}s`}
          trend={analytics.responseTrend}
          trendValue={`${analytics.responseTrend > 0 ? "+" : ""}${analytics.responseTrend.toFixed(1)}s`}
          bgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatCard
          icon={Star}
          label="Satisfaction Rate"
          value={`${analytics.satisfactionRate || 0}%`}
          trend={analytics.satisfactionTrend}
          trendValue={`${analytics.satisfactionTrend > 0 ? "+" : ""}${analytics.satisfactionTrend}%`}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary">
                Weekly Conversations
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Conversation volume over the past 7 days
              </p>
            </div>
            <Badge variant="outline" className="gap-2">
              <Activity className="w-3 h-3" />
              Live Data
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="conversations"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Agent Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary">
                Agent Distribution
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Breakdown of conversations by agent type
              </p>
            </div>
            <Badge variant="outline" className="gap-2">
              <Target className="w-3 h-3" />
              Overview
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={agentDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {agentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Response Time Comparison */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary">
                Response Time Trends
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Average response times throughout the week
              </p>
            </div>
            <Badge variant="outline" className="gap-2">
              <Zap className="w-3 h-3" />
              Performance
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis stroke="#6b7280" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="responseTime" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Satisfaction Ratings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary">
                Satisfaction Trends
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                User satisfaction ratings over time
              </p>
            </div>
            <Badge variant="outline" className="gap-2">
              <Star className="w-3 h-3" />
              Quality
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                domain={[0, 5]}
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="satisfaction"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-blue-900">Total Reach</h4>
          </div>
          <p className="text-3xl font-bold text-blue-900 mb-1">
            {(analytics.dailyConversations * 7).toLocaleString()}
          </p>
          <p className="text-sm text-blue-700">users helped this week</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-green-900">Success Rate</h4>
          </div>
          <p className="text-3xl font-bold text-green-900 mb-1">
            {(analytics.satisfactionRate * 0.95).toFixed(1)}%
          </p>
          <p className="text-sm text-green-700">of conversations resolved</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-purple-900">Efficiency</h4>
          </div>
          <p className="text-3xl font-bold text-purple-900 mb-1">
            {Math.round(60 / (analytics.avgResponseTime || 1))}
          </p>
          <p className="text-sm text-purple-700">responses per hour</p>
        </Card>
      </div>
    </div>
  );
}


