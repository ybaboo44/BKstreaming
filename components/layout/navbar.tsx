'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Menu, X, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  user?: { full_name?: string | null; avatar_url?: string | null; role?: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-bk-red font-bold text-white">
              BK
            </div>
            <span className="hidden text-lg font-bold tracking-tight sm:inline">
              BK <span className="text-bk-red">Streaming</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/videos" className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:text-white">
              Vidéos
            </Link>
            <Link href="/live" className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:text-white">
              Live
            </Link>
            {user && (
              <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:text-white">
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                autoFocus
                placeholder="Rechercher..."
                className="h-9 w-48 lg:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="icon" variant="ghost" className="h-9 w-9">
                <Search className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setSearchOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>
          )}

          {user ? (
            <>
              <Link href="/favorites">
                <Button size="icon" variant="ghost" className="h-9 w-9">
                  <Bell className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/profile">
                <Avatar className="h-8 w-8 cursor-pointer border border-white/10">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="bg-bk-dark-light text-xs">
                    {user.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm">Se connecter</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="bk">Créer un compte</Button>
              </Link>
            </div>
          )}

          <Button size="icon" variant="ghost" className="h-9 w-9 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/5 bg-bk-dark-card px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            <Link href="/videos" className="rounded-lg px-3 py-2 text-sm hover:bg-white/5" onClick={() => setMobileOpen(false)}>Vidéos</Link>
            <Link href="/live" className="rounded-lg px-3 py-2 text-sm hover:bg-white/5" onClick={() => setMobileOpen(false)}>Live</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm hover:bg-white/5" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link href="/favorites" className="rounded-lg px-3 py-2 text-sm hover:bg-white/5" onClick={() => setMobileOpen(false)}>Favoris</Link>
                <Link href="/profile" className="rounded-lg px-3 py-2 text-sm hover:bg-white/5" onClick={() => setMobileOpen(false)}>Profil</Link>
                {['ADMIN', 'SUPER_ADMIN'].includes(user.role || '') && (
                  <Link href="/admin" className="rounded-lg px-3 py-2 text-sm text-bk-red hover:bg-white/5" onClick={() => setMobileOpen(false)}>Administration</Link>
                )}
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2 text-sm hover:bg-white/5" onClick={() => setMobileOpen(false)}>Se connecter</Link>
                <Link href="/register" className="rounded-lg px-3 py-2 text-sm hover:bg-white/5" onClick={() => setMobileOpen(false)}>Créer un compte</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
