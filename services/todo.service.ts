import type { SupabaseClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import type { ITodoService } from "@/services/interfaces/ITodoService";
import type { CreateTodoInput } from "@/schemas/todo.schema";
import { createClient } from "@/lib/supabase/client";
import { ServiceError, type TodoFilters, type UpdateTodoInput } from "@/types/app.types";
import type { Database, Todo, TodoWithDetails } from "@/types/database.types";

export class TodoService implements ITodoService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAll(filters: TodoFilters): Promise<TodoWithDetails[]> {
    let query = this.supabase
      .from("todos_with_details")
      .select("*")
      .eq("user_id", filters.userId)
      .order(filters.sortBy ?? "created_at", {
        ascending: filters.asc ?? false,
      });

    if (filters.status) query = query.eq("status", filters.status);
    if (filters.priority) query = query.eq("priority", filters.priority);
    if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
    if (filters.search) query = query.textSearch("search_vector", filters.search);
    if (filters.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) throw new ServiceError(error.message, error.code);

    let results = (data ?? []) as TodoWithDetails[];

    if (filters.tagId) {
      results = results.filter((t) =>
        (t.tags ?? []).some((tag) => tag.id === filters.tagId),
      );
    }

    return results;
  }

  async getById(id: string): Promise<TodoWithDetails> {
    const { data, error } = await this.supabase
      .from("todos_with_details")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new ServiceError(error.message, error.code);
    return data as TodoWithDetails;
  }

  async create(userId: string, input: CreateTodoInput): Promise<Todo> {
    const { tag_ids, ...todoData } = input;

    const { data, error } = await this.supabase
      .from("todos")
      .insert({
        user_id: userId,
        title: todoData.title,
        description: todoData.description ?? null,
        priority: todoData.priority,
        due_date: todoData.due_date ?? null,
        category_id: todoData.category_id ?? null,
      })
      .select()
      .single();

    if (error) throw new ServiceError(error.message, error.code);

    if (tag_ids.length > 0) {
      const { error: tagError } = await this.supabase.from("todo_tags").insert(
        tag_ids.map((tag_id) => ({ todo_id: data.id, tag_id })),
      );
      if (tagError) throw new ServiceError(tagError.message, tagError.code);
    }

    return data;
  }

  async update(id: string, input: UpdateTodoInput): Promise<Todo> {
    const { tag_ids, ...todoData } = input;

    const updates: Database["public"]["Tables"]["todos"]["Update"] = {};
    if (todoData.title !== undefined) updates.title = todoData.title;
    if (todoData.description !== undefined)
      updates.description = todoData.description;
    if (todoData.priority !== undefined) updates.priority = todoData.priority;
    if (todoData.due_date !== undefined) updates.due_date = todoData.due_date;
    if (todoData.category_id !== undefined)
      updates.category_id = todoData.category_id || null;

    if (Object.keys(updates).length > 0) {
      const { error } = await this.supabase
        .from("todos")
        .update(updates)
        .eq("id", id);
      if (error) throw new ServiceError(error.message, error.code);
    }

    if (tag_ids !== undefined) {
      await this.supabase.from("todo_tags").delete().eq("todo_id", id);
      if (tag_ids.length > 0) {
        const { error: tagError } = await this.supabase
          .from("todo_tags")
          .insert(tag_ids.map((tag_id) => ({ todo_id: id, tag_id })));
        if (tagError) throw new ServiceError(tagError.message, tagError.code);
      }
    }

    const { data, error } = await this.supabase
      .from("todos")
      .select()
      .eq("id", id)
      .single();
    if (error) throw new ServiceError(error.message, error.code);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("todos").delete().eq("id", id);
    if (error) throw new ServiceError(error.message, error.code);
  }

  async archive(id: string): Promise<Todo> {
    const { data, error } = await this.supabase
      .from("todos")
      .update({ status: "archived", archived_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new ServiceError(error.message, error.code);
    return data;
  }

  async complete(id: string): Promise<Todo> {
    const { data, error } = await this.supabase
      .from("todos")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new ServiceError(error.message, error.code);
    return data;
  }

  async restore(id: string): Promise<Todo> {
    const { data, error } = await this.supabase
      .from("todos")
      .update({
        status: "active",
        archived_at: null,
        completed_at: null,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new ServiceError(error.message, error.code);
    return data;
  }

  async exportToExcel(filters: TodoFilters): Promise<Blob> {
    const todos = await this.getAll({ ...filters, limit: 10000 });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(
      todos.map((t) => ({
        Title: t.title,
        Status: t.status,
        Priority: t.priority,
        Category: t.category_name ?? "",
        Tags: (t.tags ?? []).map((tg) => tg.name).join(", "),
        "Due Date": t.due_date
          ? new Date(t.due_date).toLocaleDateString()
          : "",
        Created: new Date(t.created_at).toLocaleDateString(),
      })),
    );
    XLSX.utils.book_append_sheet(wb, ws, "Todos");
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    return new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }
}

export const todoService = new TodoService(createClient());
