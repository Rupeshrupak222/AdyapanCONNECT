'use client';
import { useAuthStore } from '@/store/auth.store';
import { FolderKanban, User, Building2, Shield } from 'lucide-react';
import { DashboardPageScaffold } from '@/components/dashboard/page-scaffold';

export default function SettingsPage() {
  const { user, tenantSlug } = useAuthStore();
  const businessName = (tenantSlug && tenantSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())) || 'My Workspace';

  return (
    <DashboardPageScaffold title="All Projects & Settings" description="Manage your workspace and account" icon={FolderKanban}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2"><User className="h-5 w-5 text-green-600" /><h3 className="text-sm font-semibold text-gray-900">Profile</h3></div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd className="font-medium text-gray-800">{user?.firstName} {user?.lastName}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd className="font-medium text-gray-800">{user?.email}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Role</dt><dd className="font-medium capitalize text-gray-800">{user?.role?.toLowerCase().replace(/_/g, ' ')}</dd></div>
          </dl>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-green-600" /><h3 className="text-sm font-semibold text-gray-900">Workspace</h3></div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Business</dt><dd className="font-medium text-gray-800">{businessName}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Plan</dt><dd className="font-medium text-gray-800">FREE FOREVER</dd></div>
          </dl>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-green-600" /><h3 className="text-sm font-semibold text-gray-900">Security</h3></div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Two-factor auth</dt><dd className="font-medium text-gray-800">{user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Email verified</dt><dd className="font-medium text-gray-800">{user?.emailVerified ? 'Yes' : 'No'}</dd></div>
          </dl>
        </div>
      </div>
    </DashboardPageScaffold>
  );
}
