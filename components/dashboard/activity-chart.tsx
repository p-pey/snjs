"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/spinner";
import { useActivitySummary } from "@/hooks/useActivity";

const ACTION_COLORS: Record<string, string> = {
  todo_created: "#6366f1",
  todo_completed: "#10b981",
  todo_updated: "#f59e0b",
  todo_archived: "#6b7280",
  todo_deleted: "#ef4444",
  todo_restored: "#8b5cf6",
};

export function ActivityChart({ userId }: { userId: string }) {
  const { data: summary = [], isLoading } = useActivitySummary(userId, 14);

  const chartData = summary.reduce<
    Record<string, Record<string, string | number>>
  >((acc, row) => {
    const date = row.activity_date;
    if (!acc[date]) acc[date] = { date };
    acc[date][row.action] = row.count;
    return acc;
  }, {});

  const data = Object.values(chartData).sort((a, b) =>
    String(a.date).localeCompare(String(b.date)),
  );

  const actions = [...new Set(summary.map((s) => s.action))];

  if (isLoading) return <LoadingScreen message="Loading chart..." />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity (last 14 days)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No activity yet. Start creating todos!
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              {actions.map((action) => (
                <Bar
                  key={action}
                  dataKey={action}
                  stackId="a"
                  fill={ACTION_COLORS[action] ?? "#94a3b8"}
                  name={action.replace(/_/g, " ")}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
