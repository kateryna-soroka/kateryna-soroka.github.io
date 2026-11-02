import type { CSSProperties } from 'react'
import type { MediaImage } from '../content/media'

interface Props {
  image: MediaImage
  alt: string
  sizes: string
  className?: string
  imgClassName?: string
  /** Первый экран: грузить сразу и с высоким приоритетом (LCP) */
  priority?: boolean
  objectPosition?: string
}

/** Адаптивная картинка: AVIF → WebP → JPEG, явные размеры против скачков вёрстки, размытое превью до загрузки. */
export function Picture({ image, alt, sizes, className, imgClassName, priority = false, objectPosition }: Props) {
  const style: CSSProperties = {
    backgroundImage: `url("${image.lqip}")`,
    backgroundSize: 'cover',
    backgroundPosition: objectPosition ?? 'center',
    objectPosition,
  }
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={image.srcset.avif} sizes={sizes} />
      <source type="image/webp" srcSet={image.srcset.webp} sizes={sizes} />
      <img
        src={image.src}
        srcSet={image.srcset.jpg}
        sizes={sizes}
        width={image.w}
        height={image.h}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        className={imgClassName}
        style={style}
      />
    </picture>
  )
}
