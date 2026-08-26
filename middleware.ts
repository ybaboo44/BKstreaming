import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Créer le client Supabase compatible Edge/Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT :
  // getUser() vérifie réellement la session auprès de Supabase.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ============================================================
  // ROUTES PUBLIQUES
  // ============================================================

  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ];

  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith('/api/auth');

  // Les fichiers Next.js / assets ne doivent pas être traités
  if (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$/)
  ) {
    return response;
  }

  // ============================================================
  // UTILISATEUR NON CONNECTÉ
  // ============================================================

  if (!user || userError) {
    if (isPublicRoute) {
      return response;
    }

    return NextResponse.redirect(
      new URL('/login', request.url)
    );
  }

  // ============================================================
  // UTILISATEUR CONNECTÉ
  // ============================================================

  // Si l'utilisateur connecté essaie d'aller sur login/register
  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password'
  ) {
    return NextResponse.redirect(
      new URL('/dashboard', request.url)
    );
  }

  // ============================================================
  // ROUTES ADMIN
  // ============================================================

  if (pathname.startsWith('/admin')) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('user_id', user.id)
      .maybeSingle();

    // Si erreur ou profil inexistant
    if (profileError || !profile) {
      console.error(
        'Middleware profile error:',
        profileError?.message
      );

      return NextResponse.redirect(
        new URL('/dashboard', request.url)
      );
    }

    // Compte suspendu
    if (profile.status === 'SUSPENDED') {
      return NextResponse.redirect(
        new URL('/login?error=suspended', request.url)
      );
    }

    // Vérification rôle administrateur
    const isAdmin =
      profile.role === 'ADMIN' ||
      profile.role === 'SUPER_ADMIN';

    if (!isAdmin) {
      return NextResponse.redirect(
        new URL('/dashboard', request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Intercepter les pages mais ignorer :
     * - _next/static
     * - _next/image
     * - favicon
     * - images
     * - fichiers statiques
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)',
  ],
};