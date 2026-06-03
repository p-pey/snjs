"use client";

import { useState } from "react";
import { parseAsString, useQueryStates } from "nuqs";
import { Download, Plus } from "lucide-react";
import {
  buildTodoFilters,
  TodoFiltersBar,
} from "@/components/todos/todo-filters";
import { TodoForm } from "@/components/todos/todo-form";
import { TodoTable } from "@/components/todos/todo-table";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/spinner";
import { Alert } from "@/components/ui/alert";
import {
  useCreateTodo,
  useExportTodos,
  useTodos,
  useUpdateTodo,
} from "@/hooks/useTodos";
import type { CreateTodoInput } from "@/schemas/todo.schema";
import type { TodoWithDetails } from "@/types/database.types";

export function TodosPageContent({ userId }: { userId: string }) {
  const [params] = useQueryStates({
    status: parseAsString.withDefault(""),
    priority: parseAsString.withDefault(""),
    categoryId: parseAsString.withDefault(""),
    search: parseAsString.withDefault(""),
  });

  const filters = buildTodoFilters(userId, params);
  const { data: todos = [], isLoading, error } = useTodos(filters);
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const exportTodos = useExportTodos();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TodoWithDetails | null>(null);

  const handleCreate = async (data: CreateTodoInput) => {
    await createTodo.mutateAsync({ userId, data });
    setDialogOpen(false);
  };

  const handleUpdate = async (data: CreateTodoInput) => {
    if (!editing) return;
    await updateTodo.mutateAsync({ id: editing.id, data });
    setEditing(null);
    setDialogOpen(false);
  };

  const handleExport = async () => {
    const blob = await exportTodos.mutateAsync(filters);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `todos-${new Date().toISOString().split("T")[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (todo: TodoWithDetails) => {
    setEditing(todo);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Todos</h1>
          <p className="text-sm text-gray-500">
            Manage and track all your tasks
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportTodos.isPending}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Todo
          </Button>
        </div>
      </div>

      <TodoFiltersBar userId={userId} filters={filters} />

      {error && <Alert>{error.message}</Alert>}

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <TodoTable todos={todos} onEdit={openEdit} />
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit Todo" : "New Todo"}
      >
        <TodoForm
          userId={userId}
          defaultValues={
            editing
              ? {
                  title: editing.title,
                  description: editing.description ?? undefined,
                  priority: editing.priority,
                  due_date: editing.due_date ?? undefined,
                  category_id: editing.category_id ?? undefined,
                  tag_ids: (editing.tags ?? []).map((t) => t.id),
                }
              : undefined
          }
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={() => {
            setDialogOpen(false);
            setEditing(null);
          }}
          isLoading={createTodo.isPending || updateTodo.isPending}
          submitLabel={editing ? "Update" : "Create"}
        />
      </Dialog>
    </div>
  );
}
