"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tagService } from "@/services/tag.service";
import { queryKeys } from "@/lib/react-query/query-keys";
import type { CreateTagInput, UpdateTagInput } from "@/schemas/tag.schema";

export function useTags(userId: string) {
  return useQuery({
    queryKey: queryKeys.tags.list(userId),
    queryFn: () => tagService.getAll(userId),
    enabled: !!userId,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: CreateTagInput;
    }) => tagService.create(userId, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagInput }) =>
      tagService.update(id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tagService.delete(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
    },
  });
}
