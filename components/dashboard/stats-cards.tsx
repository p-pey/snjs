"use client";

import { CheckCircle2, Clock, ListTodo, Archive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTodos } from "@/hooks/useTodos";
import type { TodoWithDetails } from "@/types/database.types";

function countByStatus(todos: TodoWithDetails[], status: string) {
  return todos.filter((t) => t.status === status).length;
}

export function StatsCards({ userId }: { userId: string }) {
  const { data: todos = [] } = useTodos({ userId, sortBy: "created_at", asc: false });

  const stats = [
    {
      label: "Total",
      value: todos.length,
      icon: ListTodo,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Active",
      value: countByStatus(todos, "active"),
      icon: Clock,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Completed",
      value: countByStatus(todos, "completed"),
      icon: CheckCircle2,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Archived",
      value: countByStatus(todos, "archived"),
      icon: Archive,
      color: "text-gray-600 bg-gray-100",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <Card key={label}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className={`rounded-lg p-3 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
