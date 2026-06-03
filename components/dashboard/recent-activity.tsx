"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/spinner";
import { formatDateTime } from "@/lib/utils";
import { useActivityLogs } from "@/hooks/useActivity";

const ACTION_LABELS: Record<string, string> = {
  todo_created: "Created todo",
  todo_updated: "Updated todo",
  todo_completed: "Completed todo",
  todo_archived: "Archived todo",
  todo_deleted: "Deleted todo",
  todo_restored: "Restored todo",
  tag_created: "Created tag",
  tag_deleted: "Deleted tag",
  category_created: "Created category",
  category_deleted: "Deleted category",
};

export function RecentActivity({ userId }: { userId: string }) {
  const { data: logs = [], isLoading } = useActivityLogs(userId, 20);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingScreen message="Loading activity..." />
        ) : logs.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">
            No recent activity
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {logs.map((log) => {
              const meta = log.metadata as { title?: string };
              return (
                <li
                  key={log.id}
                  className="flex items-start justify-between gap-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </p>
                    {meta?.title && (
                      <p className="text-xs text-gray-500">{meta.title}</p>
                    )}
                  </div>
                  <time className="shrink-0 text-xs text-gray-400">
                    {formatDateTime(log.created_at)}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
