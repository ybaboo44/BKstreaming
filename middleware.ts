import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Évite un crash Edge si les variables Supabase ne sont pas présentes
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Missing Supabase environment variables in middleware."
    );

    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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

  /*
   * Vérifie la session Supabase
   */
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  /*
   * Routes publiques
   */
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];

  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/api/auth");

  /*
   * Utilisateur non connecté
   */
  if (!user || userError) {
    if (isPublicRoute) {
      return response;
    }

    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  /*
   * Utilisateur connecté :
   * empêcher l'accès aux pages d'authentification
   */
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  /*
   * Protection de /admin
   */
  if (pathname.startsWith("/admin")) {
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      console.error(
        "Middleware profile error:",
        profileError?.message
      );

      return NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
    }

    /*
     * Compte suspendu
     */
    if (profile.status === "SUSPENDED") {
      return NextResponse.redirect(
        new URL("/login?error=suspended", request.url)
      );
    }

    /*
     * Vérification administrateur
     */
    const isAdmin =
      profile.role === "ADMIN" ||
      profile.role === "SUPER_ADMIN";

    if (!isAdmin) {
      return NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
    }
  }

  return response;
}

/*
 * Le middleware ne s'exécute pas sur les fichiers statiques
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};