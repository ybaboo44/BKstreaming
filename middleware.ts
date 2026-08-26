import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Ne pas intercepter les requêtes de Server Actions
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return response;
  }

  // Routes publiques
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
  if (publicRoutes.includes(pathname)) {
    if (user && pathname !== '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  // Si pas authentifié → login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Vérifier le profil pour les routes protégées
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.status === 'SUSPENDED') {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/login?error=suspended', request.url));
  }

  // Routes admin
  if (pathname.startsWith('/admin')) {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
