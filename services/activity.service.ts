import type { SupabaseClient } from "@supabase/supabase-js";
import type { IActivityService } from "@/services/interfaces/IActivityService";
import { createClient } from "@/lib/supabase/client";
import { ServiceError } from "@/types/app.types";
import type {
  ActivityDailySummary,
  ActivityLog,
  Database,
} from "@/types/database.types";

export class ActivityService implements IActivityService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getLogs(userId: string, limit = 50): Promise<ActivityLog[]> {
    const { data, error } = await this.supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new ServiceError(error.message, error.code);
    return data ?? [];
  }

  async getDailySummary(
    userId: string,
    days = 30,
  ): Promise<ActivityDailySummary[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await this.supabase
      .from("activity_daily_summary")
      .select("*")
      .eq("user_id", userId)
      .gte("activity_date", since.toISOString().split("T")[0])
      .order("activity_date", { ascending: true });

    if (error) throw new ServiceError(error.message, error.code);
    return data ?? [];
  }
}

export const activityService = new ActivityService(createClient());
