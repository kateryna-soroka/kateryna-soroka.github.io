import type { Locale } from '../i18n/locales'
import manifest from './media.generated.json'

export type Localized = Partial<Record<Locale, string>>

export interface MediaImage {
  w: number
  h: number
  src: string
  srcset: { avif: string; webp: string; jpg: string }
  lqip: string
  alt?: Localized
  title?: Localized
  kind?: 'real' | 'concept'
}

export interface MediaVideo {
  src: string
  w: number
  h: number
  duration: number
  poster: MediaImage
  alt?: Localized
  title?: Localized
  kind?: 'real' | 'concept'
}

interface Manifest {
  images: Record<string, MediaImage>
  videos: Record<string, MediaVideo>
  dirs: Record<string, string[]>
}

const data = manifest as unknown as Manifest

export type GalleryItem = { kind: 'image'; key: string; image: MediaImage } | { kind: 'video'; key: string; video: MediaVideo }

export function getImage(key: string): MediaImage | undefined {
  return data.images[key]
}

/** Галерея = всё, что лежит в media-src/<dir>, по алфавиту имён файлов (01-…, 02-…). Новые файлы появляются сами. */
export function getGallery(dir: string): GalleryItem[] {
  return (data.dirs[dir] ?? []).map((key) =>
    data.videos[key] ? { kind: 'video' as const, key, video: data.videos[key] } : { kind: 'image' as const, key, image: data.images[key] },
  )
}

export function pickLocalized(value: Localized | undefined, locale: Locale): string | undefined {
  return value?.[locale] ?? value?.ru
}
