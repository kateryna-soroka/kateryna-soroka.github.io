import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { ru } from '../../src/content/i18n/ru'
import { uk } from '../../src/content/i18n/uk'
import { SMM_ROWS } from '../../src/content/smm'
import { CONTACT_PATTERNS, contacts } from '../../src/content/site'
import { dictionaries } from '../../src/content/i18n'
import { PORTFOLIO_ITEMS, PROJECTS } from '../../src/content/projects'
import { getCaseItems, getCaseSlides } from '../../src/content/caseItems'
import manifest from '../../src/content/media.generated.json'

describe('SMM: сравнение пакетов (ТЗ §7)', () => {
  it('каждая позиция из словаря есть в таблице ровно один раз', () => {
    expect(SMM_ROWS.map((r) => r.id).sort()).toEqual(Object.keys(ru.smm.rows).sort())
  })

  it('общие позиции ✓ в обоих пакетах', () => {
    const common = SMM_ROWS.slice(0, 11)
    for (const row of common) expect([row.id, row.base, row.complete]).toEqual([row.id, 'yes', 'yes'])
  })

  it('позиции только для Complete: в Base не ✓', () => {
    for (const id of ['strategy', 'salesContent', 'deepAnalytics', 'shooting', 'crossposting', 'telegram'] as const) {
      const row = SMM_ROWS.find((r) => r.id === id)!
      expect(row.complete).toBe('yes')
      expect(row.base).not.toBe('yes')
    }
  })

  it('съёмка для Base — «+» (ТЗ: можно согласовать отдельно)', () => {
    expect(SMM_ROWS.find((r) => r.id === 'shooting')!.base).toBe('extra')
  })

  it('«+» в легенде — услуга за отдельную плату (ответ Кати 31.10)', () => {
    expect(ru.smm.legend.extra).toMatch(/за отдельную плату/)
  })

  it('дополнительные услуги «+» в обоих пакетах и стоят в конце', () => {
    const tail = SMM_ROWS.slice(-4)
    expect(tail.map((r) => r.id)).toEqual(['branding', 'landings', 'chatbots', 'funnels'])
    for (const row of tail) expect([row.base, row.complete]).toEqual(['extra', 'extra'])
  })
})

describe('видеомонтаж (ТЗ §9)', () => {
  it('услуги — три вида монтажа словами Кати (01.11: «здесь описано неправильно», «вот это вписывай»)', () => {
    expect(uk.editing.services.map((s) => s.name)).toEqual([
      'Базовий монтаж',
      'Репортажний монтаж (заходи, бекстейджі)',
      'Динамічний монтаж з анімацією',
    ])
    expect(uk.editing.services[0].includes).toMatch(/^Нарізка кадрів.*базова кольорокорекція$/)
    expect(uk.editing.services[2].includes).toMatch(/хромакею/)
    expect(ru.editing.services.map((s) => s.name)[1]).toBe('Репортажный монтаж (мероприятия, бэкстейджи)')
  })

  it('пакеты со скидкой на всех языках: 4 → 10 %, 8 → 15 %, 12 → 20 %', () => {
    for (const dict of Object.values(dictionaries)) {
      expect(dict.editing.packages.map((p) => p.discount)).toEqual(['10%', '15%', '20%'])
      expect(dict.editing.packages.map((p) => p.name.match(/\d+/)?.[0])).toEqual(['4', '8', '12'])
    }
  })
})

describe('контакты (ТЗ §12)', () => {
  it('ровно два способа связи: Telegram и WhatsApp', () => {
    expect(Object.keys(contacts)).toEqual(['telegram', 'whatsapp'])
  })

  it('ссылка либо пустая (плейсхолдер), либо правильного формата', () => {
    for (const [key, url] of Object.entries(contacts)) {
      if (url) expect(url, key).toMatch(CONTACT_PATTERNS[key as keyof typeof contacts])
    }
  })
})

describe('ответы Кати 01.11', () => {
  it('украинский — вариант Б без лет: роли без рода, «Про мене» начинается со «Створюю контент»', () => {
    expect(uk.hero.roles).toBe('SMM / Створення контенту / Відеомонтаж')
    expect(uk.about.paragraphs[0]).toMatch(/^Створюю контент/)
    const ukText = JSON.stringify(uk)
    expect(ukText).not.toMatch(/креаторк|Спеціалістк|5-річ|років/)
  })

  it('«Да убирать 5 лет везде» — ни в одном языке нет стажа в годах', () => {
    for (const [locale, dict] of Object.entries(dictionaries))
      expect(JSON.stringify(dict), locale).not.toMatch(/5-летн|более чем 5|over 5 years|years of experience|5-річ|років досвіду/)
    expect(ru.about.paragraphs[0]).toMatch(/^Создаю контент/)
    expect(dictionaries.en.about.paragraphs[0]).toMatch(/^I create content/)
  })

  it('контакты прислала: Telegram и WhatsApp', () => {
    expect(contacts.telegram).toBe('https://t.me/ekaterynaekateryna')
    expect(contacts.whatsapp).toBe('https://wa.me/380664925296')
  })

  it('WOW Beauty Lab — айдентика и фирменный стиль, не «ребрендинг»', () => {
    const identity = byslug('identity')
    expect(identity.title.ru).toBe('Айдентика и фирменный стиль')
    expect(identity.projects).toEqual(['wow'])
  })

  it('выдуманных названий нет; у каждой работы монтажа, сторис и креативов есть проект', () => {
    const names = [...PORTFOLIO_ITEMS.map((w) => w.title), ...Object.values(PROJECTS).map((p) => p.title)].flatMap((t) => Object.values(t))
    expect(names.filter((t) => /Бьюти|Б’юті|Утро невесты|Ранок нареченої|Bridal|Beauty$/.test(t))).toEqual([])
    for (const slug of ['reels', 'stories', 'ads'])
      expect(getCaseItems(byslug(slug)).filter((i) => !i.project).map((i) => i.key), slug).toEqual([])
  })
})

const byslug = (slug: string) => PORTFOLIO_ITEMS.find((w) => w.slug === slug)!
const names = (slug: string, project?: string) =>
  getCaseItems(byslug(slug))
    .filter((i) => i.project === project)
    .map((i) => i.key.split('/').pop())
/** слайды папки: подпапка и файлы по порядку */
const slides = (slug: string) =>
  getCaseSlides(byslug(slug)).map((s) => ({
    dir: s.items[0].key.split('/')[2],
    files: s.items.map((i) => i.key.split('/').pop()),
    projects: s.items.map((i) => i.project),
  }))

describe('правки Кати по портфолио 01.11 ночью: папки по типу работы', () => {
  it('«результаты smm ведения не должны быть вместе с монтажем рилс» — статистика отдельно', () => {
    const reels = getCaseItems(byslug('reels')).map((i) => i.key)
    expect(reels.filter((k) => /insights|engagement|audience|views|account|results/.test(k))).toEqual([])
    expect(names('smm-results', 'wow')).toHaveLength(6)
    expect(names('smm-results', 'anna-soul')).toEqual(['01-reel-overview', '02-reel-engagement', '03-post-stats', '04-post-stats'])
    // и наоборот: в статистике нет роликов и сторис
    expect(getCaseItems(byslug('smm-results')).every((i) => i.kind === 'image')).toBe(true)
  })

  it('«Психологические блокноты» сняты целиком: блокноты на сайте только нумерологические', () => {
    const keys = Object.keys(manifest.images).concat(Object.keys(manifest.videos))
    expect(keys.filter((k) => /notebook/.test(k) && !k.startsWith('portfolio/stories/numerology-notebooks/'))).toEqual([])
  })

  it('из полиграфии Anna Soul снято фото подиума', () => {
    expect(names('print', 'anna-soul')).toEqual(['01-lookbook', '02-hang-tag-velvet', '03-hang-tag', '04-certificate'])
  })
})

describe('правки Кати 01.11 днём: слайды-коллажи и папка рекламных креативов', () => {
  it('папки: монтаж Reels, Stories, рекламные креативы, статистика SMM, айдентика, полиграфия, AI-видео', () => {
    expect(PORTFOLIO_ITEMS.map((w) => w.slug)).toEqual(['reels', 'stories', 'ads', 'smm-results', 'identity', 'print', 'ai-video'])
    expect(byslug('ads').title.uk).toBe('Рекламні креативи')
  })

  it('«на одном слайде 2–4 фото/видео»: в коллажах от 2 до 6 работ (её слайды Anna Soul и блокнотов — по 6)', () => {
    // одна работа — только ролик «это сторис», который в её слайд Anna Soul не вошёл (вопрос Кате);
    // девять — сторис психолога: её три коллажа по три сторис, нарезанные по одной («если мелко — предложи альтернативу»)
    const single = ['portfolio/stories/anna-soul-red-dress/01-stories-video']
    const nine = ['portfolio/stories/psychologist/01-story']
    for (const slug of ['reels', 'stories', 'ads'])
      for (const slide of getCaseSlides(byslug(slug))) {
        const key = slide.items[0]?.key
        expect(slide.items.length, `${slug}: ${key}`).toBeGreaterThanOrEqual(single.includes(key) ? 1 : 2)
        expect(slide.items.length, `${slug}: ${key}`).toBeLessThanOrEqual(nine.includes(key) ? 9 : 6)
      }
  })

  it('монтаж — 9 слайдов в порядке, в каком она прислала «папку монтаж по слайдам»', () => {
    expect(slides('reels').map((s) => s.dir)).toEqual([
      'sculpcher',
      'psychologist',
      'wow',
      'fashion',
      'numerologist-backstage',
      'anna-soul-1',
      'anna-soul-2',
      'ambitna',
      'homewear',
    ])
  })

  it('ролик с ежедневником — «кейс нумеролог», в паре с backstage (бывшее «Утро невесты»), подпись под каждым', () => {
    const slide = slides('reels').find((s) => s.dir === 'numerologist-backstage')!
    expect(slide.files).toEqual(['01-reel-numerologist', '02-reel-backstage'])
    expect(slide.projects).toEqual(['numerologist', 'backstage'])
  })

  it('WOW: «к этому слайду добавить ещё видео» — 4 ролика, и подпись «съёмка тоже моя»', () => {
    const def = byslug('reels').slides!.find((s) => s.dir === 'wow')!
    expect(slides('reels').find((s) => s.dir === 'wow')!.files).toHaveLength(4)
    expect(def.note?.uk).toBe('Зйомка та монтаж — мої')
  })

  it('«это сторис»: ролик Anna Soul ушёл из монтажа в сторис; её слайд Anna Soul — ровно 6 работ альбома', () => {
    expect(getCaseItems(byslug('reels')).map((i) => i.key)).not.toContain('portfolio/reels/anna-soul/01-reel')
    expect(slides('stories').find((s) => s.dir === 'anna-soul-red-dress')!.files).toEqual(['01-stories-video'])
    expect(slides('stories').find((s) => s.dir === 'anna-soul')!.files).toEqual([
      '01-stories-video',
      '02-story',
      '03-story',
      '04-story',
      '05-stories-video',
      '06-stories-video',
    ])
  })

  it('сторис — 8 слайдов-сторителлингов; психолог — по порядку её альбома, от «Главы 1» к финалу', () => {
    expect(slides('stories').map((s) => s.dir)).toEqual([
      'inout',
      'psychologist',
      'clinic',
      'anna-soul',
      'anna-soul-red-dress',
      'numerology-notebooks',
      'wow-brows',
      'wow-pedicure',
    ])
    // три её коллажа «Глава 1 → Глава 2 → финал», по три сторис в каждом, — девять сторис подряд
    expect(slides('stories').find((s) => s.dir === 'psychologist')!.files).toEqual(
      Array.from({ length: 9 }, (_, i) => `${String(i + 1).padStart(2, '0')}-story`),
    )
    expect(slides('stories').find((s) => s.dir === 'wow-brows')!.files).toHaveLength(4)
    expect(slides('stories').find((s) => s.dir === 'wow-pedicure')!.files).toHaveLength(4)
  })

  it('креативы — 11 кейсов; оптика и кинолог на одном слайде; «бьюти» стал «перманентным макияжем»', () => {
    const ads = slides('ads')
    expect(ads).toHaveLength(11)
    expect(ads.find((s) => s.dir === 'dog-trainer-optics')!.projects).toEqual(['dog-trainer', 'optics'])
    expect(ads.find((s) => s.dir === 'permanent-makeup')!.files).toEqual(['01-reel-lips', '02-reel-makeup', '03-reel-extension'])
    expect(ads.find((s) => s.dir === 'cbt')!.files).toHaveLength(4) // два альбома «КЕЙС Центр КПТ» — один кейс
  })

  // 01.11 15:36: «Зростання охоплень…» — «Удали этот слайд»; Anna Soul — «Плохое качество», 16:20 «перегенерируй»
  it('статистика SMM: Anna Soul, WOW и 2 кейса «без брендов, чисто описание», каждый — отдельный слайд', () => {
    expect(slides('smm-results').map((s) => s.dir)).toEqual(['anna-soul', 'wow', 'smm-reach-46', 'smm-reach-10'])
    expect('smm-growth' in PROJECTS).toBe(false)
    for (const p of ['smm-reach-46', 'smm-reach-10'] as const)
      expect('about' in PROJECTS[p], `${p}: ниша не придумана`).toBe(false)
    // ни одного бренда в подписи: ни из наших проектов, ни из её
    const brands = /WOW|Anna Soul|Ambitna|Balensimaga|Sculpcher|InOut/i
    for (const p of ['smm-reach-46', 'smm-reach-10'] as const)
      for (const lang of ['ru', 'uk', 'en'] as const) expect(PROJECTS[p].title[lang]).not.toMatch(brands)
  })

  // 01.11 15:53: «вырезать саму статистику… чтобы было в одном дизайне. Все кейсы по статистике»;
  // про WOW: «вот это все на один слайд, и это можно подписать что wow beauty кейс»
  it('статистика в одном виде: кейс = слайд из вырезанных карточек, её оформленных слайдов нет, WOW — один слайд', () => {
    const smm = slides('smm-results')
    expect(smm.flatMap((s) => s.files).filter((f) => /results/.test(f!))).toEqual([])
    for (const s of smm) {
      expect(s.files.length, s.dir).toBeGreaterThanOrEqual(3)
      expect(new Set(s.projects), `${s.dir}: подпись одна на слайд`).toEqual(new Set([s.projects[0]]))
    }
    expect(smm.find((s) => s.dir === 'wow')!.files).toHaveLength(6)
    expect(smm.find((s) => s.dir === 'wow')!.projects[0]).toBe('wow')
  })

  it('у слайда из двух кейсов проект указан у каждой работы', () => {
    for (const work of PORTFOLIO_ITEMS)
      for (const def of work.slides ?? []) {
        if (!def.projects) continue
        expect(getCaseSlides(work).find((s) => s.items[0].key.includes(`/${def.dir}/`))!.items, def.dir).toHaveLength(def.projects.length)
      }
  })
})

describe('портфолио: папки и материалы', () => {
  it('названия папок, проектов и ниш — на трёх языках', () => {
    const fields = [...PORTFOLIO_ITEMS.map((w) => w.title), ...Object.values(PROJECTS).flatMap((p) => ('about' in p ? [p.title, p.about] : [p.title]))]
    for (const field of fields) for (const lang of ['ru', 'uk', 'en'] as const) expect(field[lang].trim(), JSON.stringify(field)).not.toBe('')
  })

  it('у каждой папки есть материалы, адреса папок не повторяются', () => {
    for (const work of PORTFOLIO_ITEMS) expect(getCaseItems(work).length, work.slug).toBeGreaterThan(0)
    expect(new Set(PORTFOLIO_ITEMS.map((w) => w.slug)).size).toBe(PORTFOLIO_ITEMS.length)
  })

  it('медиа лежат только там, где сайт их показывает: hero, about, папка кейса, подпапки её проектов или слайдов', () => {
    const dirs = Object.keys(manifest.dirs)
    const known = new Set([
      'hero',
      'about',
      'covers',
      ...PORTFOLIO_ITEMS.flatMap((w) => [
        `portfolio/${w.slug}`,
        ...(w.projects ?? []).map((p) => `portfolio/${w.slug}/${p}`),
        ...(w.slides ?? []).map((s) => `portfolio/${w.slug}/${s.dir}`),
      ]),
    ])
    expect(dirs.filter((d) => !known.has(d)), 'папки, которые сайт не показывает').toEqual([])
    // и наоборот: у каждого слайда есть файлы
    for (const w of PORTFOLIO_ITEMS) for (const s of w.slides ?? []) expect(manifest.dirs, `${w.slug}/${s.dir}`).toHaveProperty([`portfolio/${w.slug}/${s.dir}`])
  })

  it('обложка из projects.ts существует в своей папке', () => {
    for (const work of PORTFOLIO_ITEMS.filter((w) => w.cover))
      expect(getCaseItems(work).map((i) => i.key), work.slug).toContain(`portfolio/${work.slug}/${work.cover}`)
  })

  it('обложки из media-src/covers/ — картинки, и каждая стоит ровно у одной папки', () => {
    const used = PORTFOLIO_ITEMS.flatMap((w) => (w.coverImage ? [w.coverImage] : []))
    for (const key of used) expect(manifest.images, key).toHaveProperty([key])
    expect([...(manifest.dirs.covers ?? [])].sort()).toEqual([...used].sort())
  })

  it('в public/media нет файлов, на которые не ссылается сайт (аудит 01.11: промежуточные кадры обложек уезжали в сборку, 12,7 МБ)', () => {
    const used = new Set(JSON.stringify(manifest).match(/\/media\/[^\s",]+/g))
    const root = path.resolve(__dirname, '../../public')
    const files = readdirSync(path.join(root, 'media'), { recursive: true, withFileTypes: true })
      .filter((e) => e.isFile())
      .map((e) => '/' + path.relative(root, path.join(e.parentPath, e.name)).split(path.sep).join('/'))
    expect(files.length).toBeGreaterThan(0)
    expect(files.filter((f) => !used.has(f))).toEqual([])
  })
})

describe('правки Кати 02.11', () => {
  it('подсветка под курсором — через any-hover: на ноутбуке с сенсорным экраном (hover: hover) ложно', () => {
    const css = readFileSync(path.resolve(__dirname, '../../src/index.css'), 'utf8')
    expect(css).not.toMatch(/\(\s*hover\s*:\s*hover\s*\)/)
    expect(css).toMatch(/\.pkg__head:hover::before/)
  })

  it('английский — британский, как объявлено в разметке (en_GB): colour, centre', () => {
    // только видимый текст: ключи проектов и папок (colorist) — служебные имена, на сайте их нет
    const projects = Object.values(PROJECTS).map((p: { title: { en: string }; about?: { en: string } }) => [p.title.en, p.about?.en])
    const folders = PORTFOLIO_ITEMS.map((w) => [w.title.en, ...(w.slides ?? []).map((s) => s.note?.en)])
    const en = JSON.stringify([dictionaries.en, projects, folders])
    expect(en).toContain('colour')
    expect(en).not.toMatch(/\bcolor|\bcenter\b/i)
  })
})
