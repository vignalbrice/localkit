import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import createIntlMiddleware from 'next-intl/middleware';
import { locales } from './lib/i18n/request';
import { NextRequest } from 'next/server';

// Créer le middleware next-intl
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'fr',
  localeDetection: true,
});

// Créer le middleware NextAuth
const authMiddleware = NextAuth(authConfig).auth;

// Combiner les deux middlewares
export default async function middleware(req: NextRequest) {
  // D'abord, appliquer le middleware d'internationalisation
  const intlResponse = intlMiddleware(req);

  // Ensuite, appliquer le middleware d'authentification
  // @ts-expect-error - NextAuth middleware types
  return authMiddleware(req, intlResponse);
}

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
