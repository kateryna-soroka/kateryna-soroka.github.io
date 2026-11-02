import type { CSSProperties } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import type { Locale } from '../i18n/locales'
import { getImage, pickLocalized } from '../content/media'
import { PORTFOLIO_ITEMS, PROJECTS, type PortfolioCase, type ProjectKey } from '../content/projects'
import { getCaseItems, getCaseSlides, type CaseItem, type CaseSlide } from '../content/caseItems'
import { useLightbox, type LightboxMedia, type LightboxSlide } from '../components/Lightbox'
import { Picture } from '../components/Picture'
import { SectionHead } from '../components/ui'

/**
 * Экран 08 (ТЗ §11): только заголовок и компактная сетка превью 100–130 px; клик — полноэкранная галерея.
 * Превью — папки по типу работы (Монтаж Reels, Stories, Рекламные креативы…). В папке-коллаже слайд —
 * кейс из нескольких работ, под ним проект и ниша (правки Кати 01.11). Папки без материалов не выводятся.
 */
export function Portfolio() {
  const { t, locale } = useI18n()
  const lightbox = useLightbox()

  const works = PORTFOLIO_ITEMS.map((work) => ({ work, items: getCaseItems(work) })).filter(({ items }) => items.length > 0)

  return (
    <section id="portfolio" className="section portfolio" aria-labelledby="portfolio-title">
      <div className="container">
        <SectionHead num="08" title={t.portfolio.title} id="portfolio-title" />
        <ul className="works" data-reveal>
          {works.map(({ work, items }) => {
            const title = work.title[locale]
            const cover = coverOf(work, items)
            return (
              <li key={work.slug}>
                <button type="button" className="work" onClick={() => lightbox({ title, slides: toSlides(getCaseSlides(work), locale, title) })}>
                  <span className="work__img" style={zoomStyle(work)}>
                    <Picture image={cover} alt="" sizes="(min-width: 768px) 124px, 40vw" />
                  </span>
                  <span className="work__title">{title}</span>
                  <span className="work__type">{countLabel(items.length, locale, t.portfolio.count)}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/**
 * Обложка папки — `coverImage` из media-src/covers/, иначе файл `cover` из папки, иначе первая работа: фото или постер
 * ролика. Значка play на обложке нет: папка — как «Актуальное» в Instagram, а значок ложился на выбранные Катей кадры
 * (01.11, UI_Patterns §53).
 */
function coverOf(work: PortfolioCase, items: CaseItem[]) {
  const own = work.coverImage && getImage(work.coverImage)
  if (own) return own
  const path = `portfolio/${work.slug}/${work.cover}`
  const item = items.find((i) => work.cover && i.key === path) ?? items[0]
  return item.kind === 'image' ? item.image : item.video.poster
}

/** Приближение и точка кадра обложки — CSS-переменными: стиль приходит в готовом HTML, наведение множит масштаб, а не затирает. */
function zoomStyle(work: PortfolioCase): CSSProperties | undefined {
  if (!work.coverZoom && !work.coverPosition) return undefined
  return {
    ...(work.coverZoom && { '--cover-zoom': work.coverZoom.scale, '--cover-origin': work.coverZoom.origin }),
    ...(work.coverPosition && { '--cover-position': work.coverPosition }),
  } as CSSProperties
}

/** «23 работы» — форма слова по правилам языка (Intl.PluralRules: one / few / many / other). */
function countLabel(n: number, locale: Locale, forms: Readonly<Record<'one' | 'few' | 'many' | 'other', string>>) {
  const rule = new Intl.PluralRules(locale).select(n) as keyof typeof forms
  return (forms[rule] ?? forms.other).replace('{n}', String(n))
}

/** Проект и ниша одной строкой: «WOW Beauty Lab · Салон краси на Кіпрі» */
function projectLabel(project: ProjectKey, locale: Locale) {
  const { title, about } = PROJECTS[project] as { title: Record<Locale, string>; about?: Record<Locale, string> }
  return [title[locale], about?.[locale]].filter(Boolean).join(' · ')
}

/**
 * Слайды полноэкранной галереи. Один проект на слайде — подпись под всем слайдом; два кейса на одном
 * слайде — подпись под каждой работой. Alt — из meta.json файла, иначе «папка — проект, N».
 */
function toSlides(slides: CaseSlide[], locale: Locale, folder: string): LightboxSlide[] {
  let n = 0
  return slides.map((slide) => {
    const projects = new Set(slide.items.map((item) => item.project))
    const shared = projects.size === 1 ? slide.items[0].project : undefined
    const items = slide.items.map((item): LightboxMedia => {
      n += 1
      const label = item.project && !shared ? projectLabel(item.project, locale) : undefined
      const project = item.project ? projectLabel(item.project, locale) : undefined
      const fallback = `${project ? `${folder} — ${project}` : folder}, ${n}`
      if (item.kind === 'image') return { kind: 'image', image: item.image, alt: pickLocalized(item.image.alt, locale) ?? fallback, label }
      return { kind: 'video', video: item.video, alt: pickLocalized(item.video.alt, locale) ?? fallback, label }
    })
    return { items, caption: shared ? projectLabel(shared, locale) : undefined, note: slide.note?.[locale] }
  })
}
