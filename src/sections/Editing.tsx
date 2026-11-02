import { useI18n } from '../i18n/I18nProvider'
import { Cta, SectionHead } from '../components/ui'

/**
 * Экран 06 (ТЗ §9): описание, услуги и отдельный блок AI Video со своим текстом.
 * Услуги с 01.11 — три вида монтажа и пакеты со скидкой словами Кати («здесь описано неправильно»).
 * Ролики с 31.10 — в «Портфолио» (решение Кати), здесь примеров нет.
 */
export function Editing() {
  const { t } = useI18n()

  return (
    <section id="editing" className="section editing" aria-labelledby="editing-title">
      <div className="container">
        <div className="editing__top">
          <div className="editing__text">
            <SectionHead num="06" title={t.editing.title} id="editing-title" />
            <p className="lead" data-reveal>
              {t.editing.intro}
            </p>
          </div>
          <div className="editing__services" data-reveal>
            <h3 className="h-label">{t.editing.servicesTitle}</h3>
            <ul className="tick-list service-list">
              {t.editing.services.map((s) => (
                <li key={s.name}>
                  <span>
                    <span className="service-list__name">{s.name}</span>
                    <span className="service-list__includes">{s.includes}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="packages">
              <h3 className="h-label">{t.editing.packagesTitle}</h3>
              <p className="packages__note">{t.editing.packagesNote}</p>
              <ul className="packages__list">
                {t.editing.packages.map((p) => (
                  <li key={p.name}>
                    <span>{p.name}</span>
                    <span className="packages__discount">−{p.discount}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="ai-block" data-reveal>
          <h3 className="h-sub">{t.editing.aiTitle}</h3>
          <p>{t.editing.aiText}</p>
        </div>

        <div className="section-cta" data-reveal>
          <Cta>{t.editing.cta}</Cta>
        </div>
      </div>
    </section>
  )
}
