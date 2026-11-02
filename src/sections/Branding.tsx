import { useI18n } from '../i18n/I18nProvider'
import { Cta, SectionHead } from '../components/ui'

/**
 * Экран 07 (ТЗ §10): заголовок и описание → направления работы → CTA.
 * Миниатюры «Мои проекты» сняты 31.10: работы WOW Beauty Lab и Anna Soul — в «Портфолио»
 * по кейсам (решение Кати: все работы в общем портфолио, а не под каждым разделом).
 */
export function Branding() {
  const { t } = useI18n()

  return (
    <section id="branding" className="section branding" aria-labelledby="branding-title">
      <div className="container branding__grid">
        <div className="branding__intro">
          <SectionHead num="07" title={t.branding.title} id="branding-title" />
          <p className="lead" data-reveal>
            {t.branding.text}
          </p>
        </div>

        <div className="branding__side">
          <div data-reveal>
            <h3 className="h-label">{t.branding.directionsTitle}</h3>
            <ol className="directions">
              {t.branding.directions.map((d, i) => (
                <li key={d}>
                  <span className="directions__num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {d}
                </li>
              ))}
            </ol>
          </div>

          <div data-reveal>
            <Cta>{t.branding.cta}</Cta>
          </div>
        </div>
      </div>
    </section>
  )
}
