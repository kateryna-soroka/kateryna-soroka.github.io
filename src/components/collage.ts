/**
 * Раскладка слайда-коллажа (правка Кати 01.11: «на одном слайде 2–4 фото/видео»): работы идут рядами
 * в порядке её альбома, у всех одна высота — сторис одного сторителлинга читаются как лента.
 * Перебираем число рядов и берём самую крупную раскладку, которая влезает в сцену. Ряд короче
 * соседнего стоит по центру. Почти равные по размеру варианты (в пределах 10 %) — в пользу меньшего
 * числа рядов: в один ряд сторителлинг читается слева направо.
 */
export interface CollageLayout {
  /** номера работ по рядам */
  rows: number[][]
  /** высота каждой работы, px */
  height: number
}

/**
 * @param ratios ширина / высота каждой работы
 * @param width ширина сцены, px
 * @param height высота сцены, px
 * @param gap зазор между работами, px
 * @param labelHeight подпись под каждой работой (слайд из двух кейсов), px
 */
export function collageLayout(ratios: number[], width: number, height: number, gap: number, labelHeight = 0): CollageLayout {
  const n = ratios.length
  const options: (CollageLayout & { area: number })[] = []
  for (let rowCount = 1; rowCount <= n; rowCount++) {
    const rows = splitRows(ratios, rowCount, width, gap)
    const byWidth = widthLimit(rows, ratios, width, gap)
    const byHeight = (height - (rowCount - 1) * gap) / rowCount - labelHeight
    const h = Math.floor(Math.min(byWidth, byHeight))
    if (h <= 0) continue
    options.push({ rows, height: h, area: ratios.reduce((sum, r) => sum + r * h * h, 0) })
  }
  if (options.length === 0) return { rows: [ratios.map((_, i) => i)], height: 0 }
  const best = Math.max(...options.map((o) => o.area))
  const { rows, height: h } = options.find((o) => o.area >= best * 0.9)!
  return { rows, height: h }
}

const EPS = 1e-6

/** высота работ, при которой самый широкий ряд ровно встаёт в ширину сцены */
function widthLimit(rows: number[][], ratios: number[], width: number, gap: number): number {
  return Math.min(...rows.map((row) => (width - (row.length - 1) * gap) / row.reduce((sum, i) => sum + ratios[i], 0)))
}

/**
 * n работ на rowCount рядов подряд — по ширине работ, а не по их числу. Деление поровну по числу ломало
 * статистику WOW (01.11): четыре скрина экрана и две широкие карточки шли 2 + 2 + 1 + 1, работы по 119 px,
 * хотя 4 + 1 + 1 крупнее. Перебираем все разбиения (до 9 работ на слайде — 256 вариантов) и берём то, где
 * работы крупнее; при равенстве — где ряды ровнее, затем где лишние работы в первых рядах. У одинаковых
 * сторис выходит прежнее: 5 на 2 → 3 + 2, 7 на 3 → 3 + 2 + 2.
 */
function splitRows(ratios: number[], rowCount: number, width: number, gap: number): number[][] {
  let best: { rows: number[][]; limit: number; spread: number } | undefined
  for (const sizes of compositions(ratios.length, rowCount)) {
    let next = 0
    const rows = sizes.map((size) => Array.from({ length: size }, () => next++))
    const limit = widthLimit(rows, ratios, width, gap)
    const sums = rows.map((row) => row.reduce((sum, i) => sum + ratios[i], 0))
    const spread = Math.max(...sums) - Math.min(...sums)
    const larger = !best || limit > best.limit + EPS
    const evener = !!best && Math.abs(limit - best.limit) <= EPS && spread < best.spread - EPS
    if (larger || evener) best = { rows, limit, spread }
  }
  return best!.rows
}

/** все способы разложить n работ на k непустых рядов; первый ряд — от самого длинного */
function* compositions(n: number, k: number): Generator<number[]> {
  if (k === 1) {
    yield [n]
    return
  }
  for (let first = n - k + 1; first >= 1; first--) for (const rest of compositions(n - first, k - 1)) yield [first, ...rest]
}
