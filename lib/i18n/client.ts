import { useTranslations as useNextIntlTranslations } from 'next-intl';

// Hook personnalisé qui remplace react-i18next
export function useTranslation(namespace?: string) {
  const t = useNextIntlTranslations(namespace);

  return { t };
}
