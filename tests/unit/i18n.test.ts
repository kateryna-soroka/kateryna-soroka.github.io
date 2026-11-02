import { describe, expect, it } from 'vitest'
import { dictionaries } from '../../src/content/i18n'
import { ru } from '../../src/content/i18n/ru'
import { FORBIDDEN_PHRASES, findPrices } from '../../scripts/price-patterns.mjs'

type Tree = string | readonly Tree[] | { readonly [k: string]: Tree }

function leaves(node: Tree, prefix = ''): Array<[string, string]> {
  if (typeof node === 'string') return [[prefix, node]]
  if (Array.isArray(node)) return node.flatMap((n, i) => leaves(n, `${prefix}[${i}]`))
  return Object.entries(node).flatMap(([k, v]) => leaves(v as Tree, prefix ? `${prefix}.${k}` : k))
}

const all = Object.entries(dictionaries).map(([locale, dict]) => [locale, leaves(dict as Tree)] as const)

describe('сторож цен сам ловит цены (иначе его «чисто» ничего не значит)', () => {
  it.each(['от 500 €', 'Ціна: 300 грн', 'from 200 EUR', 'Стоимость пакета', 'Pricing', '1500 лей', '$99', 'від 1000'])(
    'ловит «%s»',
    (text) => expect(findPrices(text)).not.toEqual([]),
  )
  // скидки пакетов монтажа (правка Кати 01.11) — не цена: сторож их не должен браковать
  it.each(['с более чем 5-летним опытом', 'SMM Complete', 'Проект 03', '2 Reels', 'Кишинёв · Молдова · Одесса', 'Contacts', 'Пакет із 4 відео −10%', '12-video package −20%'])(
    'не трогает «%s»',
    (text) => expect(findPrices(text)).toEqual([]),
  )
})

describe('словари RU / UA / EN', () => {
  it('у всех языков одинаковый набор ключей', () => {
    const ruKeys = leaves(ru).map(([k]) => k)
    for (const [, entries] of all) expect(entries.map(([k]) => k)).toEqual(ruKeys)
  })

  it('пустых строк нет', () => {
    for (const [locale, entries] of all) for (const [key, value] of entries) expect(value.trim(), `${locale}: ${key}`).not.toBe('')
  })

  it('ни в одном языке нет цен (ТЗ §1, §15)', () => {
    for (const [locale, entries] of all)
      for (const [key, value] of entries) expect(findPrices(value), `${locale}: ${key} = «${value}»`).toEqual([])
  })

  it('запрещённых ТЗ фраз нет', () => {
    for (const [locale, entries] of all)
      for (const [key, value] of entries)
        for (const phrase of FORBIDDEN_PHRASES) expect(value.includes(phrase), `${locale}: ${key} содержит «${phrase}»`).toBe(false)
  })

  it('в EN нет кириллицы, в UA нет русских букв ы э ъ ё', () => {
    for (const [key, value] of leaves(dictionaries.en as Tree)) expect(/[А-Яа-яЁёІіЇїЄєҐґ]/.test(value), `en: ${key}`).toBe(false)
    for (const [key, value] of leaves(dictionaries.uk as Tree)) expect(/[ЫыЭэЪъЁё]/.test(value), `uk: ${key}`).toBe(false)
  })
})

describe('утверждённые RU-тексты дословно (ТЗ)', () => {
  it('Hero §4', () => {
    expect(`${ru.hero.firstName} / ${ru.hero.lastName}`).toBe('Екатерина / Сорока')
    expect(ru.hero.roles).toBe('SMM / Контент-креатор / Видеомонтаж')
    expect(ru.hero.caption1).toBe('Создаю визуальный характер брендов')
    expect(ru.hero.caption2).toBe('От стратегии → до готового контента')
    expect(ru.header.portfolio.toUpperCase()).toBe('ПОРТФОЛИО')
  })

  it('Обо мне §5 — ровно три абзаца; первый без лет (ответ Кати 01.11: «убирать 5 лет везде»)', () => {
    expect(ru.about.paragraphs).toEqual([
      'Создаю контент и продвигаю бизнесы через соцсети.',
      'Объединяю знания прикладной психологии и маркетинга, чтобы глубже понимать потребности клиентов и выстраивать коммуникацию, основанную на доверии, эмоциональном резонансе и взаимопонимании с аудиторией.',
      'Разрабатываю SMM-стратегии, создаю визуал, креативный монтаж, встраиваю автоворонки в контент.',
    ])
  })

  it('Навигация §3 — ровно шесть панелей', () => {
    expect(Object.values(ru.nav.items)).toEqual([
      'SMM / Стратегия',
      'Контент-съёмка',
      'Видеомонтаж',
      'Брендинг / Айдентика',
      'Портфолио',
      'Контакты',
    ])
  })

  it('SMM §7', () => {
    expect(ru.smm.intro).toBe(
      'От системного ведения социальных сетей до комплексного маркетингового сопровождения. Два формата сотрудничества в зависимости от целей и задач вашего бизнеса.',
    )
    expect(ru.smm.packages).toEqual({ base: 'SMM Base', complete: 'SMM Complete' })
    expect(ru.smm.footnote).toBe(
      'Количество платформ, перечень услуг и объём работ определяются индивидуально в зависимости от целей и задач проекта.',
    )
    expect(ru.smm.cta).toBe('Обсудить проект')
    // «Результаты моей работы» сняты 31.10: скриншоты Insights переехали в «Портфолио» (решение Кати)
  })

  it('Контент-съёмка §8', () => {
    expect(ru.shooting.intro).toBe(
      'Создаю фото- и видеоконтент, который передаёт атмосферу, характер и индивидуальность бренда. От идеи и визуальной концепции до готовых материалов для социальных сетей.',
    )
    expect(ru.shooting.geo).toBe('Кишинёв · Молдова · Одесса')
    expect(ru.shooting.geoNote).toBe('Выезд по Молдове и съёмки в Одессе — по предварительной договорённости.')
    expect(ru.shooting.cta).toBe('Обсудить съёмку')
  })

  it('Видеомонтаж §9', () => {
    expect(ru.editing.intro).toBe(
      'Превращаю исходные кадры в динамичные видео, которые удерживают внимание, передают настроение и помогают брендам выделяться в социальных сетях.',
    )
    expect(ru.editing.aiText).toBe(
      'Создание креативных видео с использованием искусственного интеллекта для брендов, рекламных кампаний и социальных сетей.',
    )
    expect(ru.editing.cta).toBe('Заказать монтаж')
  })

  it('Брендинг §10', () => {
    expect(ru.branding.text).toBe(
      'Разработка логотипа, фирменного стиля и визуальной концепции бренда. Подбор цветовой палитры, типографики и графических элементов для создания целостного и узнаваемого визуального образа.',
    )
    expect(ru.branding.directionsTitle).toBe('Направления работы')
    expect(ru.branding.directions).toEqual([
      'Разработка логотипа',
      'Фирменный стиль',
      'Цветовая палитра и типографика',
      'Графические элементы',
      'Визуальная концепция бренда',
    ])
    // «Мои проекты» сняты 31.10: работы брендинга — кейсами в «Портфолио» (решение Кати)
    expect(ru.branding.cta).toBe('Обсудить проект')
  })

  it('Портфолио §11 и Контакты §12', () => {
    expect(ru.portfolio.title).toBe('Портфолио')
    expect(ru.contacts.title).toBe('Контакты')
    expect(ru.contacts.text).toBe('Для сотрудничества и обсуждения проекта свяжитесь со мной удобным способом.')
  })
})
