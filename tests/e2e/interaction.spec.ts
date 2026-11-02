import { expect, test } from '@playwright/test'
import { RU } from './helpers'

const pathname = (url: string) => new URL(url).pathname

test.describe('язык (ТЗ §13; ответ Кати 31.10: первым открывается украинский)', () => {
  test('первый заход — украинская версия, переключатель в порядке UA / RU / EN', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk')
    await expect(page.locator('h1')).toContainText('Катерина')
    await expect(page.locator('.lang__btn')).toHaveText(['UA', 'RU', 'EN'])
    await expect(page.locator('.lang__btn', { hasText: 'UA' })).toHaveAttribute('aria-pressed', 'true')
  })

  test('переключение без перезагрузки, адрес и lang меняются, выбор запоминается', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => ((window as unknown as { marker: number }).marker = 42))

    await page.locator('.lang__btn', { hasText: 'RU' }).click()
    await expect.poll(() => pathname(page.url())).toBe('/ru/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru')
    await expect(page.locator('h1')).toContainText('Екатерина')
    await expect(page.locator('#about h2')).toHaveText('Обо мне')
    await expect(page.locator('.lang__btn', { hasText: 'RU' })).toHaveAttribute('aria-pressed', 'true')
    await expect(page).toHaveTitle(/Екатерина Сорока/)
    expect(await page.evaluate(() => (window as unknown as { marker?: number }).marker), 'страница не перезагружалась').toBe(42)

    await page.locator('.lang__btn', { hasText: 'EN' }).click()
    await expect.poll(() => pathname(page.url())).toBe('/en/')
    await expect(page.locator('h1')).toContainText('Kateryna')

    // Вернулся на корень — попал на последний выбранный язык
    await page.goto('/')
    await expect.poll(() => pathname(page.url())).toBe('/en/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')

    await page.locator('.lang__btn', { hasText: 'RU' }).click()
    await page.goto('/')
    await expect.poll(() => pathname(page.url())).toBe('/ru/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'ru')

    // Выбрал украинский — корень больше никуда не уводит
    await page.locator('.lang__btn', { hasText: 'UA' }).click()
    await expect.poll(() => pathname(page.url())).toBe('/')
    await page.goto('/')
    await expect.poll(() => pathname(page.url())).toBe('/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'uk')
  })
})

test.describe('навигация по разделам', () => {
  test('панель «Видеомонтаж» приводит к разделу, заголовок не уходит под шапку', async ({ page }) => {
    await page.goto('/')
    await page.locator('.nav-panel[href="#editing"]').click()
    await expect(page).toHaveURL(/#editing$/)
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const header = document.querySelector('.site-header')!.getBoundingClientRect()
          const title = document.getElementById('editing-title')!.getBoundingClientRect()
          return title.top >= header.bottom - 1 && title.top < window.innerHeight / 2
        }),
      )
      .toBe(true)
  })

  test('ссылка «пропустить к содержанию» первая по Tab', async ({ page, isMobile }) => {
    test.skip(isMobile, 'на телефоне нет клавиатуры')
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skip = page.locator('.skip-link')
    await expect(skip).toBeFocused()
    await expect(skip).toBeVisible()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#main$/)
  })
})

test.describe('SMM-пакеты (ТЗ §7)', () => {
  test('при входе оба пакета закрыты и видны на одном экране (Катя 01.11: «Complete теряется»)', async ({ page }) => {
    await page.goto('/')
    const base = page.locator('#pkg-base-label')
    const complete = page.locator('#pkg-complete-label')
    await expect(base).toHaveAttribute('aria-expanded', 'false')
    await expect(complete).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('#pkg-base')).toHaveAttribute('inert', '')
    await expect(page.locator('#pkg-complete')).toHaveAttribute('inert', '')
    const span = await page.evaluate(() => {
      const a = document.getElementById('pkg-base-label')!.getBoundingClientRect()
      const b = document.getElementById('pkg-complete-label')!.getBoundingClientRect()
      return b.bottom - a.top
    })
    expect(span, 'от верха Base до низа Complete').toBeLessThan(page.viewportSize()!.height * 0.6)
  })

  test('открыт один пакет; переключение меняет aria-expanded и inert', async ({ page }) => {
    await page.goto('/')
    const base = page.locator('#pkg-base-label')
    const complete = page.locator('#pkg-complete-label')
    await base.scrollIntoViewIfNeeded()
    await base.click()
    await expect(base).toHaveAttribute('aria-expanded', 'true')
    await expect(complete).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('#pkg-complete')).toHaveAttribute('inert', '')
    await expect(page.locator('#pkg-base .pkg__row')).toHaveCount(21)

    await complete.scrollIntoViewIfNeeded()
    await complete.click()
    await expect(complete).toHaveAttribute('aria-expanded', 'true')
    await expect(base).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('#pkg-base')).toHaveAttribute('inert', '')
    await expect(page.locator('#pkg-complete')).not.toHaveAttribute('inert', '')
    await expect(page.locator('#pkg-complete .pkg__row').first()).toBeVisible()

    // Повторный клик сворачивает
    await complete.click()
    await expect(complete).toHaveAttribute('aria-expanded', 'false')
  })

  test('в Complete нет отметок «нет», в Base стратегия — «нет»', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#pkg-complete .pkg__row--no')).toHaveCount(0)
    await expect(page.locator('#pkg-base .pkg__row--no')).toHaveCount(3)
    await expect(page.locator('#pkg-base .pkg__row--extra')).toHaveCount(7)
  })
})

// Правки Кати 01.11 днём: папка = слайды-кейсы, на слайде 2–6 работ коллажем, подпись проекта под работами
test.describe('просмотр работ (ТЗ §14)', () => {
  type Page = import('@playwright/test').Page
  const openCase = async (page: Page, name = 'Stories') => {
    const first = page.locator('#portfolio .work').filter({ has: page.locator('.work__title', { hasText: new RegExp(`^${name}$`) }) })
    await first.scrollIntoViewIfNeeded()
    const title = (await first.locator('.work__title').textContent())!.trim()
    await first.click()
    const counter = (await page.locator('.lightbox__counter').textContent())!
    const total = Number(/из (\d+)/.exec(counter)?.[1])
    return { first, title, total }
  }
  const tiles = (page: Page) => page.locator('dialog[open] .lightbox__tile')
  const counter = (page: Page) => page.locator('.lightbox__counter')

  test('подпись проекта под слайдом, у слайда из двух кейсов — под каждой работой; у WOW строка про съёмку', async ({ page }) => {
    await page.goto(RU)
    const { total } = await openCase(page, 'Монтаж Reels')
    const badge = page.locator('dialog[open] .lightbox__badge')
    const next = page.locator('.lightbox__nav--next')
    await expect(badge).toHaveText('Sculpcher · Салон красоты')
    await next.click()
    await next.click()
    await expect(counter(page)).toHaveText(`3 из ${total}`)
    await expect(badge).toHaveText('WOW Beauty Lab · Салон красоты на Кипре')
    await expect(page.locator('dialog[open] .lightbox__note')).toHaveText('Съёмка и монтаж — мои')
    await expect(tiles(page)).toHaveCount(4)
    await next.click()
    await next.click()
    // «1 видео — кейс нумеролог, 2 видео — кейс backstage»
    await expect(badge).toHaveCount(0)
    await expect(page.locator('dialog[open] .lightbox__label')).toHaveText(['Нумеролог', 'Backstage'])
    await page.keyboard.press('Escape')

    await openCase(page, 'Рекламные креативы')
    await page.locator('.lightbox__nav--prev').click() // с первого слайда — на последний
    await expect(badge).toHaveText('Инвестор')
  })

  test('кейс портфолио: фокус, название, счётчик, стрелки, Esc, возврат фокуса, блок прокрутки', async ({ page }) => {
    await page.goto(RU)
    const { first, title, total } = await openCase(page)
    expect(total, 'в папке есть что листать').toBeGreaterThan(1)

    const dialog = page.locator('dialog.lightbox')
    await expect(dialog).toHaveAttribute('open', '')
    await expect(page.locator('.lightbox__close')).toBeFocused()
    await expect(page.locator('html')).toHaveClass(/is-locked/)
    await expect(counter(page)).toHaveText(`1 из ${total}`)
    await expect(page.locator('#lightbox-title')).toHaveText(title)

    await page.keyboard.press('ArrowRight')
    await expect(counter(page)).toHaveText(`2 из ${total}`)
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await expect(counter(page)).toHaveText(`${total} из ${total}`)
    await page.locator('.lightbox__nav--next').click()
    await expect(counter(page)).toHaveText(`1 из ${total}`)

    await page.keyboard.press('Escape')
    await expect(dialog).not.toHaveAttribute('open', '')
    await expect(page.locator('html')).not.toHaveClass(/is-locked/)
    await expect(first).toBeFocused()
  })

  test('коллаж: работа открывается крупно, стрелки идут по работам кейса, Esc и «назад» возвращают к слайду', async ({ page }) => {
    await page.goto(RU)
    const { total } = await openCase(page) // слайд 1 — InOut: фото, ролик, фото
    const dialog = page.locator('dialog.lightbox')
    const back = page.locator('.lightbox__back')
    await expect(tiles(page)).toHaveCount(3)
    await expect(page.locator('dialog[open] .lightbox__tile .lightbox__play')).toHaveCount(1)

    await tiles(page).nth(1).click()
    await expect(tiles(page)).toHaveCount(0)
    await expect(page.locator('dialog[open] .lightbox__video')).toHaveCount(1)
    await expect(back).toBeFocused()
    await expect(page.locator('.lightbox__dots span')).toHaveCount(3)
    await expect(page.locator('.lightbox__dots span').nth(1)).toHaveClass('is-current')
    await expect(counter(page), 'счётчик считает слайды, а не работы').toHaveText(`1 из ${total}`)

    await page.locator('.lightbox__nav--next').click()
    await expect(page.locator('dialog[open] .lightbox__img')).toHaveCount(1)
    await expect(counter(page)).toHaveText(`1 из ${total}`)

    await page.keyboard.press('Escape')
    await expect(dialog, 'Esc из крупного вида не закрывает просмотр').toHaveAttribute('open', '')
    await expect(tiles(page)).toHaveCount(3)
    await expect(tiles(page).nth(2), 'фокус вернулся на открытую работу').toBeFocused()

    // с последней работы кейса стрелка ведёт на следующий слайд; кнопка «назад» уходит — фокус на «закрыть»
    await tiles(page).nth(2).click()
    await expect(back).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(counter(page)).toHaveText(`2 из ${total}`)
    await expect(back).toHaveCount(0)
    await expect(tiles(page), 'слайд 2 — психолог: её три коллажа нарезаны на девять сторис').toHaveCount(9)
    await expect(page.locator('.lightbox__close')).toBeFocused()

    await tiles(page).first().click()
    await back.click()
    await expect(tiles(page).first()).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(dialog).not.toHaveAttribute('open', '')
  })

  test('свайп листает и не закрывает просмотр; клик по полю закрывает', async ({ page }) => {
    await page.goto(RU)
    const { total } = await openCase(page)
    await expect(counter(page)).toHaveText(`1 из ${total}`)

    const stage = await page.locator('.lightbox__stage').boundingBox()
    const y = stage!.y + stage!.height * 0.5
    await page.mouse.move(stage!.x + stage!.width * 0.8, y)
    await page.mouse.down()
    await page.mouse.move(stage!.x + stage!.width * 0.3, y, { steps: 6 })
    await page.mouse.up()
    await expect(counter(page)).toHaveText(`2 из ${total}`)
    await expect(page.locator('dialog.lightbox')).toHaveAttribute('open', '')
    await expect(page.locator('.lightbox__back'), 'свайп по работе не открыл её крупно').toHaveCount(0)

    await page.waitForTimeout(450)
    await page.mouse.click(stage!.x + 8, y)
    await expect(page.locator('dialog.lightbox')).not.toHaveAttribute('open', '')
  })

  test('ролик крупно: без звука до выбора зрителя, с элементами управления', async ({ page }) => {
    await page.goto(RU)
    await openCase(page, 'Монтаж Reels')
    await expect(page.locator('dialog[open] video'), 'в коллаже ролики — постерами, не грузятся').toHaveCount(0)
    await tiles(page).first().click()
    const video = page.locator('dialog.lightbox video')
    await expect(video).toHaveCount(1)
    expect(await video.evaluate((v: HTMLVideoElement) => ({ muted: v.muted, controls: v.controls }))).toEqual({ muted: true, controls: true })
  })

  // Аудит 01.11: на телефоне фото стояло у нижнего края — <source> раскрытого <picture> занимали ряды сетки сцены
  test('фото и ролик крупно стоят по центру сцены, а не у нижнего края', async ({ page }) => {
    await page.goto(RU)
    const offset = async (selector: string) => {
      await page.waitForFunction((s) => {
        const el = document.querySelector<HTMLImageElement | HTMLVideoElement>(`dialog[open] ${s}`)
        return !!el && el.getBoundingClientRect().height > 0
      }, selector)
      await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))))
      return page.evaluate((s) => {
        const stage = document.querySelector('dialog[open] .lightbox__stage')!
        const st = stage.getBoundingClientRect()
        const cs = getComputedStyle(stage)
        const mid = (st.top + parseFloat(cs.paddingTop) + st.bottom - parseFloat(cs.paddingBottom)) / 2
        const m = document.querySelector(`dialog[open] ${s}`)!.getBoundingClientRect()
        return Math.round(Math.abs((m.top + m.bottom) / 2 - mid))
      }, selector)
    }
    await openCase(page)
    await tiles(page).first().click()
    expect(await offset('.lightbox__img'), 'фото: смещение от центра, px').toBeLessThanOrEqual(2)
    await page.keyboard.press('Escape')
    await tiles(page).nth(1).click()
    expect(await offset('.lightbox__video'), 'ролик: смещение от центра, px').toBeLessThanOrEqual(2)
  })

  // Каждый слайд каждой папки-коллажа на каждом экране: работы целиком в сцене, не наезжают друг на друга,
  // ряды по центру, файлы загрузились, у каждой работы назван проект (подпись слайда или подпись под работой)
  test('каждый слайд-коллаж: работы влезают в сцену, ряды по центру, картинки грузятся, проект назван', async ({ page }) => {
    test.slow()
    await page.goto(RU)
    const problems: string[] = []
    for (const name of ['Монтаж Reels', 'Stories', 'Рекламные креативы', 'Статистика SMM']) {
      const { total } = await openCase(page, name)
      for (let i = 1; i <= total; i++) {
        await expect(counter(page)).toHaveText(`${i} из ${total}`)
        const n = await tiles(page).count()
        if (n > 0) {
          await expect
            .poll(() => tiles(page).locator('img').evaluateAll((imgs) => imgs.every((im) => (im as HTMLImageElement).complete && (im as HTMLImageElement).naturalWidth > 0)), {
              message: `${name} ${i}: картинки коллажа загрузились`,
            })
            .toBe(true)
        }
        const r = await page.evaluate(() => {
          const stage = document.querySelector('dialog[open] .lightbox__stage')!
          const st = stage.getBoundingClientRect()
          const cs = getComputedStyle(stage)
          const box = {
            left: st.left + parseFloat(cs.paddingLeft),
            right: st.right - parseFloat(cs.paddingRight),
            top: st.top + parseFloat(cs.paddingTop),
            bottom: st.bottom - parseFloat(cs.paddingBottom),
          }
          const rect = (el: Element) => el.getBoundingClientRect()
          const cells = [...document.querySelectorAll('dialog[open] .lightbox__cell')].map(rect)
          const tileRects = [...document.querySelectorAll('dialog[open] .lightbox__tile')].map(rect)
          const out = [...cells, ...tileRects].filter(
            (c) => c.left < box.left - 1 || c.right > box.right + 1 || c.top < box.top - 1 || c.bottom > box.bottom + 1,
          ).length
          let overlap = 0
          for (let a = 0; a < tileRects.length; a++)
            for (let b = a + 1; b < tileRects.length; b++) {
              const p = tileRects[a]
              const q = tileRects[b]
              if (p.left < q.right - 1 && q.left < p.right - 1 && p.top < q.bottom - 1 && q.top < p.bottom - 1) overlap++
            }
          const offCenter = [...document.querySelectorAll('dialog[open] .lightbox__row')].map((row) => {
            const kids = [...row.children].map(rect)
            const left = Math.min(...kids.map((k) => k.left)) - box.left
            const right = box.right - Math.max(...kids.map((k) => k.right))
            return Math.round(Math.abs(left - right))
          })
          const minHeight = Math.min(...tileRects.map((t) => t.height))
          // у работ слайда одна высота, и выше, чем самая широкая работа во всю ширину сцены, она не бывает:
          // карточка статистики WOW 1210 × 420 на телефоне 375 px — 343 / 2,88 = 119 px при любой раскладке
          const widest = Math.max(...tileRects.map((t) => t.width / t.height))
          const ceiling = Math.floor((box.right - box.left) / widest)
          return {
            ceiling,
            tiles: tileRects.length,
            out,
            overlap,
            offCenter: Math.max(0, ...offCenter),
            minHeight: tileRects.length ? Math.round(minHeight) : null,
            badge: document.querySelectorAll('dialog[open] .lightbox__badge').length,
            labels: document.querySelectorAll('dialog[open] .lightbox__label').length,
          }
        })
        const at = `${name} ${i}`
        if (r.out) problems.push(`${at}: ${r.out} работ за краем сцены`)
        if (r.overlap) problems.push(`${at}: ${r.overlap} пар работ наезжают`)
        if (r.offCenter > 2) problems.push(`${at}: ряд смещён от центра на ${r.offCenter} px`)
        const floor = Math.min(120, r.ceiling)
        if (r.minHeight !== null && r.minHeight < floor) problems.push(`${at}: работа высотой ${r.minHeight} px — мелко (можно ${floor})`)
        const named = r.badge === 1 ? r.labels === 0 : r.labels === r.tiles && r.tiles > 0
        if (!named) problems.push(`${at}: проект не назван (плашка ${r.badge}, подписей ${r.labels} на ${r.tiles} работ)`)
        if (i < total) await page.locator('.lightbox__nav--next').click()
      }
      await page.keyboard.press('Escape')
    }
    expect(problems).toEqual([])
  })

  // Живая проверка 01.11: net::ERR_ABORTED на постере ролика. Плитки коллажа вставлялись с sizes="0px" до замера
  // сцены — браузер брал самый мелкий файл, через 12 мс нужный, а мелкий отменял или качал зря
  test('коллаж при открытии качает каждую работу один раз, без отменённых запросов', async ({ page }) => {
    await page.goto(RU)
    const requests: string[] = []
    const failed: string[] = []
    page.on('request', (r) => r.url().includes('/media/portfolio/') && r.resourceType() === 'image' && requests.push(r.url()))
    page.on('requestfailed', (r) => failed.push(`${r.url()} ${r.failure()?.errorText}`))
    // обложка папки — та же работа, что первая в коллаже, и грузится лениво при прокрутке к карточке: грузим заранее
    for (const card of await page.locator('#portfolio .work img').all()) {
      await card.scrollIntoViewIfNeeded()
      await expect.poll(() => card.evaluate((im: HTMLImageElement) => im.complete && im.naturalWidth > 0)).toBe(true)
    }
    for (const name of ['Монтаж Reels', 'Stories', 'Статистика SMM']) {
      requests.length = 0
      await openCase(page, name)
      await expect
        .poll(() => tiles(page).locator('img').evaluateAll((imgs) => imgs.every((im) => (im as HTMLImageElement).complete && (im as HTMLImageElement).naturalWidth > 0)))
        .toBe(true)
      const sizes = await tiles(page).locator('img').evaluateAll((imgs) => imgs.map((im) => (im as HTMLImageElement).sizes))
      expect(sizes.filter((s) => parseFloat(s) <= 0), `${name}: плитка с нулевым sizes`).toEqual([])
      // работа = имя файла без ширины: 01-reel-salon.poster-480.avif → 01-reel-salon.poster
      const work = (url: string) => new URL(url).pathname.replace(/-\d+\.\w+$/, '')
      const tileWorks = await tiles(page).locator('img').evaluateAll((imgs) => imgs.map((im) => (im as HTMLImageElement).currentSrc))
      for (const src of tileWorks) {
        const files = requests.filter((u) => work(u) === work(src))
        // 0 — тот же файл уже взят обложкой из кэша браузера (компьютер, плотность 1×)
        expect(files.length, `${name}: ${work(src)} запрошена ${files.length} раз: ${files.map((u) => u.split('/').pop())}`).toBeLessThanOrEqual(1)
      }
      await page.keyboard.press('Escape')
    }
    expect(failed).toEqual([])
  })

  // Скрин Кати 01.11: сквозь просмотр просвечивала страница — «как будто вместе всё»
  test('фон просмотра плотный: страница сквозь него не просвечивает', async ({ page }) => {
    await page.goto(RU)
    await openCase(page)
    const bg = await page.locator('dialog.lightbox').evaluate((d) => ({
      dialog: getComputedStyle(d).backgroundColor,
      backdrop: getComputedStyle(d, '::backdrop').backgroundColor,
    }))
    expect(bg).toEqual({ dialog: 'rgb(20, 9, 7)', backdrop: 'rgb(20, 9, 7)' })
  })

  // Аудит 01.11: на узком экране тип работы переносится на 2–3 строки, и скругление 999px делало из плашки овал
  test('плашка проекта в несколько строк — скруглённый прямоугольник, не овал', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'ширину задаём вручную в одном проекте')
    await page.setViewportSize({ width: 320, height: 640 })
    await page.goto(RU)
    await openCase(page, 'Монтаж Reels')
    for (let i = 0; i < 5; i++) await page.locator('.lightbox__nav--next').click()
    const badge = page.locator('dialog[open] .lightbox__badge')
    await expect(badge).toHaveText('Anna Soul · Бренд детских кутюрных платьев') // самая длинная подпись
    const { h, r } = await badge.evaluate((el) => ({ h: el.getBoundingClientRect().height, r: parseFloat(getComputedStyle(el).borderTopLeftRadius) }))
    expect(h, 'на 320 px подпись переносится').toBeGreaterThan(40)
    expect(r, `высота ${Math.round(h)}, скругление ${r}`).toBeLessThan(h / 3)
  })
})
