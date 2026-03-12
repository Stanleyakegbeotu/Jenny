import { createContext, useContext, useState } from 'react';

type Language = 'en' | 'es' | 'fr' | 'pt' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  detectedLanguage: Language;
}

const languages = {
  en: { name: 'English', flag: '🇬🇧' },
  es: { name: 'Spanish', flag: '🇪🇸' },
  fr: { name: 'French', flag: '🇫🇷' },
  pt: { name: 'Portuguese', flag: '🇵🇹' },
  de: { name: 'German', flag: '🇩🇪' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const detectLanguage = (): Language => {
    const browserLang = (navigator.language || 'en').split('-')[0] as Language;
    return (Object.keys(languages) as Language[]).includes(browserLang) ? browserLang : 'en';
  };

  const [language, setLanguage] = useState<Language>(detectLanguage);
  const [detectedLanguage] = useState<Language>(detectLanguage);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, detectedLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export { languages };
export type { Language };
