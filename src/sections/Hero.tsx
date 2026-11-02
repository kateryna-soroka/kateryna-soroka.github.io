import { useI18n } from '../i18n/I18nProvider'
import { getImage } from '../content/media'
import { Picture } from '../components/Picture'
import { Placeholder } from '../components/Placeholder'

/**
 * Экран 01 (ТЗ §4). Десктоп и iPad — имя слева, портрет справа.
 * Мобильный — утверждённый вариант Б: имя слева, крупный портрет снизу и прижат вправо;
 * текст стоит над фото и лица не касается (проверяется e2e-тестом).
 */
export function Hero() {
  const { t } = useI18n()
  const portrait = getImage('hero/hero')
  const [from, to] = t.hero.caption2.split('→').map((s) => s.trim())

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      {/* data-face-box — где лицо на исходном кадре (x, y, ширина, высота в долях); по нему тест ловит перекрытие лица текстом */}
      <div className="hero__media" data-face-box="0.44,0.08,0.27,0.52">
        {portrait ? (
          <Picture
            image={portrait}
            alt={t.hero.portraitAlt}
            // Кадр заполняет блок по высоте (object-fit: cover), поэтому на экране он шире блока:
            // с 768 px нужен самый крупный файл, на телефоне — около 134vw
            sizes="(min-width: 768px) 1396px, 134vw"
            priority
            className="hero__picture"
            imgClassName="hero__img"
          />
        ) : (
          <Placeholder media="image" />
        )}
      </div>
      <div className="container hero__inner">
        <div className="hero__text">
          <h1 id="hero-title" className="hero__name">
            <span>{t.hero.firstName}</span> <span>{t.hero.lastName}</span>
          </h1>
          <p className="hero__pill">{t.hero.roles}</p>
          <div className="hero__captions">
            <p>{t.hero.caption1}</p>
            <p>
              {from}{' '}
              <span className="hero__arrow" aria-hidden="true">
                →
              </span>{' '}
              {to}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
