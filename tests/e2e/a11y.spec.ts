import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { LOCALE_PAGES, scrollThrough, settleAnimations } from './helpers'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

async function seriousViolations(page: Page, include?: string) {
  let builder = new AxeBuilder({ page }).withTags(TAGS)
  if (include) builder = builder.include(include)
  const { violations } = await builder.analyze()
  return violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 4).join(' | ')}`)
}

test.describe('доступность (axe, WCAG 2.2 AA)', () => {
  for (const loc of LOCALE_PAGES) {
    test(`${loc.path}: нет серьёзных нарушений`, async ({ page }) => {
      // Обычно 7–17 с, но под нагрузкой (4 потока + Катя смотрит сайт по туннелю с того же сервера)
      // прогон 01.11 дошёл до 46 с и упал по времени при нуле нарушений; отдельно — 6,7 с
      test.slow()
      await page.goto(loc.path)
      await scrollThrough(page)
      await settleAnimations(page)
      expect(await seriousViolations(page)).toEqual([])
    })
  }

  test('открытый SMM Complete и открытый просмотр — без нарушений', async ({ page }) => {
    // Два прогона axe, каждый поднимает служебную вкладку: при 4 потоках её запуск доходил
    // до 8 с, и тест упирался в 30 с на последнем шаге при чистой странице (прогон 30.10)
    test.slow()
    await page.goto('/')
    await scrollThrough(page)
    await page.locator('#pkg-complete-label').click()
    await settleAnimations(page)
    expect(await seriousViolations(page, '#smm')).toEqual([])

    const tile = page.locator('#portfolio .work').first()
    await tile.scrollIntoViewIfNeeded()
    await tile.click()
    await expect(page.locator('dialog.lightbox')).toHaveAttribute('open', '')
    await settleAnimations(page)
    expect(await seriousViolations(page, 'dialog.lightbox'), 'слайд-коллаж').toEqual([])

    await page.locator('dialog[open] .lightbox__tile').first().click()
    await expect(page.locator('.lightbox__back')).toBeVisible()
    await settleAnimations(page)
    expect(await seriousViolations(page, 'dialog.lightbox'), 'работа крупно').toEqual([])
  })
})
