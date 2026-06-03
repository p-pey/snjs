"use client";

import { parseAsString, useQueryStates } from "nuqs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCategories } from "@/hooks/useCategories";
import type { TodoFilters } from "@/types/app.types";

interface TodoFiltersBarProps {
  userId: string;
  filters: TodoFilters;
}

export function TodoFiltersBar({ userId, filters }: TodoFiltersBarProps) {
  const { data: categories = [] } = useCategories(userId);
  const [params, setParams] = useQueryStates({
    status: parseAsString.withDefault(""),
    priority: parseAsString.withDefault(""),
    categoryId: parseAsString.withDefault(""),
    search: parseAsString.withDefault(""),
  });

  return (
    <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
        <Label>Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search todos..."
            value={params.search}
            onChange={(e) => setParams({ search: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select
          value={params.status}
          onChange={(e) => setParams({ status: e.target.value })}
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Priority</Label>
        <Select
          value={params.priority}
          onChange={(e) => setParams({ priority: e.target.value })}
        >
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select
          value={params.categoryId}
          onChange={(e) => setParams({ categoryId: e.target.value })}
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

export function buildTodoFilters(
  userId: string,
  params: {
    status: string;
    priority: string;
    categoryId: string;
    search: string;
  },
): TodoFilters {
  return {
    userId,
    ...(params.status && {
      status: params.status as TodoFilters["status"],
    }),
    ...(params.priority && {
      priority: params.priority as TodoFilters["priority"],
    }),
    ...(params.categoryId && { categoryId: params.categoryId }),
    ...(params.search && { search: params.search }),
    sortBy: "created_at",
    asc: false,
  };
}
