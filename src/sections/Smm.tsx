import { useState } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { PACKAGES, SMM_ROWS, type Mark, type PackageId } from '../content/smm'
import { Check, Cross, Plus } from '../components/icons'
import { Cta, SectionHead, trackPointer } from '../components/ui'

const MARK_ICON: Record<Mark, typeof Check> = { yes: Check, no: Cross, extra: Plus }

/**
 * Держит нажатый заголовок на месте экрана, пока пакет над ним сворачивается.
 * Без этого Complete после клика улетал вверх за край на высоту списка Base (~1000 px):
 * браузерная привязка прокрутки не срабатывает — её якорь сидит внутри сворачиваемого списка.
 * Прокрутку человека не перебиваем: колесо или касание останавливают подстройку.
 */
function keepInPlace(el: HTMLElement) {
  const top0 = el.getBoundingClientRect().top
  const until = performance.now() + 800 // анимация сворачивания — 0.6 с
  let stopped = false
  const stop = () => (stopped = true)
  addEventListener('wheel', stop, { once: true, passive: true })
  addEventListener('touchstart', stop, { once: true, passive: true })
  const step = () => {
    if (stopped) return
    const drift = el.getBoundingClientRect().top - top0
    if (Math.abs(drift) > 0.5) scrollBy({ top: drift, behavior: 'instant' })
    if (performance.now() < until) requestAnimationFrame(step)
    else {
      removeEventListener('wheel', stop)
      removeEventListener('touchstart', stop)
    }
  }
  requestAnimationFrame(step)
}

/**
 * Экран 04 (ТЗ §7). Две раскрывающиеся панели SMM Base и SMM Complete: открыта одна,
 * открытая подсвечена фирменным градиентом. При входе обе закрыты (Катя 01.11: раскрытый Base на телефоне
 * занимал экран, и Complete под ним терялся) — человек видит оба пакета рядом и сам выбирает, какой открыть.
 * Строки в обоих пакетах идут в одном порядке,
 * поэтому, переключаясь, человек сравнивает построчно — без тесной таблицы на телефоне.
 * Легенда стоит над пакетами: значки ✓ × + объяснены до того, как встретятся в 21 строке.
 * Под пакетами — сноска и призыв. Скриншоты статистики с 31.10 живут в «Портфолио» внутри кейсов
 * (решение Кати: все работы — в общем портфолио, а не под каждым разделом).
 */
export function Smm() {
  const { t } = useI18n()
  const [open, setOpen] = useState<PackageId | null>(null)

  return (
    <section id="smm" className="section smm" aria-labelledby="smm-title">
      <div className="container">
        <div className="split-head">
          <SectionHead num="04" title={t.smm.title} id="smm-title" />
          <p className="lead" data-reveal>
            {t.smm.intro}
          </p>
        </div>

        <ul className="legend" data-reveal>
          {(['yes', 'no', 'extra'] as const).map((mark) => {
            const Icon = MARK_ICON[mark]
            return (
              <li key={mark}>
                <span className={`mark mark--${mark}`} aria-hidden="true">
                  <Icon width={12} height={12} />
                </span>
                {t.smm.legend[mark]}
              </li>
            )
          })}
        </ul>

        <div className="packages">
          {PACKAGES.map((id) => {
            const isOpen = open === id
            return (
              <article key={id} className="pkg" data-open={isOpen} data-reveal>
                <h3 className="pkg__heading">
                  <button
                    type="button"
                    className="pkg__head glow"
                    aria-expanded={isOpen}
                    aria-controls={`pkg-${id}`}
                    id={`pkg-${id}-label`}
                    onClick={(e) => {
                      keepInPlace(e.currentTarget)
                      setOpen(isOpen ? null : id)
                    }}
                    onPointerMove={trackPointer}
                  >
                    <span className="pkg__name">{t.smm.packages[id]}</span>
                    <span className="pkg__toggle" aria-hidden="true">
                      <Plus width={22} height={22} />
                    </span>
                  </button>
                </h3>
                <div className="pkg__body" id={`pkg-${id}`} role="region" aria-labelledby={`pkg-${id}-label`} inert={!isOpen}>
                  <div className="pkg__clip">
                    <ul className="pkg__rows">
                      {SMM_ROWS.map((row) => {
                        const mark = row[id]
                        const Icon = MARK_ICON[mark]
                        return (
                          <li key={row.id} className={`pkg__row pkg__row--${mark}`}>
                            <span className={`mark mark--${mark}`} aria-hidden="true">
                              <Icon width={14} height={14} />
                            </span>
                            <span className="sr-only">{t.smm.legend[mark]}: </span>
                            <span>{t.smm.rows[row.id]}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <p className="footnote" data-reveal>
          {t.smm.footnote}
        </p>

        <div className="smm__cta" data-reveal>
          <Cta>{t.smm.cta}</Cta>
        </div>
      </div>
    </section>
  )
}
