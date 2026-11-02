import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { App } from './App'
import { dictionaries } from './content/i18n'
import { getImage } from './content/media'
import type { Locale } from './i18n/locales'

/** Заранее отрисованная страница для языка — используется scripts/prerender.mjs при сборке. */
export function render(locale: Locale) {
  return renderToString(
    <StrictMode>
      <App initialLocale={locale} />
    </StrictMode>,
  )
}

export function meta(locale: Locale) {
  return dictionaries[locale].meta
}

export function heroName(locale: Locale) {
  return `${dictionaries[locale].hero.firstName} ${dictionaries[locale].hero.lastName}`
}

export function roles(locale: Locale) {
  return dictionaries[locale].hero.roles
}

/** Услуги для разметки поисковиков — названия разделов страницы, без цен. remote: делается удалённо (география шире съёмок). */
export function services(locale: Locale) {
  const d = dictionaries[locale]
  return [
    { name: d.smm.title, remote: true },
    { name: d.shooting.title, remote: false },
    { name: d.editing.title, remote: true },
    { name: d.editing.aiTitle, remote: true },
    { name: d.branding.title, remote: true },
  ]
}

export const heroImage = getImage('hero/hero')
export { contacts } from './content/site'
