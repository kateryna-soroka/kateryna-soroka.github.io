import { describe, expect, it } from 'vitest'
import { collageLayout } from '../../src/components/collage'

const STORY = 1080 / 1920
const SQUARE = 1
const WIDE = 1280 / 720
const PHONE = { w: 358, h: 520 } // iPhone 13 в Safari: 390 − поля, высота без шапки и подписи
const DESKTOP = { w: 1100, h: 620 }

/** ширина каждого ряда и общая высота раскладки — должны влезать в сцену */
function measure(ratios: number[], w: number, h: number, gap = 12, label = 0) {
  const layout = collageLayout(ratios, w, h, gap, label)
  const widths = layout.rows.map((row) => row.reduce((sum, i) => sum + ratios[i] * layout.height, 0) + (row.length - 1) * gap)
  const height = layout.rows.length * (layout.height + label) + (layout.rows.length - 1) * gap
  return { layout, widths, height }
}

describe('раскладка слайда-коллажа', () => {
  it('порядок альбома не меняется: работы идут подряд по рядам', () => {
    const { layout } = measure(Array(5).fill(STORY), PHONE.w, PHONE.h)
    expect(layout.rows.flat()).toEqual([0, 1, 2, 3, 4])
    expect(layout.rows.map((r) => r.length)).toEqual([3, 2]) // лишняя работа — в первый ряд
  })

  it('две сторис на телефоне — рядом, как в образце Кати', () => {
    const { layout } = measure([STORY, STORY], PHONE.w, PHONE.h)
    expect(layout.rows).toEqual([[0, 1]])
    expect(layout.height).toBeGreaterThan(280)
  })

  it('шесть сторис: на компьютере одной лентой, на телефоне 3 + 3', () => {
    expect(measure(Array(6).fill(STORY), DESKTOP.w, DESKTOP.h).layout.rows).toHaveLength(1)
    expect(measure(Array(6).fill(STORY), PHONE.w, PHONE.h).layout.rows.map((r) => r.length)).toEqual([3, 3])
  })

  // сторис психолога: её три коллажа по три, нарезанные по одной — на телефоне та же сетка 3 × 3, что у неё
  it('девять сторис на телефоне — 3 × 3, как её коллажи', () => {
    expect(measure(Array(9).fill(STORY), PHONE.w, PHONE.h).layout.rows.map((r) => r.length)).toEqual([3, 3, 3])
  })

  // статистика WOW (01.11 15:54 «вот это все на один слайд»): четыре скрина экрана, затем две широкие карточки.
  // Ряды делились поровну по числу работ — 2 + 2 + 1 + 1 по 120 px в сцене 358 × 516 (iPhone 13 с подписью
  // в две строки), а в e2e и 119. Теперь ряды делятся по ширине: скрины одной лентой, карточки своими рядами
  it('статистика WOW на телефоне: скрины одной лентой, широкие карточки под ними, работа крупнее 120 px', () => {
    const stats = [694 / 1280, 908 / 1280, 383 / 511, 720 / 1280, 1179 / 487, 1210 / 420]
    const { layout, widths, height } = measure(stats, 358, 512)
    expect(layout.rows.map((r) => r.length)).toEqual([4, 1, 1])
    expect(layout.height).toBeGreaterThanOrEqual(124)
    for (const width of widths) expect(width).toBeLessThanOrEqual(358)
    expect(height).toBeLessThanOrEqual(512)
  })

  it('одинаковые сторис делятся как раньше: лишние — в первые ряды, ряды ровные', () => {
    expect(measure(Array(7).fill(STORY), PHONE.w, PHONE.h).layout.rows.map((r) => r.length)).toEqual([3, 2, 2])
    expect(measure(Array(8).fill(STORY), PHONE.w, PHONE.h).layout.rows.map((r) => r.length)).toEqual([3, 3, 2])
  })

  it('четыре ролика на телефоне — 2 × 2, а не четыре узкие полоски', () => {
    expect(measure(Array(4).fill(STORY), PHONE.w, PHONE.h).layout.rows.map((r) => r.length)).toEqual([2, 2])
  })

  it('широкие картинки на телефоне — друг под другом', () => {
    expect(measure([WIDE, WIDE, WIDE], PHONE.w, PHONE.h).layout.rows).toHaveLength(3)
  })

  it('всё влезает в сцену: любой набор, телефон и компьютер, с подписями и без', () => {
    const sets = [[STORY, STORY], Array(6).fill(STORY), [SQUARE, SQUARE, STORY, STORY], [WIDE, WIDE, WIDE], Array(4).fill(STORY), [STORY, SQUARE]]
    for (const ratios of sets)
      for (const { w, h } of [PHONE, DESKTOP, { w: 288, h: 420 }])
        for (const label of [0, 30]) {
          const { layout, widths, height } = measure(ratios, w, h, 12, label)
          expect(layout.height, `${ratios.length} работ в ${w}×${h}`).toBeGreaterThan(0)
          for (const width of widths) expect(width, `ряд шире сцены ${w}`).toBeLessThanOrEqual(w)
          expect(height, `выше сцены ${h}`).toBeLessThanOrEqual(h)
        }
  })
})
