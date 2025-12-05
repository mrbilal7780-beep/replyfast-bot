import { createContext, useContext, useState, useEffect } from 'react';
import { translations, detectBrowserLanguage, availableLanguages } from '../lib/i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('fr');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // FORCER FRANÇAIS UNIQUEMENT (pas de détection automatique)
    setLocale('fr');
    localStorage.setItem('replyfast_locale', 'fr');

    // Forcer LTR et langue française
    document.documentElement.setAttribute('dir', 'ltr');
    document.documentElement.lang = 'fr';

    setIsLoading(false);
  }, []);

  const changeLanguage = (newLocale) => {
    setLocale(newLocale);
    localStorage.setItem('replyfast_locale', newLocale);

    // Appliquer direction RTL/LTR
    const lang = availableLanguages.find(l => l.code === newLocale);
    if (lang?.dir === 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
    document.documentElement.lang = newLocale;
  };

  // Fonction de traduction
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[locale] || translations['fr'];

    for (const k of keys) {
      value = value?.[k];
      if (!value) return key;
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t, isLoading }}>
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
