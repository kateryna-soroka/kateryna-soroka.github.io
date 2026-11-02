import { useEffect } from 'react'
import { I18nProvider, useI18n } from './i18n/I18nProvider'
import type { Locale } from './i18n/locales'
import { LightboxProvider } from './components/Lightbox'
import { Header } from './components/Header'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Navigation } from './sections/Navigation'
import { Smm } from './sections/Smm'
import { Shooting } from './sections/Shooting'
import { Editing } from './sections/Editing'
import { Branding } from './sections/Branding'
import { Portfolio } from './sections/Portfolio'
import { Contacts } from './sections/Contacts'

export function App({ initialLocale }: { initialLocale: Locale }) {
  return (
    <I18nProvider initialLocale={initialLocale}>
      <LightboxProvider>
        <Page />
      </LightboxProvider>
    </I18nProvider>
  )
}

function Page() {
  const { t } = useI18n()
  useReveal()
  return (
    <>
      <a className="skip-link" href="#main">
        {t.common.skipLink}
      </a>
      <Header />
      {/* ТЗ §3: ровно 9 разделов в этом порядке */}
      <main id="main">
        <Hero />
        <About />
        <Navigation />
        <Smm />
        <Shooting />
        <Editing />
        <Branding />
        <Portfolio />
        <Contacts />
      </main>
    </>
  )
}

/** Плавное появление блоков при прокрутке. Отметку ставим data-атрибутом: React её не перетрёт. */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => (el.dataset.in = ''))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          ;(entry.target as HTMLElement).dataset.in = ''
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}
