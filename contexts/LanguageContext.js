import { createContext, useContext, useState, useEffect } from 'react';
import { translations, detectBrowserLanguage, availableLanguages } from '../lib/i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('fr');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Charger la langue depuis localStorage ou détecter
    const savedLocale = localStorage.getItem('replyfast_locale');
    if (savedLocale && availableLanguages.find(l => l.code === savedLocale)) {
      setLocale(savedLocale);
    } else {
      const detected = detectBrowserLanguage();
      setLocale(detected);
      localStorage.setItem('replyfast_locale', detected);
    }

    // Appliquer la direction pour les langues RTL
    const lang = availableLanguages.find(l => l.code === savedLocale || l.code === locale);
    if (lang?.dir === 'rtl') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.lang = locale;
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.lang = locale;
    }

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
