import type { CreateTodoInput } from "@/schemas/todo.schema";
import type { TodoPriority, TodoStatus } from "@/types/database.types";

export class ServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export interface TodoFilters {
  userId: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  categoryId?: string;
  tagId?: string;
  search?: string;
  sortBy?: string;
  asc?: boolean;
  limit?: number;
}

export type UpdateTodoInput = Partial<
  Omit<CreateTodoInput, "tag_ids"> & { tag_ids?: string[] }
>;

export interface UserSession {
  id: string;
  email: string;
  fullName: string | null;
}
