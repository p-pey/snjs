import type { SupabaseClient } from "@supabase/supabase-js";
import type { ICategoryService } from "@/services/interfaces/iCategoryService";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/schemas/category.schema";
import { createClient } from "@/lib/supabase/client";
import { ServiceError } from "@/types/app.types";
import type { Category, Database } from "@/types/database.types";

export class CategoryService implements ICategoryService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAll(userId: string): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("name");

    if (error) throw new ServiceError(error.message, error.code);
    return data ?? [];
  }

  async getById(id: string): Promise<Category> {
    const { data, error } = await this.supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new ServiceError(error.message, error.code);
    return data;
  }

  async create(userId: string, input: CreateCategoryInput): Promise<Category> {
    const { data, error } = await this.supabase
      .from("categories")
      .insert({
        user_id: userId,
        name: input.name,
        color: input.color,
        icon: input.icon ?? null,
      })
      .select()
      .single();

    if (error) throw new ServiceError(error.message, error.code);
    return data;
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    const { data, error } = await this.supabase
      .from("categories")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new ServiceError(error.message, error.code);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("categories")
      .delete()
      .eq("id", id);
    if (error) throw new ServiceError(error.message, error.code);
  }
}

export const categoryService = new CategoryService(createClient());
