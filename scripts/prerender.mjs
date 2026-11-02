/**
 * Пререндер: три языковые версии страницы готовыми HTML-файлами.
 *   dist/index.html (UA, первый язык по ответу Кати 31.10) · dist/ru/index.html (RU) · dist/en/index.html (EN)
 * Зачем: текст виден поисковикам и превью в мессенджерах без JS, первый экран рисуется сразу.
 * Заодно: мета-теги и OG на каждом языке, hreflang, sitemap, robots, OG-картинка, иконка для iOS, 404.html,
 * политика безопасности с хэшем единственного встроенного скрипта — в dist/_headers и в <meta> (для GitHub Pages).
 * Сами теги и разметка для поисковиков — в scripts/seo.mjs (там же география услуг).
 *
 * Адрес сайта задаётся при сборке: SITE_URL=https://домен npm run build.
 * Без него canonical, hreflang, og:url и sitemap не выводятся — выдуманный домен хуже пустого места, —
 * а страницы помечаются noindex: это предпросмотр.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { readdirSync, rmSync, statSync } from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'
import sharp from 'sharp'
import { LOCALES, headTags, jsonLd, robotsTxt, sitemapXml } from './seo.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')
const SITE_URL = (process.env.SITE_URL || '').replace(/\/+$/, '')

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const ssr = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)
const template = await readFile(path.join(dist, 'index.html'), 'utf8')

// Шрифты: предзагрузка латиницы и кириллицы убирает «прыжок» текста при подмене шрифта
const fonts = readdirSync(path.join(dist, 'assets')).filter((f) => /^manrope-(cyrillic|latin)-wght-normal.*\.woff2$/.test(f))

// OG-картинка 1200×630 из оригинала hero-портрета (лицо в кадре, без генерации)
await sharp(path.join(root, 'media-src', 'hero', 'hero.png'))
  .resize({ width: 1200, height: 630, fit: 'cover', position: sharp.strategy.attention })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(dist, 'og-image.jpg'))

// Иконка для экрана «Домой» на iOS: квадрат без скругления (маску iOS кладёт сама) и без прозрачности
const favicon = await readFile(path.join(root, 'public', 'favicon.svg'), 'utf8')
await sharp(Buffer.from(favicon.replace(/ rx="[\d.]+"/, '')), { density: 300 })
  .resize(180, 180)
  .flatten({ background: '#210E0C' })
  .png()
  .toFile(path.join(dist, 'apple-touch-icon.png'))

// Политика безопасности: разрешён только свой код и один встроенный скрипт выбора языка (по хэшу)
const inline = [...template.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((x) => x[1])
const hashes = inline.map((src) => `'sha256-${createHash('sha256').update(src).digest('base64')}'`)
const policy = [
  "default-src 'self'",
  `script-src 'self' ${hashes.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "media-src 'self'",
  // data: — Vite вшивает в CSS шрифтовые файлы меньше 4 КБ (кусок Manrope), без него шрифт блокируется
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
]
// GitHub Pages заголовков из _headers не отдаёт — та же политика едет и в <meta>.
// frame-ancestors и upgrade-insecure-requests в <meta> браузер не принимает, они остаются только в заголовке.
const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${policy.join('; ')}" />`

const names = LOCALES.map((l) => ssr.heroName(l.code))

function headFor(locale, i) {
  const m = ssr.meta(locale.code)
  const ld = jsonLd({
    locale,
    siteUrl: SITE_URL,
    name: names[i],
    alternateName: names.filter((n, j) => j !== i && n !== names[i]),
    jobTitle: ssr.roles(locale.code),
    description: m.description,
    sameAs: Object.values(ssr.contacts).filter(Boolean),
    services: ssr.services(locale.code),
  })
  return headTags({ locale, meta: { ...m, siteName: names[i] }, siteUrl: SITE_URL, heroSrcset: ssr.heroImage?.srcset.avif, fonts, ld }).join(
    '\n    ',
  )
}

let firstHtml = ''
for (const [i, locale] of LOCALES.entries()) {
  const m = ssr.meta(locale.code)
  const html = template
    .replace('<html lang="uk">', `<html lang="${locale.code}">`)
    .replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    ${cspMeta}`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(m.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(m.description)}" />`)
    .replace('<!--head-->', headFor(locale, i))
    .replace('<!--app-html-->', ssr.render(locale.code))
  const out = path.join(dist, locale.path, 'index.html')
  await mkdir(path.dirname(out), { recursive: true })
  await writeFile(out, html)
  if (!firstHtml) firstHtml = html
  console.log(`✓ ${locale.code.toUpperCase()} → ${path.relative(root, out)}`)
}

// 404: GitHub Pages и Cloudflare Pages отдают dist/404.html на любой несуществующий адрес.
// Это украинская страница целиком (адрес не из трёх языков → клиент тоже берёт uk), закрытая от индекса.
const page404 = firstHtml
  .replace(/\s*<meta name="robots" content="[^"]*" \/>/, '')
  .replace('<meta charset="UTF-8" />', '<meta charset="UTF-8" />\n    <meta name="robots" content="noindex" />')
  .replace(/\s*<link rel="canonical"[^>]*>/, '')
  .replace(/\s*<link rel="alternate" hreflang[^>]*>/g, '')
await writeFile(path.join(dist, '404.html'), page404)

// robots и sitemap
await writeFile(path.join(dist, 'robots.txt'), robotsTxt(SITE_URL))
const sitemap = sitemapXml(SITE_URL, new Date().toISOString().slice(0, 10))
if (sitemap) await writeFile(path.join(dist, 'sitemap.xml'), sitemap)

// Заголовки безопасности для хостингов, которые читают _headers (Cloudflare Pages, Netlify)
const csp = [...policy, "frame-ancestors 'none'", 'upgrade-insecure-requests'].join('; ')
await writeFile(
  path.join(dist, '_headers'),
  `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Cross-Origin-Opener-Policy: same-origin
  Strict-Transport-Security: max-age=63072000; includeSubDomains

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/media/*
  Cache-Control: public, max-age=2592000
`,
)

// Хостинг: у Cloudflare Pages потолок 25 МиБ на файл (самый тяжёлый ролик 01.11 — anna-soul-1/02-reel, 24,7 МиБ).
// Тяжелее — сборка падает здесь, а не выкладка на хостинге. MAX_FILE_MIB — только для проверки самой проверки.
const MAX_FILE = Number(process.env.MAX_FILE_MIB || 25) * 1024 * 1024
const heavy = readdirSync(dist, { recursive: true, withFileTypes: true })
  .filter((e) => e.isFile())
  .map((e) => path.join(e.parentPath, e.name))
  .filter((f) => statSync(f).size > MAX_FILE)
if (heavy.length) {
  for (const f of heavy) console.error(`✗ ${path.relative(dist, f)}: ${(statSync(f).size / 2 ** 20).toFixed(1)} МиБ — пережать`)
  process.exit(1)
}

rmSync(ssrDir, { recursive: true, force: true })
console.log(`✓ 404.html, og-image.jpg, apple-touch-icon.png, robots.txt${sitemap ? ', sitemap.xml' : ''}, _headers + <meta> CSP (${hashes.length} хэш)`)
if (!SITE_URL) console.log('ℹ SITE_URL не задан: предпросмотр — noindex, без canonical, hreflang, og:url и sitemap. Для боевой сборки задать домен.')
