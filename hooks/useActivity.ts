"use client";

import { useQuery } from "@tanstack/react-query";
import { activityService } from "@/services/activity.service";
import { queryKeys } from "@/lib/react-query/query-keys";

export function useActivityLogs(userId: string, limit = 50) {
  return useQuery({
    queryKey: queryKeys.activity.logs(userId),
    queryFn: () => activityService.getLogs(userId, limit),
    enabled: !!userId,
  });
}

export function useActivitySummary(userId: string, days = 30) {
  return useQuery({
    queryKey: queryKeys.activity.summary(userId, days),
    queryFn: () => activityService.getDailySummary(userId, days),
    enabled: !!userId,
  });
}
