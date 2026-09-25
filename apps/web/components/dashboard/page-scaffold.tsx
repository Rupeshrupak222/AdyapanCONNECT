'use client';
import Link from 'next/link';
import { type LucideIcon, Sparkles } from 'lucide-react';

export function DashboardPageScaffold({
  title,
  description,
  icon: Icon = Sparkles,
  actions,
  children,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
            <Icon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
        </div>
        {actions}
      </div>

      <div className="mt-6">
        {children ?? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <Icon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-gray-900">{title} is coming soon</h3>
            <p className="mt-1 max-w-sm text-sm text-gray-500">
              This module is being set up for your workspace. Meanwhile, explore your dashboard.
            </p>
            <Link href="/dashboard" className="mt-5 rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600">
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
