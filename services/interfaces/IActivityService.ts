import type {
  ActivityDailySummary,
  ActivityLog,
} from "@/types/database.types";

export interface IActivityService {
  getLogs(userId: string, limit?: number): Promise<ActivityLog[]>;
  getDailySummary(userId: string, days?: number): Promise<ActivityDailySummary[]>;
}
