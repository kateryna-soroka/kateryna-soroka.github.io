import { useI18n } from '../i18n/I18nProvider'
import { ArrowUpRight } from '../components/icons'
import { trackPointer } from '../components/ui'

/** Порядок панелей = порядок разделов; номер панели совпадает с номером раздела на странице. */
const ITEMS = [
  { id: 'smm', num: '04' },
  { id: 'shooting', num: '05' },
  { id: 'editing', num: '06' },
  { id: 'branding', num: '07' },
  { id: 'portfolio', num: '08' },
  { id: 'contacts', num: '09' },
] as const

/** Экран 03 (ТЗ §3, §6): ровно шесть панелей — номер, название, стрелка. Без подзаголовков. */
export function Navigation() {
  const { t } = useI18n()
  return (
    <nav id="navigation" className="section section--tight nav-section" aria-labelledby="navigation-title">
      <div className="container">
        <div className="section-head section-head--quiet" data-reveal>
          <span className="eyebrow" aria-hidden="true">
            03
          </span>
          <h2 id="navigation-title" className="sr-only">
            {t.nav.title}
          </h2>
        </div>
        <ul className="nav-grid">
          {ITEMS.map((item, i) => (
            <li key={item.id} className={`nav-grid__cell nav-grid__cell--${i + 1}`} data-reveal style={{ transitionDelay: `${i * 60}ms` }}>
              <a href={`#${item.id}`} className="nav-panel glow" onPointerMove={trackPointer}>
                <span className="nav-panel__num" aria-hidden="true">
                  {item.num}
                </span>
                <span className="nav-panel__title">{t.nav.items[item.id]}</span>
                <span className="nav-panel__arrow" aria-hidden="true">
                  <ArrowUpRight width={20} height={20} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
