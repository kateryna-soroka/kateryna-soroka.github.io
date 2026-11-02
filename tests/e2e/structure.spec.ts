import { expect, test } from '@playwright/test'
import { LOCALE_PAGES, RU, SECTION_IDS, collectErrors } from './helpers'
import { PORTFOLIO_ITEMS } from '../../src/content/projects'

test.describe('структура и контент (ТЗ §3–§12)', () => {
  for (const loc of LOCALE_PAGES) {
    test(`${loc.path}: 9 разделов по порядку, без ошибок, без внешних запросов`, async ({ page, baseURL }) => {
      const errors = collectErrors(page)
      const foreign: string[] = []
      page.on('request', (req) => {
        const url = new URL(req.url())
        if (url.protocol.startsWith('http') && url.origin !== new URL(baseURL!).origin) foreign.push(req.url())
      })

      await page.goto(loc.path)
      await expect(page.locator('html')).toHaveAttribute('lang', loc.lang)
      await expect(page.locator('h1')).toContainText(loc.firstName)

      const ids = await page.locator('main > section, main > nav').evaluateAll((els) => els.map((el) => el.id))
      expect(ids).toEqual(SECTION_IDS)

      await expect(page.locator('form, input, textarea, select')).toHaveCount(0)
      await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0)
      await expect(page.locator('video')).toHaveCount(0) // ролики грузятся только по клику

      await page.waitForLoadState('networkidle')
      expect(errors, 'ошибки консоли / гидратации').toEqual([])
      expect(foreign, 'запросы на чужие домены').toEqual([])
    })
  }

  test('сервер отдаёт готовый HTML каждой версии (SEO, без JS)', async ({ request }) => {
    for (const loc of LOCALE_PAGES) {
      const html = await (await request.get(loc.path)).text()
      expect(html).toContain(`<html lang="${loc.lang}"`)
      expect(html).toContain(loc.firstName)
      expect(html).toContain('application/ld+json')
      expect(html).toMatch(/<meta property="og:title" content="[^"]+"/)
      expect(html).toContain('<meta name="twitter:card" content="summary_large_image"')
      // og:image работает только с полным адресом — появляется после SITE_URL (домен)
      if (process.env.SITE_URL) expect(html).toContain(`content="${process.env.SITE_URL}/og-image.jpg"`)
      // без домена это предпросмотр — временная ссылка не должна попасть в индекс
      else expect(html).toContain('<meta name="robots" content="noindex, nofollow" />')
      expect(html).toContain('"areaServed"')
      expect(html).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png" />')
      // GitHub Pages заголовков не отдаёт — политика безопасности должна стоять в самой странице
      expect(html).toMatch(/<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'sha256-[^']+'/)
    }
  })

  test('404.html: та же страница, закрыта от индекса, без canonical и hreflang', async ({ request, page }) => {
    const html = await (await request.get('/404.html')).text()
    expect(html).toContain('<html lang="uk"')
    expect(html).toContain('<meta name="robots" content="noindex" />')
    expect(html.match(/<meta name="robots"/g)).toHaveLength(1)
    expect(html).not.toContain('rel="canonical"')
    expect(html).not.toContain('hreflang')
    const errors = collectErrors(page)
    await page.goto('/404.html')
    await expect(page.locator('h1')).toContainText('Сорока')
    expect(errors).toEqual([])
  })

  test('RU: дословные тексты Hero и шапки', async ({ page }) => {
    await page.goto(RU)
    await expect(page.locator('.site-header__brand')).toHaveText(/портфолио/i)
    await expect(page.locator('.lang__btn')).toHaveText(['UA', 'RU', 'EN'])
    await expect(page.locator('h1')).toContainText('Екатерина')
    await expect(page.locator('h1')).toContainText('Сорока')
    await expect(page.locator('.hero__pill')).toHaveText('SMM / Контент-креатор / Видеомонтаж')
    await expect(page.locator('.hero__captions')).toContainText('Создаю визуальный характер брендов')
    await expect(page.locator('.hero__captions')).toContainText('От стратегии')
    await expect(page.locator('.hero__captions')).toContainText('до готового контента')
    await expect(page.locator('#about p')).toHaveCount(3)
  })

  test('навигация: ровно 6 панелей с номерами 04–09, ведут на свои разделы', async ({ page }) => {
    await page.goto(RU)
    const panels = page.locator('.nav-panel')
    await expect(panels).toHaveCount(6)
    await expect(page.locator('.nav-panel__num')).toHaveText(['04', '05', '06', '07', '08', '09'])
    const hrefs = await panels.evaluateAll((els) => els.map((el) => el.getAttribute('href')))
    expect(hrefs).toEqual(['#smm', '#shooting', '#editing', '#branding', '#portfolio', '#contacts'])
  })

  test('портфолио: только заголовок и сетка работ, без лишних подписей', async ({ page }) => {
    await page.goto(RU)
    const section = page.locator('#portfolio')
    await expect(section.locator('h2')).toHaveText('Портфолио')
    await expect(section.locator('p')).toHaveCount(0)
    // счёт сверяется с источником: каждый кейс из projects.ts на странице, ни одного потерянного
    await expect(section.locator('.work')).toHaveCount(PORTFOLIO_ITEMS.length)
  })

  test('контакты: два способа связи; ссылка — либо рабочая в новой вкладке, либо понятная заглушка', async ({ page }) => {
    await page.goto(RU)
    const list = page.locator('.contacts__list')
    await expect(list).toContainText('Telegram')
    await expect(list).toContainText('WhatsApp')
    await expect(list.locator('.contact-btn')).toHaveCount(2)
    for (const link of await list.locator('a.contact-btn').all()) {
      await expect(link).toHaveAttribute('href', /^https:\/\/(t\.me|wa\.me)\//)
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', /noopener/)
    }
    for (const pending of await list.locator('.contact-btn--pending').all()) {
      await expect(pending).toContainText('Ссылка будет добавлена')
    }
  })

  test('контакты Кати (01.11): обе ссылки живые на всех языках, заглушек нет', async ({ page }) => {
    for (const path of ['/', RU, '/en/']) {
      await page.goto(path)
      const list = page.locator('.contacts__list')
      await expect(list.locator('.contact-btn--pending')).toHaveCount(0)
      await expect(list.locator('a.contact-btn')).toHaveCount(2)
      await expect(list.locator('a.contact-btn').nth(0)).toHaveAttribute('href', 'https://t.me/ekaterynaekateryna')
      await expect(list.locator('a.contact-btn').nth(1)).toHaveAttribute('href', 'https://wa.me/380664925296')
    }
  })

  test('все кнопки-призывы ведут в контакты', async ({ page }) => {
    await page.goto(RU)
    const ctas = page.locator('.btn-cta')
    expect(await ctas.count()).toBe(4) // SMM, съёмка, монтаж, брендинг
    for (const cta of await ctas.all()) await expect(cta).toHaveAttribute('href', '#contacts')
    await expect(ctas).toHaveText([/Обсудить проект/, /Обсудить съёмку/, /Заказать монтаж/, /Обсудить проект/])
  })
})
