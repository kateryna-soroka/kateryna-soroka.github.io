import type { Page } from '@playwright/test'

export const SECTION_IDS = ['top', 'about', 'navigation', 'smm', 'shooting', 'editing', 'branding', 'portfolio', 'contacts']

/** Русская версия: тексты ТЗ утверждены на русском, проверки дословного текста идут по ней. */
export const RU = '/ru/'

/** Порядок и адреса — как на сайте: украинская версия в корне (ответ Кати 31.10), русская в /ru/. */
export const LOCALE_PAGES = [
  { path: '/', lang: 'uk', firstName: 'Катерина', counter: (i: number, n: number) => `${i} з ${n}` },
  { path: '/ru/', lang: 'ru', firstName: 'Екатерина', counter: (i: number, n: number) => `${i} из ${n}` },
  { path: '/en/', lang: 'en', firstName: 'Kateryna', counter: (i: number, n: number) => `${i} of ${n}` },
] as const

/** Прокрутить страницу до конца шагами, чтобы сработали все появления блоков, и вернуться наверх. */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6)
    // Ждём два кадра на каждой позиции, а не 40 мс: при нагрузке (4 потока тестов) кадр
    // мог не отрисоваться между прокрутками, наблюдатель пропускал позицию, блок оставался скрытым
    const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await frame()
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  await page.waitForTimeout(800)
}

/** Дождаться конца всех конечных анимаций и переходов: проверка контраста посреди проявления врёт. */
export async function settleAnimations(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  )
}

/** Ошибки консоли и сбои загрузки — собираем с первой секунды. */
export function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(err.message))
  page.on('requestfailed', (req) => errors.push(`request failed: ${req.url()}`))
  return errors
}
