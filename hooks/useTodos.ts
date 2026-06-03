"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { todoService } from "@/services/todo.service";
import { queryKeys } from "@/lib/react-query/query-keys";
import type { CreateTodoInput } from "@/schemas/todo.schema";
import type { TodoFilters, UpdateTodoInput } from "@/types/app.types";

export function useTodos(filters: TodoFilters) {
  return useQuery({
    queryKey: queryKeys.todos.list(filters),
    queryFn: () => todoService.getAll(filters),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    placeholderData: keepPreviousData,
    enabled: !!filters.userId,
  });
}

export function useTodo(id: string) {
  return useQuery({
    queryKey: queryKeys.todos.detail(id),
    queryFn: () => todoService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: CreateTodoInput;
    }) => todoService.create(userId, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoInput }) =>
      todoService.update(id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todoService.delete(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  });
}

export function useCompleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todoService.complete(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  });
}

export function useArchiveTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todoService.archive(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  });
}

export function useRestoreTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todoService.restore(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all });
    },
  });
}

export function useExportTodos() {
  return useMutation({
    mutationFn: (filters: TodoFilters) => todoService.exportToExcel(filters),
  });
}
