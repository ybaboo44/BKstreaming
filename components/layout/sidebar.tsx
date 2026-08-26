'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Video, Radio, Users, FolderOpen, BarChart3,
  Bell, ShieldAlert, Settings, Home, Heart, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/videos', label: 'Vidéos', icon: Video },
  { href: '/admin/live', label: 'Live', icon: Radio },
  { href: '/admin/categories', label: 'Catégories', icon: FolderOpen },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldAlert },
  { href: '/admin/settings', label: 'Paramètres', icon: Settings },
];

const userLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/videos', label: 'Vidéos', icon: Video },
  { href: '/live', label: 'Live', icon: Radio },
  { href: '/favorites', label: 'Favoris', icon: Heart },
];

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/5 bg-bk-dark-card lg:flex">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-bk-red font-bold text-white">
            BK
          </div>
          <span className="text-lg font-bold tracking-tight">
            BK <span className="text-bk-red">Streaming</span>
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-bk-red/10 text-bk-red'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
