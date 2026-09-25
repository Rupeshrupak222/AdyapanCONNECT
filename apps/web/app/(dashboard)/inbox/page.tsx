'use client';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, Search, User } from 'lucide-react';
import api from '@/lib/api';
import { DashboardPageScaffold } from '@/components/dashboard/page-scaffold';

export default function InboxPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => (await api.get('/conversations', { params: { pageSize: 100 } })).data.data,
    retry: false,
    placeholderData: { items: [], total: 0 },
  });

  const items = data?.items || data?.conversations || (Array.isArray(data) ? data : []);

  return (
    <DashboardPageScaffold title="Live Chat" description="All your WhatsApp conversations" icon={MessageCircle}>
      <div className="grid gap-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:grid-cols-[320px_1fr]">
        {/* Conversation list */}
        <div className="border-r border-gray-100">
          <div className="flex items-center gap-2 border-b border-gray-100 p-3">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input placeholder="Search chats..." className="w-full bg-transparent text-sm focus:outline-none" />
            </div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50"><MessageCircle className="h-5 w-5 text-green-600" /></div>
                <p className="mt-3 text-sm font-medium text-gray-800">No conversations yet</p>
                <p className="mt-1 text-xs text-gray-500">Incoming WhatsApp chats will appear here.</p>
              </div>
            ) : (
              items.map((c: any) => {
                const name = c.contact?.name || `${c.contact?.firstName || ''} ${c.contact?.lastName || ''}`.trim() || c.contact?.phoneNumber || 'Unknown';
                return (
                  <div key={c.id} className="flex cursor-pointer items-center gap-3 border-b border-gray-50 px-4 py-3 hover:bg-gray-50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{name}</p>
                      <p className="truncate text-xs text-gray-400">{c.lastMessage?.content || c.status || 'No messages'}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat pane placeholder */}
        <div className="hidden items-center justify-center bg-gray-50 md:flex">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm"><User className="h-7 w-7 text-gray-300" /></div>
            <p className="mt-3 text-sm text-gray-500">Select a conversation to start chatting</p>
          </div>
        </div>
      </div>
    </DashboardPageScaffold>
  );
}
