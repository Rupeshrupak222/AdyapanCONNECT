'use client';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, LogOut, ChevronDown, RefreshCw, User, Settings, CreditCard, CheckCircle2, MessageSquare, Megaphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { getInitials } from '@/lib/utils';

type Notif = { id: string; icon: any; title: string; time: string; color: string };

const notifications: Notif[] = [
  { id: 'n1', icon: MessageSquare, title: 'New message from Rahul Sharma', time: '2 min ago', color: 'text-blue-600 bg-blue-50' },
  { id: 'n2', icon: Megaphone, title: 'Diwali Offer broadcast delivered to 1,240 contacts', time: '1 hour ago', color: 'text-green-600 bg-green-50' },
  { id: 'n3', icon: CheckCircle2, title: 'Template "order_confirmation" approved', time: '3 hours ago', color: 'text-emerald-600 bg-emerald-50' },
];

export function TopBar() {
  const { user, tenantSlug, clearAuth } = useAuthStore();
  const { openSidebar } = useUiStore();
  const router = useRouter();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { data: numbers } = useQuery({
    queryKey: ['wa-numbers-topbar'],
    queryFn: async () => (await api.get('/whatsapp/numbers')).data.data as any[],
    retry: false,
  });

  const isLive = Array.isArray(numbers) && numbers.some(n => n.status === 'CONNECTED' && n.displayPhoneNumber !== 'Sandbox Business');
  const isSandbox = Array.isArray(numbers) && numbers.some(n => n.displayPhoneNumber === 'Sandbox Business');

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => { clearAuth(); router.push('/login'); };

  const businessName =
    user?.tenantName ||
    (tenantSlug && tenantSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())) ||
    (user ? `${user.firstName} ${user.lastName}` : 'My Workspace');

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User';

  return (
    <header className="relative flex h-14 items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 sm:px-6">
      {/* Left: hamburger + business name */}
      <div className="flex min-w-0 items-center gap-3">
        <button onClick={openSidebar} className="text-gray-500 md:hidden" aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="truncate text-sm font-bold text-gray-900 sm:text-base">{businessName}</h1>
      </div>

      {/* Right: status + plan + actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden items-center gap-1.5 text-xs lg:flex">
          <span className="text-gray-400">WhatsApp Business API Status :</span>
          {isLive ? (
            <span className="flex items-center gap-1 font-semibold text-green-600">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> LIVE
            </span>
          ) : isSandbox ? (
            <span className="flex items-center gap-1 font-semibold text-amber-600">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> SANDBOX
            </span>
          ) : (
            <span className="flex items-center gap-1 font-semibold text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" /> NOT CONNECTED
            </span>
          )}
        </div>

        <div className="hidden items-center gap-1.5 text-xs md:flex">
          <span className="text-gray-400">Current Plan :</span>
          <span className="font-semibold text-gray-700">FREE FOREVER</span>
        </div>

        <Link
          href="/billing"
          className="flex items-center gap-1.5 rounded-md bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-600"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Explore Plans
        </Link>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(o => !o); setUnread(false); }}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unread && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-green-500" />}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">{notifications.length} new</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="flex items-start gap-3 border-b border-gray-50 px-4 py-3 last:border-0 hover:bg-gray-50">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${n.color}`}>
                      <n.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800">{n.title}</p>
                      <p className="text-[11px] text-gray-400">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/analytics" onClick={() => setNotifOpen(false)} className="block border-t border-gray-100 px-4 py-2.5 text-center text-xs font-semibold text-green-600 hover:bg-gray-50">
                View all activity
              </Link>
            </div>
          )}
        </div>

        {/* Profile menu */}
        <div ref={profileRef} className="relative border-l border-gray-200 pl-2 sm:pl-3">
          <button onClick={() => setProfileOpen(o => !o)} className="flex items-center gap-2 rounded-lg py-1 pr-1 hover:bg-gray-50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
              {user ? getInitials(fullName) : 'U'}
            </div>
            <div className="hidden text-left sm:block">
              <div className="text-xs font-semibold text-gray-900">{fullName}</div>
              <div className="text-[11px] capitalize text-gray-400">{user?.role?.toLowerCase().replace(/_/g, ' ') || 'member'}</div>
            </div>
            <ChevronDown className={`hidden h-4 w-4 text-gray-400 transition-transform sm:block ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">{fullName}</p>
                <p className="truncate text-xs text-gray-400">{user?.email || 'user@example.com'}</p>
              </div>
              <div className="py-1">
                <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <User className="h-4 w-4 text-gray-400" /> My Profile
                </Link>
                <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <Settings className="h-4 w-4 text-gray-400" /> Settings
                </Link>
                <Link href="/billing" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <CreditCard className="h-4 w-4 text-gray-400" /> Billing & Plans
                </Link>
              </div>
              <button onClick={handleLogout} className="flex w-full items-center gap-2.5 border-t border-gray-100 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
