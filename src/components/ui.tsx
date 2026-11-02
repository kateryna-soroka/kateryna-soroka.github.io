import type { PointerEvent, ReactNode } from 'react'
import { ArrowUpRight } from './icons'

/** Номер раздела + заголовок, как в утверждённых макетах («02 / Обо мне»). */
export function SectionHead({ num, title, id, className = '' }: { num: string; title: string; id: string; className?: string }) {
  return (
    <div className={`section-head ${className}`} data-reveal>
      <span className="eyebrow" aria-hidden="true">
        {num}
      </span>
      <h2 id={id} className="h-section">
        {title}
      </h2>
    </div>
  )
}

/** Тёмная кнопка-призыв из ТЗ (градиент CTA). Все призывы ведут к контактам. */
export function Cta({ children, href = '#contacts' }: { children: ReactNode; href?: string }) {
  return (
    <a className="btn-cta" href={href} onPointerMove={trackPointer}>
      <span>{children}</span>
      <span className="btn-cta__icon" aria-hidden="true">
        <ArrowUpRight width={18} height={18} />
      </span>
    </a>
  )
}

/** «Подсветка» под курсором: координаты в CSS-переменные, рисует сам CSS. */
export function trackPointer(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}
