import type { SupabaseClient } from "@supabase/supabase-js";
import type { ITagService } from "@/services/interfaces/iTagService";
import type { CreateTagInput, UpdateTagInput } from "@/schemas/tag.schema";
import { createClient } from "@/lib/supabase/client";
import { ServiceError } from "@/types/app.types";
import type { Database, Tag } from "@/types/database.types";

export class TagService implements ITagService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAll(userId: string): Promise<Tag[]> {
    const { data, error } = await this.supabase
      .from("tags")
      .select("*")
      .eq("user_id", userId)
      .order("name");

    if (error) throw new ServiceError(error.message, error.code);
    return data ?? [];
  }

  async getById(id: string): Promise<Tag> {
    const { data, error } = await this.supabase
      .from("tags")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new ServiceError(error.message, error.code);
    return data;
  }

  async create(userId: string, input: CreateTagInput): Promise<Tag> {
    const { data, error } = await this.supabase
      .from("tags")
      .insert({
        user_id: userId,
        name: input.name,
        color: input.color,
      })
      .select()
      .single();

    if (error) throw new ServiceError(error.message, error.code);
    return data;
  }

  async update(id: string, input: UpdateTagInput): Promise<Tag> {
    const { data, error } = await this.supabase
      .from("tags")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new ServiceError(error.message, error.code);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("tags").delete().eq("id", id);
    if (error) throw new ServiceError(error.message, error.code);
  }
}

export const tagService = new TagService(createClient());
