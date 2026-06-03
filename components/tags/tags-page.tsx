"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createTagSchema,
  type CreateTagInput,
} from "@/schemas/tag.schema";
import {
  useCreateTag,
  useDeleteTag,
  useTags,
  useUpdateTag,
} from "@/hooks/useTags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { LoadingScreen } from "@/components/ui/spinner";
import type { Tag } from "@/types/database.types";

export function TagsPageContent({ userId }: { userId: string }) {
  const { data: tags = [], isLoading } = useTags(userId);
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTagInput>({
    resolver: zodResolver(createTagSchema),
    defaultValues: { color: "#10b981" },
  });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", color: "#10b981" });
    setDialogOpen(true);
  };

  const openEdit = (tag: Tag) => {
    setEditing(tag);
    reset({ name: tag.name, color: tag.color });
    setDialogOpen(true);
  };

  const onSubmit = async (data: CreateTagInput) => {
    if (editing) {
      await updateTag.mutateAsync({ id: editing.id, data });
    } else {
      await createTag.mutateAsync({ userId, data });
    }
    setDialogOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
          <p className="text-sm text-gray-500">Label and filter your todos</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Tag
        </Button>
      </div>

      {isLoading ? (
        <LoadingScreen />
      ) : tags.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-gray-500">
          No tags yet
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <Card key={tag.id} className="inline-flex">
              <CardContent className="flex items-center gap-2 p-3">
                <Badge
                  style={{
                    backgroundColor: tag.color + "22",
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => openEdit(tag)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => {
                    if (confirm("Delete this tag?")) {
                      deleteTag.mutate(tag.id);
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editing ? "Edit Tag" : "New Tag"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input id="color" type="color" {...register("color")} />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTag.isPending || updateTag.isPending}
            >
              {editing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
