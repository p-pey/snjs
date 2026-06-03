"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export function DashboardPageContent({ userId }: { userId: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview of your tasks and activity
        </p>
      </div>

      <StatsCards userId={userId} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityChart userId={userId} />
        <RecentActivity userId={userId} />
      </div>
    </div>
  );
}
