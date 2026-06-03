import Link from "next/link";
import { CheckSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">TaskFlow</span>
          </div>
          <p className="text-sm text-gray-500">Organize your tasks effortlessly</p>
        </div>

        <Card>
          <CardContent className="p-6 pt-6">
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
            {children}
          </CardContent>
        </Card>

        {footer && (
          <p className="mt-6 text-center text-sm text-gray-500">{footer}</p>
        )}
      </div>
    </div>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="font-medium text-indigo-600 hover:text-indigo-700">
      {children}
    </Link>
  );
}
