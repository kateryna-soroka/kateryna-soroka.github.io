/**
 * Разметка для поисковиков — чистые функции: собирает scripts/prerender.mjs, проверяет tests/unit/seo.test.ts.
 *
 * География услуг: удалённые (SMM, монтаж, AI-видео, брендинг) — Кипр и Европа; съёмки — Кишинёв, Молдова, Одесса.
 * Живёт только в JSON-LD, видимый текст не меняет.
 *
 * Без адреса сайта (SITE_URL) сборка считается предпросмотром: noindex, без canonical, hreflang и sitemap —
 * чтобы временная ссылка не попала в индекс и потом не спорила с настоящим доменом.
 */

/** en_GB, а не en_US: британский английский — норма для Кипра и ЕС. */
export const LOCALES = [
  { code: 'uk', path: '/', og: 'uk_UA' },
  { code: 'ru', path: '/ru/', og: 'ru_RU' },
  { code: 'en', path: '/en/', og: 'en_GB' },
]

export const REMOTE_AREA = [
  { '@type': 'Country', name: 'Cyprus' },
  { '@type': 'Continent', name: 'Europe' },
]

export const SHOOT_AREA = [
  { '@type': 'City', name: 'Chișinău' },
  { '@type': 'Country', name: 'Moldova' },
  { '@type': 'City', name: 'Odesa' },
]

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const clean = (url) => (url || '').replace(/\/+$/, '')

/** Теги <head> для одной языковой версии. */
export function headTags({ locale, meta, siteUrl, heroSrcset, fonts = [], ld }) {
  const site = clean(siteUrl)
  const abs = (p) => `${site}${p}`
  const tags = []
  if (site) {
    tags.push(`<link rel="canonical" href="${abs(locale.path)}" />`)
    for (const l of LOCALES) tags.push(`<link rel="alternate" hreflang="${l.code}" href="${abs(l.path)}" />`)
    tags.push(`<link rel="alternate" hreflang="x-default" href="${abs('/')}" />`)
    tags.push(`<meta property="og:url" content="${abs(locale.path)}" />`)
    tags.push(`<meta property="og:image" content="${abs('/og-image.jpg')}" />`)
    tags.push(`<meta property="og:image:width" content="1200" />`, `<meta property="og:image:height" content="630" />`)
    tags.push(`<meta property="og:image:alt" content="${esc(meta.ogAlt)}" />`)
  } else {
    tags.push(`<meta name="robots" content="noindex, nofollow" />`)
  }
  tags.push(
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(meta.siteName)}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:locale" content="${locale.og}" />`,
    ...LOCALES.filter((l) => l.code !== locale.code).map((l) => `<meta property="og:locale:alternate" content="${l.og}" />`),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`,
  )
  if (heroSrcset) {
    tags.push(
      `<link rel="preload" as="image" type="image/avif" imagesrcset="${heroSrcset}" imagesizes="(min-width: 1024px) 60vw, 100vw" fetchpriority="high" />`,
    )
  }
  for (const f of fonts) tags.push(`<link rel="preload" as="font" type="font/woff2" href="/assets/${f}" crossorigin />`)
  if (ld) tags.push(`<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`)
  return tags
}

/**
 * Связка WebSite + Person: кто она, на каких языках, что делает и где. Цен нет (ТЗ §1) —
 * услуги идут как Offer без price, только название и география.
 */
export function jsonLd({ locale, siteUrl, name, alternateName = [], jobTitle, description, sameAs = [], services = [] }) {
  const site = clean(siteUrl)
  const ids = site ? { person: `${site}/#person`, website: `${site}/#website` } : null
  const person = {
    '@type': 'Person',
    ...(ids ? { '@id': ids.person, url: `${site}${locale.path}`, image: `${site}/og-image.jpg` } : {}),
    name,
    ...(alternateName.length ? { alternateName } : {}),
    jobTitle,
    description,
    knowsLanguage: LOCALES.map((l) => l.code),
    knowsAbout: ['SMM', 'Instagram', 'Reels', 'Content creation', 'Video editing', 'Branding', 'AI video'],
    makesOffer: services.map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.name, areaServed: s.remote ? REMOTE_AREA : SHOOT_AREA },
    })),
    ...(sameAs.length ? { sameAs } : {}),
  }
  const website = {
    '@type': 'WebSite',
    ...(ids ? { '@id': ids.website, url: `${site}/`, publisher: { '@id': ids.person } } : {}),
    name,
    inLanguage: locale.code,
  }
  return { '@context': 'https://schema.org', '@graph': [website, person] }
}

export function robotsTxt(siteUrl) {
  const site = clean(siteUrl)
  return ['User-agent: *', 'Allow: /', ...(site ? [`Sitemap: ${site}/sitemap.xml`] : [])].join('\n') + '\n'
}

/** Карта сайта: три версии, у каждой — ссылки на остальные и x-default. Без адреса сайта карты нет. */
export function sitemapXml(siteUrl, lastmod) {
  const site = clean(siteUrl)
  if (!site) return null
  const alt = [
    ...LOCALES.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.code}" href="${site}${l.path}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${site}/"/>`,
  ].join('\n')
  const urls = LOCALES.map(
    (l) => `  <url>\n    <loc>${site}${l.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alt}\n  </url>`,
  ).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`
}
