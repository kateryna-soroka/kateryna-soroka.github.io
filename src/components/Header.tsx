import { useEffect, useRef } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { LOCALES, LOCALE_LABEL, LOCALE_NATIVE } from '../i18n/locales'

/** ТЗ §4, §13: слева «ПОРТФОЛИО», справа UA / RU / EN (порядок — ответ Кати 31.10). Других пунктов в шапке нет. */
export function Header() {
  const { t, locale, setLocale } = useI18n()
  const ref = useRef<HTMLElement>(null)

  // Подложка шапки появляется после начала прокрутки — без перерисовки React на каждый кадр
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      el.dataset.scrolled = window.scrollY > 8 ? 'true' : 'false'
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <header ref={ref} className="site-header">
      <div className="container site-header__inner">
        <a href="#top" className="site-header__brand" aria-label={`${t.header.portfolio} — ${t.header.toTop}`}>
          {t.header.portfolio}
        </a>
        <nav aria-label={t.common.langSwitcher}>
          <ul className="lang">
            {LOCALES.map((l, i) => (
              <li key={l} className="lang__item">
                {i > 0 && (
                  <span className="lang__sep" aria-hidden="true">
                    /
                  </span>
                )}
                <button
                  type="button"
                  className="lang__btn"
                  lang={l}
                  title={LOCALE_NATIVE[l]}
                  aria-pressed={l === locale}
                  onClick={() => setLocale(l)}
                >
                  {LOCALE_LABEL[l]}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
