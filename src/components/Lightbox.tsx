import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { useI18n } from '../i18n/I18nProvider'
import type { MediaImage, MediaVideo } from '../content/media'
import { Picture } from './Picture'
import { collageLayout } from './collage'
import { ChevronLeft, ChevronRight, Close, Play } from './icons'

/** Работа на слайде; `label` — её проект, когда на одном слайде два кейса */
export type LightboxMedia = ({ kind: 'image'; image: MediaImage } | { kind: 'video'; video: MediaVideo }) & { alt: string; label?: string }

/** Слайд: одна работа или кейс-коллаж. `caption` — проект и ниша под работами, `note` — строка под ней */
export interface LightboxSlide {
  items: LightboxMedia[]
  caption?: string
  note?: string
}

export interface LightboxOpenArgs {
  title: string
  slides: LightboxSlide[]
  index?: number
}

/** `focus` — какая работа коллажа открыта крупно; null — виден весь слайд. `returnTo` — на какую работу вернуть фокус */
type State = LightboxOpenArgs & { index: number; focus: number | null; returnTo: number | null }

const LightboxContext = createContext<(args: LightboxOpenArgs) => void>(() => {})

export function useLightbox() {
  return useContext(LightboxContext)
}

const GAP = 12
const LABEL_H = 30

/**
 * Полноэкранный просмотр (ТЗ §14): нативный <dialog> в модальном режиме — фон недоступен,
 * фокус заперт внутри, Esc закрывает. Сверху: стрелки ← →, свайп, клик по затемнению,
 * блокировка прокрутки и возврат фокуса на миниатюру, с которой открыли.
 * Слайд-коллаж: нажатие на работу открывает её крупно; Esc, «назад» и клик по полю возвращают к слайду,
 * стрелки листают работы кейса, с крайней — на соседний слайд.
 */
export function LightboxProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const swipedAt = useRef(0)
  const [state, setState] = useState<State | null>(null)
  // крупный вид для обработчиков <dialog> (Esc, клик по полю): они подписаны один раз
  const focusRef = useRef<number | null>(null)

  const open = useCallback((args: LightboxOpenArgs) => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setState({ ...args, index: args.index ?? 0, focus: null, returnTo: null })
  }, [])

  const go = useCallback((delta: number) => {
    setState((s) => {
      if (!s) return s
      const count = s.slides[s.index].items.length
      if (s.focus !== null && s.focus + delta >= 0 && s.focus + delta < count) return { ...s, focus: s.focus + delta, returnTo: s.focus + delta }
      if (s.slides.length < 2) return s.focus === null ? s : { ...s, focus: null }
      return { ...s, index: (s.index + delta + s.slides.length) % s.slides.length, focus: null, returnTo: null }
    })
  }, [])

  const zoom = useCallback((item: number | null) => {
    if (item !== null && performance.now() - swipedAt.current < 400) return // свайп закончился на работе — это не нажатие
    setState((s) => (s ? { ...s, focus: item, returnTo: item ?? s.returnTo } : s))
  }, [])

  const close = useCallback(() => dialogRef.current?.close(), [])

  const isOpen = state !== null
  useEffect(() => {
    const dialog = dialogRef.current
    if (!isOpen || !dialog || dialog.open) return
    dialog.showModal()
    document.documentElement.classList.add('is-locked')
    closeRef.current?.focus()
  }, [isOpen])

  // крупно — фокус на «назад»; обратно на работу фокус ставит сам коллаж, когда она отрисована
  const focus = state?.focus ?? null
  useEffect(() => {
    focusRef.current = focus
    if (focus !== null) backRef.current?.focus()
    // кнопка «назад» исчезла вместе с фокусом (ушли на соседний слайд) — фокус на «закрыть», не в никуда
    else if (isOpen && !dialogRef.current?.contains(document.activeElement)) closeRef.current?.focus()
  }, [focus, isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onClose = () => {
      document.documentElement.classList.remove('is-locked')
      setState(null)
      opener.current?.focus({ preventScroll: true })
    }
    // Esc из крупного вида — назад к слайду, а не закрыть просмотр
    const onCancel = (e: Event) => {
      if (focusRef.current === null) return
      e.preventDefault()
      setState((s) => (s ? { ...s, focus: null } : s))
    }
    // Клик по затемнённому полю вокруг кадра — закрыть (из крупного вида — к слайду). Перетаскивание мышью тоже
    // заканчивается кликом по полю, поэтому после свайпа клик пропускаем.
    const onClick = (e: MouseEvent) => {
      if (performance.now() - swipedAt.current < 400) return
      if (e.target !== dialog && (e.target as HTMLElement).dataset.backdrop === undefined) return
      if (focusRef.current !== null) setState((s) => (s ? { ...s, focus: null } : s))
      else close()
    }
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'VIDEO') return // стрелки внутри видео перематывают его
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    dialog.addEventListener('close', onClose)
    dialog.addEventListener('cancel', onCancel)
    dialog.addEventListener('click', onClick)
    dialog.addEventListener('keydown', onKey)
    return () => {
      dialog.removeEventListener('close', onClose)
      dialog.removeEventListener('cancel', onCancel)
      dialog.removeEventListener('click', onClick)
      dialog.removeEventListener('keydown', onKey)
    }
  }, [close, go])

  const onPointerDown = (e: PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e: PointerEvent) => {
    const start = swipe.current
    swipe.current = null
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) swipedAt.current = performance.now()
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1)
  }

  const slide = state?.slides[state.index]
  const total = state?.slides.length ?? 0
  const single = slide && (slide.items.length === 1 || state.focus !== null) ? slide.items[state.focus ?? 0] : undefined
  // подпись: проект слайда; у слайда из двух кейсов в крупном виде — проект открытой работы
  const caption = slide?.caption ?? (slide && single && slide.items.length > 1 ? single.label : undefined)

  return (
    <LightboxContext.Provider value={open}>
      {children}
      <dialog ref={dialogRef} className="lightbox" aria-labelledby="lightbox-title">
        {state && slide && (
          <>
            <div className="lightbox__bar">
              {state.focus !== null && (
                <button ref={backRef} type="button" className="lightbox__btn lightbox__back" onClick={() => zoom(null)} aria-label={t.lightbox.back}>
                  <ChevronLeft width={22} height={22} />
                </button>
              )}
              <p id="lightbox-title" className="lightbox__title">
                {state.title}
              </p>
              <p className="lightbox__counter" aria-live="polite">
                {t.lightbox.counter.replace('{i}', String(state.index + 1)).replace('{n}', String(total))}
              </p>
              <button ref={closeRef} type="button" className="lightbox__btn lightbox__close" onClick={close} aria-label={t.lightbox.close}>
                <Close width={22} height={22} />
              </button>
            </div>
            {/* onDragStart: без него браузер тащит картинку как файл, шлёт pointercancel — и свайп мышью не листает */}
            <div
              className="lightbox__stage"
              data-backdrop=""
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onDragStart={(e) => e.preventDefault()}
            >
              {single ? (
                <Single item={single} />
              ) : (
                <Collage key={state.index} items={slide.items} onOpen={zoom} openLabel={t.lightbox.open} restoreFocus={state.returnTo} />
              )}
            </div>
            <div className="lightbox__foot">
              {(caption || slide.note) && (
                <div className="lightbox__caption">
                  {caption && <p className="lightbox__badge">{caption}</p>}
                  {slide.note && <p className="lightbox__note">{slide.note}</p>}
                </div>
              )}
              {state.focus !== null && slide.items.length > 1 && (
                <p className="lightbox__dots" aria-hidden="true">
                  {slide.items.map((_, i) => (
                    <span key={i} className={i === state.focus ? 'is-current' : undefined} />
                  ))}
                </p>
              )}
              {(total > 1 || slide.items.length > 1) && (
                <>
                  <button type="button" className="lightbox__btn lightbox__nav lightbox__nav--prev" onClick={() => go(-1)} aria-label={t.lightbox.prev}>
                    <ChevronLeft width={24} height={24} />
                  </button>
                  <button type="button" className="lightbox__btn lightbox__nav lightbox__nav--next" onClick={() => go(1)} aria-label={t.lightbox.next}>
                    <ChevronRight width={24} height={24} />
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </dialog>
    </LightboxContext.Provider>
  )
}

function Single({ item }: { item: LightboxMedia }) {
  if (item.kind === 'image') {
    return <Picture image={item.image} alt={item.alt} sizes="100vw" priority className="lightbox__picture" imgClassName="lightbox__img" />
  }
  // Ролик грузится только когда его открыли; звук выключен, включает сам зритель
  return (
    <video
      key={item.video.src}
      className="lightbox__video"
      src={item.video.src}
      poster={item.video.poster.src}
      width={item.video.w}
      height={item.video.h}
      controls
      autoPlay
      muted
      playsInline
      preload="metadata"
      aria-label={item.alt}
    />
  )
}

/** Коллаж: размеры считаются от сцены (ResizeObserver) до отрисовки, чтобы работы не прыгали. */
function Collage({
  items,
  onOpen,
  openLabel,
  restoreFocus,
}: {
  items: LightboxMedia[]
  onOpen: (i: number) => void
  openLabel: string
  restoreFocus: number | null
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)

  const ratios = items.map((item) => (item.kind === 'image' ? item.image.w / item.image.h : item.video.w / item.video.h))
  const labelled = items.some((item) => item.label)
  const layout = size ? collageLayout(ratios, size.w, size.h, GAP, labelled ? LABEL_H : 0) : null
  // первый замер приходит, пока у сцены нулевой размер: плитки с sizes="0px" тянули самый мелкий файл, через 12 мс —
  // нужный, а мелкий браузер отменял (net::ERR_ABORTED) или качал зря. Плитки — только при известной высоте
  const ready = layout !== null && layout.height > 0

  // вернулись из крупного вида — фокус на ту работу, которую открывали
  useEffect(() => {
    if (ready && restoreFocus !== null) ref.current?.querySelector<HTMLElement>(`[data-tile="${restoreFocus}"]`)?.focus()
  }, [ready, restoreFocus])

  useLayoutEffect(() => {
    const stage = ref.current?.parentElement
    if (!stage) return
    const measure = () => {
      const cs = getComputedStyle(stage)
      const w = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      const h = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      setSize((prev) => (prev && prev.w === w && prev.h === h ? prev : { w, h }))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="lightbox__collage" data-backdrop="" style={{ visibility: ready ? undefined : 'hidden' }}>
      {ready &&
        layout.rows.map((row, r) => (
        <div key={r} className="lightbox__row" data-backdrop="">
          {row.map((i) => {
            const item = items[i]
            const w = Math.floor(ratios[i] * layout.height)
            const image = item.kind === 'image' ? item.image : item.video.poster
            return (
              <figure key={i} className="lightbox__cell" style={{ width: w }}>
                <button
                  type="button"
                  className="lightbox__tile"
                  data-tile={i}
                  style={{ width: w, height: layout.height }}
                  onClick={() => onOpen(i)}
                  aria-label={`${openLabel}: ${item.alt}`}
                >
                  <Picture image={image} alt="" sizes={`${w}px`} priority className="lightbox__tile-picture" />
                  {item.kind === 'video' && (
                    <span className="lightbox__play" aria-hidden="true">
                      <Play width={16} height={16} />
                    </span>
                  )}
                </button>
                {item.label && <figcaption className="lightbox__label">{item.label}</figcaption>}
              </figure>
            )
          })}
        </div>
      ))}
    </div>
  )
}
