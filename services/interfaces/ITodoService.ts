import type { TodoFilters } from "@/types/app.types";
import type { CreateTodoInput } from "@/schemas/todo.schema";
import type { Todo, TodoWithDetails } from "@/types/database.types";
import type { UpdateTodoInput } from "@/types/app.types";

export interface ITodoService {
  getAll(filters: TodoFilters): Promise<TodoWithDetails[]>;
  getById(id: string): Promise<TodoWithDetails>;
  create(userId: string, data: CreateTodoInput): Promise<Todo>;
  update(id: string, data: UpdateTodoInput): Promise<Todo>;
  delete(id: string): Promise<void>;
  archive(id: string): Promise<Todo>;
  complete(id: string): Promise<Todo>;
  restore(id: string): Promise<Todo>;
  exportToExcel(filters: TodoFilters): Promise<Blob>;
}
