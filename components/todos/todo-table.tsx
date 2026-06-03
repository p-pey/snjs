"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Archive,
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { TodoWithDetails } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  PRIORITY_COLORS,
  STATUS_COLORS,
} from "@/lib/utils";
import {
  useArchiveTodo,
  useCompleteTodo,
  useDeleteTodo,
  useRestoreTodo,
} from "@/hooks/useTodos";

const columnHelper = createColumnHelper<TodoWithDetails>();

interface TodoTableProps {
  todos: TodoWithDetails[];
  onEdit: (todo: TodoWithDetails) => void;
}

export function TodoTable({ todos, onEdit }: TodoTableProps) {
  const completeTodo = useCompleteTodo();
  const archiveTodo = useArchiveTodo();
  const restoreTodo = useRestoreTodo();
  const deleteTodo = useDeleteTodo();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: "Title",
        cell: (info) => (
          <div>
            <p className="font-medium text-gray-900">{info.getValue()}</p>
            {info.row.original.description && (
              <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                {info.row.original.description}
              </p>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <Badge className={STATUS_COLORS[info.getValue()]}>
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("priority", {
        header: "Priority",
        cell: (info) => (
          <Badge className={PRIORITY_COLORS[info.getValue()]}>
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("category_name", {
        header: "Category",
        cell: (info) => {
          const row = info.row.original;
          if (!row.category_name) return "—";
          return (
            <Badge
              style={{
                backgroundColor: (row.category_color ?? "#6366f1") + "22",
                color: row.category_color ?? "#6366f1",
              }}
            >
              {row.category_name}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("tags", {
        header: "Tags",
        cell: (info) => (
          <div className="flex flex-wrap gap-1">
            {(info.getValue() ?? []).map((tag) => (
              <Badge
                key={tag.id}
                style={{
                  backgroundColor: tag.color + "22",
                  color: tag.color,
                }}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        ),
      }),
      columnHelper.accessor("due_date", {
        header: "Due",
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const todo = row.original;
          const isOpen = openMenu === todo.id;

          return (
            <div className="relative flex justify-end gap-1">
              {todo.status === "active" && (
                <Button
                  variant="ghost"
                  size="icon"
                  title="Complete"
                  onClick={() => completeTodo.mutate(todo.id)}
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenMenu(isOpen ? null : todo.id)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              {isOpen && (
                <div className="absolute right-0 top-9 z-10 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      onEdit(todo);
                      setOpenMenu(null);
                    }}
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                  {todo.status !== "archived" && (
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        archiveTodo.mutate(todo.id);
                        setOpenMenu(null);
                      }}
                    >
                      <Archive className="h-4 w-4" /> Archive
                    </button>
                  )}
                  {todo.status !== "active" && (
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        restoreTodo.mutate(todo.id);
                        setOpenMenu(null);
                      }}
                    >
                      <RotateCcw className="h-4 w-4" /> Restore
                    </button>
                  )}
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (confirm("Delete this todo?")) {
                        deleteTodo.mutate(todo.id);
                      }
                      setOpenMenu(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          );
        },
      }),
    ],
    [
      openMenu,
      completeTodo,
      archiveTodo,
      restoreTodo,
      deleteTodo,
      onEdit,
    ],
  );

  const table = useReactTable({
    data: todos,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (todos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
        <p className="text-gray-500">No todos found. Create your first one!</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-gray-200 bg-gray-50">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-medium text-gray-600"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-100 hover:bg-gray-50/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
