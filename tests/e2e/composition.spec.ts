import { expect, test, type Locator } from '@playwright/test'

/**
 * Композиция по ТЗ и по замечаниям ревью 30.10. Каждый тест держит одно место,
 * которое было сломано и подтверждено замером на живой сборке.
 */

const settle = (ms = 1000) => new Promise((r) => setTimeout(r, ms))

test.describe('SMM-пакеты: порядок блоков и поведение', () => {
  test('заголовок пакета остаётся на месте, когда соседний пакет сворачивается', async ({ page }) => {
    await page.goto('/')
    const complete = page.locator('#pkg-complete-label')
    // при входе оба закрыты — сначала открыть Base, чтобы было что сворачивать над Complete
    const base = page.locator('#pkg-base-label')
    await base.scrollIntoViewIfNeeded()
    await settle() // появление блока при прокрутке
    await base.click()
    await settle(900)
    await page.evaluate(() => {
      const el = document.getElementById('pkg-complete-label')!
      window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - innerHeight * 0.6, behavior: 'instant' })
    })
    await settle() // появление блока при прокрутке
    const before = (await complete.boundingBox())!.y
    await complete.click()
    await settle(900) // анимация сворачивания 0.6 с
    const after = (await complete.boundingBox())!.y
    expect(Math.abs(after - before), `было ${Math.round(before)}, стало ${Math.round(after)}`).toBeLessThan(4)
    await expect(complete).toHaveAttribute('aria-expanded', 'true')
  })

  test('легенда над пакетами, под пакетами сноска и кнопка; примеров работ в разделе нет', async ({ page }) => {
    await page.goto('/')
    const order = await page.evaluate(() =>
      [...document.querySelector('#smm .container')!.children].map((e) => e.className.split(' ')[0]),
    )
    expect(order).toEqual(['split-head', 'legend', 'packages', 'footnote', 'smm__cta'])
  })
})

test.describe('работы — только в «Портфолио» (решение Кати 31.10)', () => {
  test('в разделах услуг нет галерей и плейсхолдеров', async ({ page }) => {
    await page.goto('/')
    for (const id of ['smm', 'shooting', 'editing', 'branding']) {
      await expect(page.locator(`#${id}`).locator('img, video, .tile, .placeholder, .project-thumb'), id).toHaveCount(0)
    }
  })

  // Правки Кати 01.11: папки по типу работы («одна папка сторис», «одна папка» монтажа, отдельно статистика),
  // днём — «сделать отдельно папку рекламных креативов»
  test('портфолио — папки по типу работы: обложка, название, число работ', async ({ page }) => {
    await page.goto('/')
    const works = page.locator('#portfolio .work')
    await expect(works.locator('.work__title')).toHaveText([
      'Монтаж Reels',
      'Stories',
      'Рекламні креативи',
      'Статистика SMM',
      'Айдентика і фірмовий стиль',
      'Поліграфія',
      'AI-відео',
    ])
    await expect(page.locator('#portfolio .placeholder')).toHaveCount(0)
    for (const work of await works.all()) {
      await expect(work.locator('.work__img img')).toHaveCount(1)
      await expect(work.locator('.work__type')).toHaveText(/^\d+ робот|^\d+ робіт/)
    }
  })

  // превью грузятся лениво: без прокрутки у картинки нет ни размеров, ни адреса
  const loadedCover = async (card: Locator) => {
    await card.scrollIntoViewIfNeeded()
    const img = card.locator('.work__img img')
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true)
    return img
  }

  // Обложки выбрала Катя 01.11 15:42–16:22. Квадратная обрезка не должна резать надписи на её кадрах; доли кадра
  // замерены по пикселям исходника. whole — что обязано войти в квадрат целиком: ANNA SOUL — строка «AW'25» с 23,7 %,
  // девочки до туфель — до 76,2 %; вебинар — заголовок с 12,1 %, цена до 29,2 %. Обложки из covers/ — квадратные
  // вырезки, проверяем, что стоит именно файл
  type Edges = { top?: number; bottom?: number; left?: number; right?: number }
  const COVERS: { title: RegExp; file: string; cut?: Edges; whole?: Edges }[] = [
    { title: /^Монтаж Reels$/, file: 'portfolio/reels/ambitna/01-reel' },
    { title: /^Stories$/, file: 'portfolio/stories/anna-soul/01-stories-video', whole: { top: 0.237, bottom: 0.762 } },
    // от заголовка до конца 2-го пункта (1225 из 1920 px) — Катя 17:19 «Сдвинь еще немного выше»
    { title: /^Рекламні креативи$/, file: 'portfolio/ads/psychologist/01-ad', whole: { top: 0.121, bottom: 0.638 } },
    { title: /^Статистика SMM$/, file: 'covers/smm-results' },
    { title: /^Айдентика/, file: 'covers/identity' },
  ]
  for (const cover of COVERS) {
    test(`обложка «${cover.title.source.replace(/[\^$]/g, '')}»: надписи работы не режутся квадратом превью`, async ({ page }) => {
      await page.goto('/')
      const card = page.locator('#portfolio .work').filter({ has: page.locator('.work__title', { hasText: cover.title }) })
      await expect(card).toHaveCount(1)
      const img = await loadedCover(card)
      // фото: 01-results-768.avif, постер ролика: 01-dog-trainer.poster-768.avif
      expect(await img.evaluate((i: HTMLImageElement) => i.currentSrc)).toMatch(new RegExp(`/media/${cover.file}[-.]`))
      const frame = await card.locator('.work__img').evaluate((box) => {
        const img = box.querySelector('img')!
        const b = box.getBoundingClientRect()
        const i = img.getBoundingClientRect()
        // object-fit: cover — в квадрат попадает полоса кадра шириной sx (высотой sy); где именно — задаёт object-position
        const a = img.naturalWidth / img.naturalHeight
        const sx = Math.min(1, 1 / a)
        const sy = Math.min(1, a)
        const [px, py] = getComputedStyle(img).objectPosition.split(' ').map((v) => parseFloat(v) / 100)
        const fx = (x: number) => (1 - sx) * px + ((x - i.left) / i.width) * sx
        const fy = (y: number) => (1 - sy) * py + ((y - i.top) / i.height) * sy
        return { left: fx(b.left), right: fx(b.right), top: fy(b.top), bottom: fy(b.bottom) }
      })
      const gap = 0.008 // запас от края надписи
      const { cut = {}, whole = {} } = cover
      if (cut.bottom) expect(frame.bottom, 'квадрат заходит на подпись снизу').toBeLessThan(cut.bottom - gap)
      if (whole.top) expect(frame.top, 'надпись срезана сверху').toBeLessThan(whole.top - gap)
      if (whole.bottom) expect(frame.bottom, 'надпись срезана снизу').toBeGreaterThan(whole.bottom + gap)
      if (whole.left) expect(frame.left, 'надпись срезана слева').toBeLessThan(whole.left - gap)
      if (whole.right) expect(frame.right, 'надпись срезана справа').toBeGreaterThan(whole.right + gap)
    })
  }

  // 01.11 15:42 Катя выбрала обложками кадры с надписью и фигурами во всю ширину, значок play внизу слева ложился на
  // «L'ORÉAL» и на ноги девочек ANNA SOUL (§49). Папка — как «Актуальное» в Instagram, без значка; ролики помечены
  // внутри, на плитках коллажа
  test('на обложках папок нет значка play: он закрывал надписи и фигуры на кадрах', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#portfolio .work')).toHaveCount(7)
    await expect(page.locator('#portfolio .work__play')).toHaveCount(0)
  })

  // 01.11: статистику вырезали из её слайдов, и обложкой папки стал скрин 158 px — в карточке 143–176 px он мылился.
  // Исходник обложки (самый крупный файл в srcset) — не меньше ¾ того, что нужно экрану; плотность — до 2×
  test('обложки папок не мыльные: исходник не меньше, чем нужно карточке', async ({ page }) => {
    await page.goto('/')
    for (const card of await page.locator('#portfolio .work').all()) {
      const img = await loadedCover(card)
      const r = await img.evaluate((i: HTMLImageElement) => {
        const side = i.closest('.work__img')!.getBoundingClientRect().width
        const aspect = i.naturalWidth / i.naturalHeight
        const zoom = Number(getComputedStyle(i).scale) || 1
        const widthOf = (url: string) => Number(/-(\d+)\.\w+$/.exec(url)?.[1] ?? 0)
        const all = [...i.closest('picture')!.querySelectorAll('source')].flatMap((s) =>
          s.srcset.split(',').map((c) => widthOf(c.trim().split(' ')[0])),
        )
        const need = Math.max(side, side * aspect) * zoom * Math.min(devicePixelRatio, 2)
        return { file: i.currentSrc.split('/media/')[1], max: Math.max(...all), need: Math.round(need) }
      })
      expect(r.max, `${await card.locator('.work__title').textContent()}: ${JSON.stringify(r)}`).toBeGreaterThanOrEqual(r.need * 0.75)
    }
  })
})

test.describe('Hero', () => {
  test('на iPad и компьютере имя слева, портрет справа (ТЗ §4)', async ({ page }, info) => {
    test.skip(info.project.name === 'mobile', 'на телефоне утверждён вариант Б — стопкой')
    await page.goto('/')
    const name = (await page.locator('.hero__name').boundingBox())!
    const media = (await page.locator('.hero__media').boundingBox())!
    expect(media.y, 'портрет стоит рядом с именем, а не под ним').toBeLessThan(name.y + name.height)
    expect(media.x + media.width / 2).toBeGreaterThan(name.x + name.width / 2)
  })

  test('браузер берёт файл портрета не меньше, чем нужно экрану', async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => {
      const img = document.querySelector<HTMLImageElement>('.hero__media img')
      return !!img && img.complete && img.naturalWidth > 0
    })
    const r = await page.evaluate(() => {
      const img = document.querySelector<HTMLImageElement>('.hero__media img')!
      const box = img.getBoundingClientRect()
      const aspect = img.naturalWidth / img.naturalHeight
      const shown = Math.max(box.width, box.height * aspect) * devicePixelRatio
      const widthOf = (url: string) => Number(/-(\d+)\.\w+$/.exec(url)?.[1] ?? 0)
      const all = [...document.querySelectorAll<HTMLSourceElement>('.hero__media source')]
        .flatMap((s) => s.srcset.split(',').map((c) => widthOf(c.trim().split(' ')[0])))
      return { file: widthOf(img.currentSrc), need: Math.round(shown), max: Math.max(...all) }
    })
    // Файла крупнее исходника нет — тогда допустим самый большой
    expect(r.file, JSON.stringify(r)).toBeGreaterThanOrEqual(Math.min(r.need * 0.95, r.max))
  })

  test('плашка ролей в одну строку даже на 320 px', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'ширину задаём вручную в одном проекте')
    await page.setViewportSize({ width: 320, height: 700 })
    await page.goto('/')
    const pill = page.locator('.hero__pill')
    const lines = await pill.evaluate((el) => {
      const range = document.createRange()
      range.selectNodeContents(el)
      return new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size
    })
    expect(lines).toBe(1)
  })
})

test.describe('шапка', () => {
  test('после прокрутки шапка размывает фон под собой', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo({ top: 2000, behavior: 'instant' }))
    const header = page.locator('.site-header')
    await expect(header).toHaveAttribute('data-scrolled', 'true')
    expect(await header.evaluate((el) => getComputedStyle(el).backdropFilter)).toContain('blur')
    expect(await page.locator('.lang').evaluate((el) => getComputedStyle(el).backdropFilter)).toContain('blur')
  })
})

test.describe('разделы', () => {
  test('«Обо мне» на iPad: сначала заголовок, потом фото', async ({ page }, info) => {
    test.skip(info.project.name !== 'tablet', 'на компьютере текст и фото рядом, на телефоне фото нет')
    await page.goto('/')
    const title = (await page.locator('#about-title').boundingBox())!
    const photo = (await page.locator('.about__photo').boundingBox())!
    expect(title.y).toBeLessThan(photo.y)
  })

  // Правка Кати 01.11: «именно в мобильной версии убрать фото в разделе обо мне, а на версии планшета и пк оставить»
  test('«Обо мне»: на телефоне фото нет и оно не скачивается, на планшете и компьютере есть', async ({ page }, info) => {
    const requested: string[] = []
    page.on('request', (r) => r.url().includes('/media/about/') && requested.push(r.url()))
    await page.goto('/')
    await page.locator('#about').evaluate((el) => el.scrollIntoView({ behavior: 'instant' }))
    await page.waitForLoadState('networkidle')
    const photo = page.locator('.about__photo')
    if (info.project.name === 'mobile') {
      await expect(photo).toBeHidden()
      expect(requested, 'скрытое фото не должно грузиться на телефоне').toEqual([])
    } else {
      await expect(photo).toBeVisible()
      await expect.poll(() => photo.locator('img').evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true)
    }
  })

  test('монтаж: три вида монтажа и пакеты со скидкой (правка Кати 01.11)', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('#editing')
    await expect(section.locator('.service-list__name')).toHaveText([
      'Базовий монтаж',
      'Репортажний монтаж (заходи, бекстейджі)',
      'Динамічний монтаж з анімацією',
    ])
    await expect(section.locator('.service-list__includes')).toHaveCount(3)
    await expect(section.locator('.packages__discount')).toHaveText(['−10%', '−15%', '−20%'])
  })

  test('съёмка без примеров работ: текст, этапы, география и кнопка (ответ Кати 31.10)', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('#shooting')
    await expect(section.locator('img, video, .tile, .placeholder')).toHaveCount(0)
    await expect(section.locator('.steps li')).toHaveCount(5)
    await expect(section.locator('.geo__places')).toBeVisible()
    await expect(section.locator('.btn-cta')).toHaveCount(1)
  })

  test('география съёмок — в плашке, как пакеты со скидкой у монтажа (Катя 01.11)', async ({ page }) => {
    await page.goto('/')
    const look = (sel: string) =>
      page.locator(sel).first().evaluate((el) => {
        const s = getComputedStyle(el)
        return { bg: s.backgroundColor, radius: parseFloat(s.borderTopLeftRadius) }
      })
    const geo = await look('#shooting .geo')
    const plaque = await look('.packages__list li')
    expect(geo.bg).toBe(plaque.bg)
    expect(geo.radius).toBeGreaterThanOrEqual(plaque.radius)
  })

  test('съёмка на компьютере: этапы колонкой справа от текста, не под ним', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'две колонки только на широком экране')
    await page.goto('/')
    const lead = (await page.locator('#shooting .lead').boundingBox())!
    const steps = (await page.locator('#shooting .steps').boundingBox())!
    expect(steps.x).toBeGreaterThan(lead.x + lead.width)
    expect(steps.y).toBeLessThan(lead.y + lead.height)
  })

  test('монтаж: список услуг начинается не выше заголовка раздела', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'две колонки только на широком экране')
    await page.goto('/')
    const head = (await page.locator('#editing .section-head').boundingBox())!
    const services = (await page.locator('#editing .editing__services').boundingBox())!
    expect(services.y).toBeGreaterThanOrEqual(head.y - 2)
  })

  test('навигация: панели одного ряда одной высоты', async ({ page }, info) => {
    test.skip(info.project.name === 'mobile', 'на телефоне панели в столбец')
    await page.goto('/')
    // offsetTop/offsetHeight, а не getBoundingClientRect: анимация появления сдвигает панели
    // на разное расстояние, и по экранным координатам каждая попала бы в свой «ряд»
    const rows = await page.locator('.nav-panel').evaluateAll((els) => {
      const byRow = new Map<number, number[]>()
      for (const el of els as HTMLElement[]) {
        const key = (el.offsetParent as HTMLElement).offsetTop
        byRow.set(key, [...(byRow.get(key) ?? []), el.offsetHeight])
      }
      return [...byRow.values()]
    })
    expect(rows.length, 'панели разложились по рядам').toBeLessThan(6)
    for (const heights of rows) expect(new Set(heights).size, heights.join(', ')).toBe(1)
  })

  // Правка Кати 01.11 сократила портфолио с 13 карточек до 6 папок, и auto-fill разложил их на iPad (820)
  // как 5 + 1, на 768 — как 4 + 2: одинокая карточка во втором ряду выглядит ошибкой вёрстки.
  // Появится седьмая папка — тест упадёт и напомнит пересобрать ряды, а не оставить хвост.
  test('портфолио: ряды папок одинаковой длины на всех ширинах', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'ширины перебираем в одном проекте')
    await page.goto('/')
    const problems: string[] = []
    for (const width of [320, 375, 414, 768, 820, 834, 900, 959, 960, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 })
      await page.waitForTimeout(100)
      // offsetTop, а не экранные координаты: анимация появления сдвигает сетку
      const rows = await page.locator('#portfolio .work').evaluateAll((els) => {
        const byRow = new Map<number, number>()
        for (const el of els as HTMLElement[]) byRow.set(el.offsetTop, (byRow.get(el.offsetTop) ?? 0) + 1)
        return [...byRow.values()]
      })
      if (new Set(rows).size > 1) problems.push(`${width}: ${rows.join(' + ')}`)
    }
    expect(problems).toEqual([])
  })

  // Седьмая папка (01.11) на телефоне: лента вбок вместо сетки 2 + 2 + 2 + 1
  test('портфолио на телефоне: папки лентой, следующая выглядывает, последняя достижима, страница вбок не едет', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile', 'лента — только на телефоне')
    await page.goto('/')
    const list = page.locator('#portfolio .works')
    await list.scrollIntoViewIfNeeded()
    const m = await list.evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth, snap: getComputedStyle(el).scrollSnapType }))
    expect(m.sw, 'лента шире экрана — листается').toBeGreaterThan(m.cw)
    expect(m.snap).toContain('x')
    const peek = await page.locator('#portfolio .work').evaluateAll((els) =>
      els.some((el) => {
        const r = el.getBoundingClientRect()
        return r.left < innerWidth && r.right > innerWidth
      }),
    )
    expect(peek, 'край следующей папки виден у правого края — понятно, что лента листается').toBe(true)
    const last = page.locator('#portfolio .work').last()
    await list.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }))
    await expect(last).toBeInViewport({ ratio: 1 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 'страница вбок не прокручивается').toBeLessThanOrEqual(0)
  })
})
