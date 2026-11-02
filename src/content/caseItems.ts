import { getGallery, type GalleryItem } from './media'
import type { PortfolioCase, ProjectKey, SlideDef } from './projects'

/**
 * Отдельно от projects.ts: тот — чистые данные, их читают и e2e-тесты Playwright,
 * а здесь подтягивается манифест медиа (JSON), который Playwright без import-атрибута не загрузит.
 */
export type CaseItem = GalleryItem & { project?: ProjectKey }

/** Слайд просмотра: одна работа (папка поштучно) или кейс из нескольких (папка-коллаж). */
export interface CaseSlide {
  items: CaseItem[]
  note?: SlideDef['note']
}

/** Слайды папки по порядку. В папке поштучно — сначала подпапки проектов из `projects`, затем файлы без заказчика. */
export function getCaseSlides(work: PortfolioCase): CaseSlide[] {
  if (work.slides) {
    return work.slides.map((slide) => ({
      items: getGallery(`portfolio/${work.slug}/${slide.dir}`).map((item, i) => ({ ...item, project: slide.projects?.[i] ?? slide.project })),
      note: slide.note,
    }))
  }
  return [
    ...(work.projects ?? []).flatMap((project) => getGallery(`portfolio/${work.slug}/${project}`).map((item) => ({ ...item, project }))),
    ...getGallery(`portfolio/${work.slug}`),
  ].map((item) => ({ items: [item] }))
}

/** Все работы папки подряд — для счётчика «24 работы» и обложки. */
export function getCaseItems(work: PortfolioCase): CaseItem[] {
  return getCaseSlides(work).flatMap((slide) => slide.items)
}
