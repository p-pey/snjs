"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTodoSchema,
  type CreateTodoInput,
} from "@/schemas/todo.schema";
import { useCategories } from "@/hooks/useCategories";
import { useTags } from "@/hooks/useTags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface TodoFormProps {
  userId: string;
  defaultValues?: Partial<CreateTodoInput>;
  onSubmit: (data: CreateTodoInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function TodoForm({
  userId,
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  isLoading,
}: TodoFormProps) {
  const { data: categories = [] } = useCategories(userId);
  const { data: tags = [] } = useTags(userId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTodoInput>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: {
      priority: "medium",
      tag_ids: [],
      ...defaultValues,
    },
  });

  const selectedTags = watch("tag_ids") ?? [];

  const toggleTag = (tagId: string) => {
    const current = selectedTags;
    if (current.includes(tagId)) {
      setValue(
        "tag_ids",
        current.filter((id) => id !== tagId),
      );
    } else {
      setValue("tag_ids", [...current, tagId]);
    }
  };

  const handleFormSubmit = handleSubmit(async (data) => {
    const payload: CreateTodoInput = {
      ...data,
      category_id: data.category_id || null,
      due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
    };
    await onSubmit(payload);
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} placeholder="What needs to be done?" />
        {errors.title && (
          <p className="text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Optional details..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select id="priority" {...register("priority")}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Due date</Label>
          <Input id="due_date" type="datetime-local" {...register("due_date")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category_id">Category</Label>
        <Select id="category_id" {...register("category_id")}>
          <option value="">None</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {tags.length > 0 && (
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const selected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className="rounded-full px-3 py-1 text-xs font-medium transition-opacity"
                  style={{
                    backgroundColor: tag.color + "22",
                    color: tag.color,
                    outline: selected ? `2px solid ${tag.color}` : "none",
                  }}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
