"use client";

import { UserGuard } from "@/components/auth/user-guard";
import { DashboardPageContent } from "@/components/dashboard/dashboard-page";

export default function DashboardPage() {
  return (
    <UserGuard>
      {(userId) => <DashboardPageContent userId={userId} />}
    </UserGuard>
  );
}
