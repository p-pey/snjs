"use client";

import { UserGuard } from "@/components/auth/user-guard";
import { TagsPageContent } from "@/components/tags/tags-page";

export default function TagsPage() {
  return (
    <UserGuard>{(userId) => <TagsPageContent userId={userId} />}</UserGuard>
  );
}
