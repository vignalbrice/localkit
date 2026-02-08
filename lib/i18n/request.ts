import { getRequestConfig } from 'next-intl/server';

// Liste des locales supportées
export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Utiliser la locale par défaut si celle fournie n'est pas supportée
  // (au lieu de notFound() qui n'est pas permis dans le root layout)
  const validLocale = locales.includes(locale as Locale) ? locale : 'fr';

  return {
    locale: validLocale as string,
    messages: (await import(`../../messages/${validLocale}.json`)).default,
  };
});
