import type { TodoFilters } from "@/types/app.types";

export const queryKeys = {
  auth: {
    session: ["auth", "session"] as const,
  },
  todos: {
    all: ["todos"] as const,
    list: (filters: TodoFilters) => ["todos", "list", filters] as const,
    detail: (id: string) => ["todos", "detail", id] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: (userId: string) => ["categories", userId] as const,
  },
  tags: {
    all: ["tags"] as const,
    list: (userId: string) => ["tags", userId] as const,
  },
  activity: {
    logs: (userId: string) => ["activity", "logs", userId] as const,
    summary: (userId: string, days: number) =>
      ["activity", "summary", userId, days] as const,
  },
} as const;
