"use client";

import { UserGuard } from "@/components/auth/user-guard";
import { CategoriesPageContent } from "@/components/categories/categories-page";

export default function CategoriesPage() {
  return (
    <UserGuard>
      {(userId) => <CategoriesPageContent userId={userId} />}
    </UserGuard>
  );
}
