"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/ui/spinner";

export function UserGuard({ children }: { children: (userId: string) => React.ReactNode }) {
  const { data: session, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/login");
    }
  }, [isLoading, session, router]);

  if (isLoading) {
    return <LoadingScreen message="Loading your workspace..." />;
  }

  if (!session) {
    return null;
  }

  return <>{children(session.id)}</>;
}
