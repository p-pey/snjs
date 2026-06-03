"use client";

import { UserGuard } from "@/components/auth/user-guard";
import { TodosPageContent } from "@/components/todos/todos-page";

export default function TodosPage() {
  return (
    <UserGuard>{(userId) => <TodosPageContent userId={userId} />}</UserGuard>
  );
}
