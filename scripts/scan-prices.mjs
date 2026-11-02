/**
 * Проверка собранного сайта (ТЗ §16, п. 5): во всех трёх языковых версиях нет цен,
 * запрещённых фраз, формы и почты. Смотрит видимый текст, alt/aria-label/title,
 * мета-теги и разметку для поисковиков. Словари целиком проверяют юнит-тесты.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FORBIDDEN_PHRASES, findPrices } from './price-patterns.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pages = ['index.html', 'ru/index.html', 'en/index.html']
let problems = 0

for (const page of pages) {
  const html = await readFile(path.join(root, 'dist', page), 'utf8')
  const ldJson = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1])
  const visible = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
  const attrs = [...html.matchAll(/\s(?:alt|aria-label|title|content|placeholder)="([^"]*)"/g)].map((m) => m[1])
  const chunks = [visible, ...attrs, ...ldJson]

  const found = new Set()
  for (const chunk of chunks) for (const hit of findPrices(chunk)) found.add(hit)
  for (const phrase of FORBIDDEN_PHRASES) if (visible.includes(phrase)) found.add(`запрещённая фраза «${phrase}»`)
  if (/<form[\s>]/i.test(html)) found.add('форма')
  if (/<(input|textarea|select)[\s>]/i.test(html)) found.add('поле ввода')
  if (/mailto:|@[a-z0-9-]+\.[a-z]{2,}/i.test(visible + attrs.join(' '))) found.add('email')

  if (found.size) {
    problems += found.size
    console.error(`✗ ${page}: ${[...found].join(', ')}`)
  } else {
    console.log(`✓ ${page}: цен, форм, почты и запрещённых фраз нет`)
  }
}

if (problems) process.exit(1)
