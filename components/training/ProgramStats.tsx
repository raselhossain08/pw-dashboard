"use client";

import * as React from "react";
import { useProgramStats } from "@/hooks/useTrainingPrograms";
import {
  Users,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Target,
  Activity,
  BarChart3,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgramStatsProps {
  programId: string;
}

export default function ProgramStats({ programId }: ProgramStatsProps) {
  const { data: stats, isLoading } = useProgramStats(programId);

  if (isLoading) {
    return (
      <Card className="p-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-sm text-muted-foreground">
          Loading statistics...
        </p>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="p-12 text-center">
        <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
        <p className="text-sm text-muted-foreground">
          Statistics will appear once students enroll
        </p>
      </Card>
    );
  }

  const completionPercentage =
    stats.totalEnrollments > 0
      ? Math.round((stats.completedEnrollments / stats.totalEnrollments) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Enrollments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold mb-1">{stats.totalEnrollments}</p>
          <p className="text-sm text-muted-foreground">Total Enrollments</p>
        </Card>

        {/* Active Enrollments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10">
              <Clock className="h-5 w-5 text-green-500" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold mb-1 text-green-600">
            {stats.activeEnrollments}
          </p>
          <p className="text-sm text-muted-foreground">Active Students</p>
        </Card>

        {/* Completed Enrollments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
              <CheckCircle2 className="h-5 w-5 text-purple-500" />
            </div>
            <Award className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold mb-1 text-purple-600">
            {stats.completedEnrollments}
          </p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </Card>

        {/* Completion Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10">
              <Target className="h-5 w-5 text-amber-500" />
            </div>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold mb-1">{stats.completionRate}%</p>
          <p className="text-sm text-muted-foreground">Completion Rate</p>
        </Card>
      </div>

      {/* Detailed Stats Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Average Progress */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-semibold">Average Progress</h4>
              <p className="text-sm text-muted-foreground">
                Across all active students
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{stats.averageProgress}%</span>
            </div>
            <Progress value={stats.averageProgress} className="h-2" />
          </div>
        </Card>

        {/* Completion Statistics */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
              <Award className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h4 className="font-semibold">Completion Statistics</h4>
              <p className="text-sm text-muted-foreground">
                Program completion metrics
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completion Rate</span>
              <span className="font-semibold">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.completedEnrollments} of {stats.totalEnrollments} students
              completed the program
            </p>
          </div>
        </Card>
      </div>

      {/* Enrollment Breakdown */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Enrollment Breakdown</h4>
        <div className="space-y-4">
          {/* Active */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-32">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Active</span>
            </div>
            <div className="flex-1">
              <Progress
                value={
                  stats.totalEnrollments > 0
                    ? (stats.activeEnrollments / stats.totalEnrollments) * 100
                    : 0
                }
                className="h-2"
              />
            </div>
            <span className="text-sm font-semibold w-16 text-right">
              {stats.activeEnrollments}
            </span>
          </div>

          {/* Completed */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-32">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <div className="flex-1">
              <Progress
                value={
                  stats.totalEnrollments > 0
                    ? (stats.completedEnrollments / stats.totalEnrollments) *
                      100
                    : 0
                }
                className="h-2"
              />
            </div>
            <span className="text-sm font-semibold w-16 text-right">
              {stats.completedEnrollments}
            </span>
          </div>

          {/* Dropped */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 w-32">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm font-medium">Dropped</span>
            </div>
            <div className="flex-1">
              <Progress
                value={
                  stats.totalEnrollments > 0
                    ? ((stats.totalEnrollments -
                        stats.activeEnrollments -
                        stats.completedEnrollments) /
                        stats.totalEnrollments) *
                      100
                    : 0
                }
                className="h-2"
              />
            </div>
            <span className="text-sm font-semibold w-16 text-right">
              {stats.totalEnrollments -
                stats.activeEnrollments -
                stats.completedEnrollments}
            </span>
          </div>
        </div>
      </Card>

      {/* Key Insights */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Key Insights</h4>
        <div className="space-y-3">
          {stats.averageProgress >= 70 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Strong Progress</p>
                <p className="text-xs text-muted-foreground">
                  Students are making excellent progress through the program
                </p>
              </div>
            </div>
          )}

          {stats.completionRate >= 50 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10">
              <Award className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">High Completion Rate</p>
                <p className="text-xs text-muted-foreground">
                  Over half of enrolled students have completed the program
                </p>
              </div>
            </div>
          )}

          {stats.activeEnrollments > stats.completedEnrollments && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Active Learners</p>
                <p className="text-xs text-muted-foreground">
                  More students are actively learning than have completed
                </p>
              </div>
            </div>
          )}

          {stats.totalEnrollments === 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">No Enrollments Yet</p>
                <p className="text-xs text-muted-foreground">
                  Start enrolling students to see program statistics
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
