import type { CreateTagInput, UpdateTagInput } from "@/schemas/tag.schema";
import type { Tag } from "@/types/database.types";

export interface ITagService {
  getAll(userId: string): Promise<Tag[]>;
  getById(id: string): Promise<Tag>;
  create(userId: string, data: CreateTagInput): Promise<Tag>;
  update(id: string, data: UpdateTagInput): Promise<Tag>;
  delete(id: string): Promise<void>;
}
