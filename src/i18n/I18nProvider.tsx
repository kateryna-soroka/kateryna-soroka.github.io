import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { dictionaries, type Dict } from '../content/i18n'
import { LOCALE_PATH, STORAGE_KEY, type Locale } from './locales'

interface I18n {
  locale: Locale
  t: Dict
  setLocale: (next: Locale) => void
}

const I18nContext = createContext<I18n | null>(null)

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const t = dictionaries[locale]

  // Язык меняется без перезагрузки: состояние + адрес языковой версии + запомненный выбор
  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // приватный режим: выбор просто не запомнится
    }
    window.history.replaceState(null, '', LOCALE_PATH[next] + window.location.search + window.location.hash)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = t.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description)
  }, [locale, t])

  const value = useMemo(() => ({ locale, t, setLocale }), [locale, t, setLocale])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n вызван вне I18nProvider')
  return ctx
}
