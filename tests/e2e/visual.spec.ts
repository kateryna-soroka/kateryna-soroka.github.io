import { test } from '@playwright/test'
import { LOCALE_PAGES } from './helpers'

/**
 * Снимки всей страницы для глазной проверки против макетов — не сравнение с эталоном
 * (эталона ещё нет: работы Кати не вшиты). Складываются в screens/<устройство>-<язык>.png.
 */
test.describe('снимки для ревью', () => {
  // Плотность 1: Chrome не снимает картинку выше 16 384 точек и повторяет верх страницы
  test.use({ reducedMotion: 'reduce', deviceScaleFactor: 1 })

  for (const loc of LOCALE_PAGES) {
    test(`снимок ${loc.lang}`, async ({ page }, info) => {
      await page.goto(loc.path)
      await page.waitForLoadState('networkidle')
      await page.evaluate(() => document.fonts.ready)
      await page.screenshot({ path: `screens/${info.project.name}-${loc.lang}-fold.png` })
      await page.screenshot({ path: `screens/${info.project.name}-${loc.lang}.png`, fullPage: true })
    })
  }
})
