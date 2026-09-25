'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, MessageCircle, History, Bot, Users, Megaphone,
  BarChart3, GitBranch, CreditCard, Mail, Blocks, Code2, FolderKanban,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/store/ui.store';
import { Logo } from '@/components/brand/logo';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inbox', label: 'Live Chat', icon: MessageCircle },
  { href: '/analytics', label: 'History', icon: History },
  { href: '/ai-agents', label: 'AI Agent', icon: Bot },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/campaigns/ads', label: 'Ads Manager', icon: BarChart3 },
  { href: '/workflows', label: 'Flows', icon: GitBranch },
  { href: '/billing', label: 'WA Payments', icon: CreditCard },
  { href: '/templates', label: 'Message', icon: Mail },
  { href: '/chatbots', label: 'Integrations', icon: Blocks },
];

const bottomNav = [
  { href: '/developer', label: 'Developer', icon: Code2 },
  { href: '/settings', label: 'All Projects', icon: FolderKanban },
];

export function Sidebar() {
  const path = usePathname();
  const { sidebarOpen, closeSidebar } = useUiStore();

  const isActive = (href: string) => {
    if (path === href) return true;
    if (href === '/dashboard') return false;
    // exact-prefix match, but don't let a parent (/campaigns) light up on a child route (/campaigns/ads)
    if (path.startsWith(href + '/')) {
      const deeper = nav.some(n => n.href !== href && n.href.startsWith(href + '/') && (path === n.href || path.startsWith(n.href + '/')));
      return !deeper;
    }
    return false;
  };

  const NavLink = ({ item }: { item: (typeof nav)[number] }) => {
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        onClick={closeSidebar}
        className={cn(
          'group flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium transition-colors',
          active ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
        )}
      >
        <item.icon className={cn('h-5 w-5 shrink-0', active ? 'text-green-400' : 'text-gray-400 group-hover:text-white')} />
        <span className="text-center leading-tight">{item.label}</span>
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-20 flex-col bg-[#0b3d2e] transition-transform md:static md:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Logo + mobile close */}
      <div className="flex items-center justify-center border-b border-white/10 py-3.5">
        <Logo href="/dashboard" size={36} showText={false} onClick={closeSidebar} />
        <button onClick={closeSidebar} className="absolute right-2 top-3 text-white/70 md:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-1.5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {nav.map(item => <NavLink key={item.href} item={item} />)}
      </nav>

      {/* Bottom nav */}
      <div className="space-y-1 border-t border-white/10 px-1.5 py-3">
        {bottomNav.map(item => <NavLink key={item.href} item={item} />)}
      </div>
    </aside>
  );
}
