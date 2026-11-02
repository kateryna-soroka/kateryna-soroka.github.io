/** Порядок языков на переключателе и в разметке. Первым — украинский (ответ Кати 31.10: «первый укр / русский / англ»). */
export const LOCALES = ['uk', 'ru', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'uk'
export const STORAGE_KEY = 'ks-lang'

/** Подпись на переключателе и самоназвание языка для экранных дикторов. */
export const LOCALE_LABEL: Record<Locale, string> = { uk: 'UA', ru: 'RU', en: 'EN' }
export const LOCALE_NATIVE: Record<Locale, string> = { uk: 'Українська', ru: 'Русский', en: 'English' }

/** Адреса языковых версий: UA в корне, RU и EN — в своих папках (нужно для hreflang и превью в мессенджерах). */
export const LOCALE_PATH: Record<Locale, string> = { uk: '/', ru: '/ru/', en: '/en/' }

export function localeFromPath(pathname: string): Locale {
  if (/^\/ru(\/|$)/.test(pathname)) return 'ru'
  if (/^\/en(\/|$)/.test(pathname)) return 'en'
  return DEFAULT_LOCALE
}
