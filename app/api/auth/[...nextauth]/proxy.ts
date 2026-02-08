export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", '/settings/:path*', '/settings', '/billing', '/billing/:path*'],
};


