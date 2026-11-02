import { useI18n } from '../i18n/I18nProvider'
import { getImage } from '../content/media'
import { Picture } from '../components/Picture'
import { Placeholder } from '../components/Placeholder'
import { SectionHead } from '../components/ui'

/**
 * Экран 02 (ТЗ §5): селфи с собранными волосами и ровно три абзаца.
 * На телефоне фото скрыто (правка Кати 01.11): Hero кончается портретом, второй подряд — повтор.
 * На планшете фото под текстом, на компьютере текст слева, фото справа.
 */
export function About() {
  const { t } = useI18n()
  const photo = getImage('about/about')

  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="container about__grid">
        <div className="about__text">
          <SectionHead num="02" title={t.about.title} id="about-title" />
          <div className="about__body" data-reveal>
            {t.about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        <figure className="about__photo" data-reveal>
          {photo ? (
            <Picture image={photo} alt={t.about.photoAlt} sizes="(min-width: 1024px) 38vw, 100vw" imgClassName="about__img" objectPosition="50% 25%" />
          ) : (
            <Placeholder media="image" />
          )}
        </figure>
      </div>
    </section>
  )
}
