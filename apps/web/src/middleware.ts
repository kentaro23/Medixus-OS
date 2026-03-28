import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isSupabaseConfigured(): boolean {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "your-supabase-url" &&
    supabaseAnonKey !== "your-supabase-anon-key" &&
    supabaseUrl.startsWith("http")
  );
}

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/callback",
  "/auth/verify",
  "/auth/reset-password",
];

const ROLE_ROUTE_MAP: Record<string, string[]> = {
  patient: ["/dashboard", "/triage", "/appointments", "/prescriptions", "/medications", "/health", "/messages", "/settings"],
  doctor: ["/doctor"],
  nurse: ["/doctor"],
  clerk: ["/clinic"],
  clinic_admin: ["/clinic"],
  medixus_admin: ["/admin"],
};

function getDefaultRoute(role: string): string {
  switch (role) {
    case "patient": return "/dashboard";
    case "doctor":
    case "nurse": return "/doctor/dashboard";
    case "clerk":
    case "clinic_admin": return "/clinic";
    case "medixus_admin": return "/admin";
    default: return "/dashboard";
  }
}

function isAllowedRoute(role: string, pathname: string): boolean {
  if (role === "medixus_admin") return true;
  const allowed = ROLE_ROUTE_MAP[role];
  if (!allowed) return false;
  return allowed.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }>
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname === "/";

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname.startsWith("/auth/") && pathname !== "/auth/callback") {
    const url = request.nextUrl.clone();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || user.user_metadata?.role || "patient";
    url.pathname = getDefaultRoute(role);
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || user.user_metadata?.role || "patient";
    const url = request.nextUrl.clone();
    url.pathname = getDefaultRoute(role);
    return NextResponse.redirect(url);
  }

  if (user && !isPublicPath) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || user.user_metadata?.role || "patient";

    if (!isAllowedRoute(role, pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = getDefaultRoute(role);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
