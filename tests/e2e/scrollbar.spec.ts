import { expect, test } from '@playwright/test'
import sharp from 'sharp'
import { RU } from './helpers'

// Playwright по умолчанию прячет полосы прокрутки (--hide-scrollbars), и места под них нет —
// без возврата полосы тесты этого файла молча проходили бы мимо дефекта. Отдельный файл:
// параметры запуска браузера нельзя менять внутри группы тестов.
test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } })

test.describe('с обычной полосой прокрутки, как в Chrome на Windows', () => {
  // Аудит 01.11, вторая волна: у правого края открытого просмотра светилась полоса 15 px —
  // место под полосу прокрутки (scrollbar-gutter: stable) с белым фоном страницы
  test('место под полосу прокрутки при открытом просмотре тёмное, как сам просмотр', async ({ page }, info) => {
    test.skip(info.project.name === 'mobile', 'на телефоне полоса прокрутки поверх страницы, места под неё нет')
    await page.goto(RU)
    const gutter = await page.evaluate(() => innerWidth - document.documentElement.clientWidth)
    expect(gutter, 'место под полосу прокрутки, px').toBeGreaterThan(0)

    const work = page.locator('#portfolio .work').first()
    await work.scrollIntoViewIfNeeded()
    await work.click()
    await expect(page.locator('dialog.lightbox')).toHaveAttribute('open', '')
    await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))))

    const { width, height } = page.viewportSize()!
    const pixel = async (x: number) => {
      const png = await page.screenshot({ clip: { x, y: height - 30, width: 1, height: 1 } })
      const { data } = await sharp(png).raw().toBuffer({ resolveWithObject: true })
      return [...data.subarray(0, 3)]
    }
    const inGutter = await pixel(width - Math.ceil(gutter / 2))
    const inViewer = await pixel(width - gutter - 20)
    const diff = Math.max(...inGutter.map((c, i) => Math.abs(c - inViewer[i])))
    expect(diff, `полоса ${inGutter}, просмотр ${inViewer}`).toBeLessThanOrEqual(6)
  })
})
