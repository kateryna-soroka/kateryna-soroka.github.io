import { describe, expect, it } from 'vitest'
import { LOCALES, headTags, jsonLd, robotsTxt, sitemapXml } from '../../scripts/seo.mjs'
import { findPrices } from '../../scripts/price-patterns.mjs'
import { dictionaries } from '../../src/content/i18n'

const SITE = 'https://example.org'
const ru = LOCALES.find((l) => l.code === 'ru')!
const meta = { ...dictionaries.ru.meta, siteName: 'Екатерина Сорока' }
const services = [
  { name: 'SMM / Стратегия', remote: true },
  { name: 'Контент-съёмка', remote: false },
]
const ld = (siteUrl?: string) =>
  jsonLd({ locale: ru, siteUrl, name: 'Екатерина Сорока', jobTitle: 'SMM', description: meta.description, services })

describe('SEO: предпросмотр и боевая сборка', () => {
  it('без адреса сайта — noindex, нет canonical, hreflang, sitemap', () => {
    const head = headTags({ locale: ru, meta }).join('\n')
    expect(head).toContain('<meta name="robots" content="noindex, nofollow" />')
    expect(head).not.toContain('canonical')
    expect(head).not.toContain('hreflang')
    expect(robotsTxt()).not.toContain('Sitemap')
    expect(sitemapXml(undefined, '2026-11-01')).toBeNull()
    expect(JSON.stringify(ld())).not.toContain('example.org')
  })

  it('с адресом — индексируется: canonical своей версии, hreflang трёх языков и x-default', () => {
    const head = headTags({ locale: ru, meta, siteUrl: SITE + '/' }).join('\n')
    expect(head).not.toContain('noindex')
    expect(head).toContain(`<link rel="canonical" href="${SITE}/ru/" />`)
    for (const l of LOCALES) expect(head).toContain(`hreflang="${l.code}" href="${SITE}${l.path}"`)
    expect(head).toContain(`hreflang="x-default" href="${SITE}/"`)
    expect(robotsTxt(SITE)).toContain(`Sitemap: ${SITE}/sitemap.xml`)
  })

  it('sitemap: три адреса, у каждого все языковые версии и дата', () => {
    const xml = sitemapXml(SITE, '2026-11-01')!
    expect(xml.match(/<loc>/g)).toHaveLength(3)
    expect(xml.match(/hreflang="x-default"/g)).toHaveLength(3)
    expect(xml.match(/<lastmod>2026-11-01<\/lastmod>/g)).toHaveLength(3)
  })

  it('английская версия — британская локаль (Кипр, ЕС)', () => {
    expect(LOCALES.find((l) => l.code === 'en')!.og).toBe('en_GB')
  })
})

describe('SEO: разметка услуг', () => {
  const person = ld(SITE)['@graph'].find((n) => n['@type'] === 'Person') as {
    makesOffer: { itemOffered: { name: string; areaServed: { name: string }[] } }[]
  }
  const area = (name: string) => person.makesOffer.find((o) => o.itemOffered.name === name)!.itemOffered.areaServed.map((a) => a.name)

  it('удалённые услуги — Кипр и Европа, съёмки — только города из ТЗ', () => {
    expect(area('SMM / Стратегия')).toEqual(['Cyprus', 'Europe'])
    expect(area('Контент-съёмка')).toEqual(['Chișinău', 'Moldova', 'Odesa'])
  })

  it('в разметке нет цен, а адрес и id есть только с доменом', () => {
    const json = JSON.stringify(ld(SITE))
    expect(findPrices(json)).toEqual([])
    expect(json).not.toMatch(/"price/)
    expect(json).toContain(`"@id":"${SITE}/#person"`)
  })

  it('мета-описания в лимите выдачи и тоже без цен', () => {
    for (const d of Object.values(dictionaries)) {
      expect(d.meta.title.length).toBeLessThanOrEqual(60)
      expect(d.meta.description.length).toBeLessThanOrEqual(160)
      expect(findPrices(d.meta.title + ' ' + d.meta.description)).toEqual([])
    }
  })
})
