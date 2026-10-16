import React, { createContext, useContext, useEffect, useState } from 'react';
import { LocaleType } from '../data/types';
import pt from './pt.json';
import es from './es.json';
import en from './en.json';

const translations: Record<LocaleType, Record<string, any>> = {
  pt,
  es,
  en,
};

interface I18nContextType {
  locale: LocaleType;
  setLocale: (loc: LocaleType) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = 'colodemae_locale';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<LocaleType>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as LocaleType | null;
    if (saved && ['pt', 'es', 'en'].includes(saved)) {
      return saved;
    }
    const navLang = navigator.language.toLowerCase();
    if (navLang.startsWith('es')) return 'es';
    if (navLang.startsWith('en')) return 'en';
    return 'pt';
  });

  const setLocale = (newLocale: LocaleType) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split('.');
    let current: any = translations[locale];
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to Portuguese if missing
        let fallback: any = translations.pt;
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            fallback = null;
            break;
          }
        }
        current = fallback || path;
        break;
      }
    }

    if (typeof current !== 'string') {
      return path;
    }

    if (params) {
      return Object.entries(params).reduce((str, [paramKey, paramVal]) => {
        return str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      }, current);
    }

    return current;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextType {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}
