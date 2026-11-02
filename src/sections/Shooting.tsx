import { useI18n } from '../i18n/I18nProvider'
import { Pin } from '../components/icons'
import { Cta, SectionHead } from '../components/ui'

/**
 * Экран 05 (ТЗ §8): описание, география физической съёмки, этапы, кнопка.
 * Примеров работ здесь нет — решение Кати 31.10; все работы собраны в «Портфолио».
 */
export function Shooting() {
  const { t } = useI18n()

  return (
    <section id="shooting" className="section shooting" aria-labelledby="shooting-title">
      <div className="container shooting__grid">
        <div className="shooting__intro">
          <SectionHead num="05" title={t.shooting.title} id="shooting-title" />
          <p className="lead" data-reveal>
            {t.shooting.intro}
          </p>
          <div className="geo" data-reveal>
            <h3 className="h-label">{t.shooting.geoTitle}</h3>
            <p className="geo__places">
              <Pin width={18} height={18} />
              {t.shooting.geo}
            </p>
            <p className="geo__note">{t.shooting.geoNote}</p>
          </div>
        </div>

        <div className="shooting__side">
          <div data-reveal>
            <h3 className="h-label">{t.shooting.stagesTitle}</h3>
            <ol className="steps">
              {t.shooting.stages.map((stage, i) => (
                <li key={stage}>
                  <span className="steps__num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {stage}
                </li>
              ))}
            </ol>
          </div>
          <div data-reveal>
            <Cta>{t.shooting.cta}</Cta>
          </div>
        </div>
      </div>
    </section>
  )
}
