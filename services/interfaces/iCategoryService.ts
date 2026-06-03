import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/schemas/category.schema";
import type { Category } from "@/types/database.types";

export interface ICategoryService {
  getAll(userId: string): Promise<Category[]>;
  getById(id: string): Promise<Category>;
  create(userId: string, data: CreateCategoryInput): Promise<Category>;
  update(id: string, data: UpdateCategoryInput): Promise<Category>;
  delete(id: string): Promise<void>;
}
