import { useTranslation } from 'react-i18next';

export type Language = 'en' | 'es' | 'fr' | 'pt' | 'de';

export const languages: Record<Language, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇬🇧' },
  es: { name: 'Spanish', flag: '🇪🇸' },
  fr: { name: 'French', flag: '🇫🇷' },
  pt: { name: 'Portuguese', flag: '🇵🇹' },
  de: { name: 'German', flag: '🇩🇪' },
};

/**
 * Custom hook for i18n translations and language switching
 */
export function useI18n() {
  const { t, i18n } = useTranslation();

  // Extract language code (first 2 chars) and ensure it's valid
  const rawLanguage = i18n.language || 'en';
  const languageCode = (rawLanguage.split('-')[0] || 'en') as Language;
  const currentLanguage: Language = languages[languageCode] ? languageCode : 'en';

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    languages,
  };
}
