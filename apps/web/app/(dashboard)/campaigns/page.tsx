'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Megaphone, Plus } from 'lucide-react';
import api from '@/lib/api';
import { DashboardPageScaffold } from '@/components/dashboard/page-scaffold';
import { Pagination } from '@/components/ui/pagination';

const PAGE_SIZE = 20;

export default function CampaignsPage() {
  const [page, setPage] = useState(1);
  const { data } = useQuery({
    queryKey: ['campaigns', page],
    queryFn: async () => { const r = await api.get('/campaigns', { params: { page, pageSize: PAGE_SIZE } }); return r.data.data; },
    retry: false,
    placeholderData: { items: [] },
  });
  const items = data?.items || data?.campaigns || (Array.isArray(data) ? data : []);
  const total: number = data?.total ?? items.length;

  return (
    <DashboardPageScaffold
      title="Campaigns"
      description="Broadcast messages to your audience"
      icon={Megaphone}
      actions={
        <button className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600">
          <Plus className="h-4 w-4" /> New Campaign
        </button>
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <Megaphone className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-gray-900">No campaigns yet</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">Create your first broadcast campaign to reach your audience.</p>
          <button className="mt-5 flex items-center gap-1.5 rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600">
            <Plus className="h-4 w-4" /> Create Campaign
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-500">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Sent</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((c: any) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{c.status}</span></td>
                  <td className="px-4 py-3 text-gray-600">{c.sentCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
        </div>
      )}
    </DashboardPageScaffold>
  );
}
