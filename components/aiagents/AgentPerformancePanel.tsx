"use client";

import * as React from "react";
import {
  TrendingUp,
  MessageSquare,
  Clock,
  CheckCircle,
  Target,
  Activity,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { aiAgentsService, type Agent } from "@/services/ai-agents.service";
import { useToast } from "@/context/ToastContext";
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
} from "recharts";

interface AgentPerformancePanelProps {
  agent: Agent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PerformanceData {
  totalConversations: number;
  completedConversations: number;
  activeConversations: number;
  avgMessagesPerConversation: number;
  avgSatisfactionRating: number;
  satisfactionPercentage: number;
  successRate: number;
  avgResponseTime: number;
  conversationsByDay: Array<{ date: string; count: number }>;
  topIntents: Array<{ intent: string; count: number }>;
  satisfactionTrend: Array<{ date: string; avgRating: number; count: number }>;
}

export function AgentPerformancePanel({
  agent,
  open,
  onOpenChange,
}: AgentPerformancePanelProps) {
  const [loading, setLoading] = React.useState(false);
  const [performanceData, setPerformanceData] =
    React.useState<PerformanceData | null>(null);
  const [dateRange, setDateRange] = React.useState("7days");
  const { push } = useToast();

  React.useEffect(() => {
    if (open && agent) {
      loadPerformanceData();
    }
  }, [open, agent, dateRange]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);

      const endDate = new Date().toISOString();
      const startDate = new Date();

      switch (dateRange) {
        case "7days":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30days":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90days":
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      const { data } = await aiAgentsService.getAgentAnalytics(
        agent._id,
        startDate.toISOString(),
        endDate
      );

      // Type-safe check for PerformanceData structure
      const isPerformanceData = (obj: any): obj is PerformanceData => {
        return (
          obj &&
          typeof obj === "object" &&
          "metrics" in obj &&
          "totalConversations" in obj &&
          "completedConversations" in obj &&
          "activeConversations" in obj
        );
      };

      setPerformanceData(isPerformanceData(data) ? data : null);
    } catch (error: any) {
      push({
        message:
          error?.response?.data?.message || "Failed to load performance data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({
    icon: Icon,
    label,
    value,
    subtitle,
    color,
  }: {
    icon: any;
    label: string;
    value: string | number;
    subtitle?: string;
    color: string;
  }) => (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm text-gray-600 font-medium">{label}</p>
          </div>
          <p className="text-2xl font-bold text-secondary">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">
                Performance Metrics: {agent.name}
              </DialogTitle>
              <DialogDescription>
                Detailed analytics and performance insights for this agent
              </DialogDescription>
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : performanceData ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  icon={MessageSquare}
                  label="Total Conversations"
                  value={performanceData.totalConversations.toLocaleString()}
                  subtitle="All time"
                  color="bg-blue-600"
                />
                <MetricCard
                  icon={CheckCircle}
                  label="Completed"
                  value={performanceData.completedConversations.toLocaleString()}
                  subtitle={`${performanceData.successRate.toFixed(
                    1
                  )}% success rate`}
                  color="bg-green-600"
                />
                <MetricCard
                  icon={Activity}
                  label="Active"
                  value={performanceData.activeConversations.toLocaleString()}
                  subtitle="In progress"
                  color="bg-yellow-600"
                />
                <MetricCard
                  icon={Clock}
                  label="Avg Response"
                  value={`${performanceData.avgResponseTime.toFixed(1)}s`}
                  subtitle="Per message"
                  color="bg-purple-600"
                />
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">
                        Satisfaction
                      </h4>
                      <p className="text-xs text-blue-700">User ratings</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-blue-900 mb-1">
                    {performanceData.satisfactionPercentage}%
                  </p>
                  <p className="text-sm text-blue-700">
                    {performanceData.avgSatisfactionRating.toFixed(2)} out of
                    5.0
                  </p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900">
                        Success Rate
                      </h4>
                      <p className="text-xs text-green-700">Completed chats</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-green-900 mb-1">
                    {performanceData.successRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-green-700">
                    {performanceData.completedConversations} of{" "}
                    {performanceData.totalConversations} conversations
                  </p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900">
                        Avg Messages
                      </h4>
                      <p className="text-xs text-purple-700">
                        Per conversation
                      </p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-purple-900 mb-1">
                    {performanceData.avgMessagesPerConversation.toFixed(1)}
                  </p>
                  <p className="text-sm text-purple-700">Messages exchanged</p>
                </Card>
              </div>

              {/* Agent Info */}
              <Card className="p-6 bg-gray-50">
                <h3 className="font-semibold mb-4">Agent Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <Badge variant="outline" className="mt-1">
                      {agent.agentType}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge
                      variant={
                        agent.status === "active" ? "default" : "secondary"
                      }
                      className="mt-1"
                    >
                      {agent.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium mt-1">
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Knowledge Base</p>
                    <p className="font-medium mt-1">
                      {agent.knowledgeBase?.length || 0} sources
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              {/* Conversations Over Time */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Conversations Over Time</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={performanceData.conversationsByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Satisfaction Trend */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">
                  Satisfaction Ratings Trend
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={performanceData.satisfactionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                    <YAxis domain={[0, 5]} stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="avgRating"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              {/* Top Intents */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Top Conversation Topics</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={performanceData.topIntents.slice(0, 10)}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#6b7280" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="intent"
                      stroke="#6b7280"
                      fontSize={12}
                      width={150}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6 border-l-4 border-l-blue-500">
                  <h4 className="font-semibold mb-2">💡 Performance Insight</h4>
                  <p className="text-sm text-gray-600">
                    This agent is performing{" "}
                    {performanceData.successRate > 85
                      ? "exceptionally well"
                      : "above average"}{" "}
                    with a success rate of{" "}
                    {performanceData.successRate.toFixed(1)}%.
                    {performanceData.avgResponseTime < 2 &&
                      " Response times are excellent."}
                  </p>
                </Card>

                <Card className="p-6 border-l-4 border-l-green-500">
                  <h4 className="font-semibold mb-2">✅ Strengths</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {performanceData.satisfactionPercentage > 80 && (
                      <li>• High user satisfaction</li>
                    )}
                    {performanceData.avgResponseTime < 2 && (
                      <li>• Fast response times</li>
                    )}
                    {performanceData.successRate > 85 && (
                      <li>• Excellent completion rate</li>
                    )}
                  </ul>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No performance data available</p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={loadPerformanceData}>
            <Activity className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


