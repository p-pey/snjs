import Link from "next/link";
import { CheckSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-7 w-7 text-indigo-600" />
            <span className="text-xl font-bold">TaskFlow</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Organize your tasks with clarity and focus
        </h1>
        <p className="mt-4 max-w-xl text-lg text-gray-500">
          TaskFlow helps you manage todos with categories, tags, priorities, and
          activity insights — all in one place.
        </p>
        <Link href="/signup" className="mt-8 inline-block">
          <Button size="lg">
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </main>
    </div>
  );
}
