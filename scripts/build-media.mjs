/**
 * Медиа-конвейер: media-src/ → public/media/ + src/content/media.generated.json
 *
 * Катя присылает исходники → они кладутся в media-src/<раздел>/ → `npm run media`.
 * Фото: AVIF + WebP + JPEG в нескольких ширинах, крошечное размытое превью (LQIP).
 * Видео: MP4 H.264 с быстрым стартом, постер — кадр 0,5 с или `posterAt`. Готовое не пересобирается.
 * Полноразмерный кадр для постера — промежуточный файл: лежит в .media-cache/, в сборку сайта не попадает.
 * Подписи и alt-тексты на трёх языках — в media-src/<папка>/meta.json (см. media-src/README.md).
 */
import { readdir, mkdir, stat, readFile, writeFile, rm, rmdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import sharp from 'sharp'

const run = promisify(execFile)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(root, 'media-src')
const OUT = path.join(root, 'public', 'media')
const CACHE = path.join(root, '.media-cache')
const MANIFEST = path.join(root, 'src', 'content', 'media.generated.json')
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg'
const FFPROBE = process.env.FFPROBE_PATH || 'ffprobe'

// Без оригиналов конвейер счёл бы все готовые медиа лишними и стёр бы public/media целиком.
// В репозитории сайта оригиналов нет (хранятся отдельно), а готовые файлы уже лежат в public/media.
if (!existsSync(path.join(SRC, 'portfolio'))) {
  console.error('✗ Нет media-src/portfolio — оригиналов нет, остановился. Готовые медиа уже в public/media, для сборки сайта эта команда не нужна.')
  process.exit(1)
}

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff'])
const VIDEO_EXT = new Set(['.mp4', '.mov', '.m4v', '.webm'])
const WIDTHS = [480, 768, 1080, 1440, 1920]
const FORMATS = {
  avif: (img) => img.avif({ quality: 55, effort: 5 }),
  webp: (img) => img.webp({ quality: 78 }),
  jpg: (img) => img.jpeg({ quality: 80, mozjpeg: true }),
}

const toPosix = (p) => p.split(path.sep).join('/')
const written = new Set()

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else out.push(full)
  }
  return out
}

async function isFresh(source, target) {
  if (!existsSync(target)) return false
  const [s, t] = await Promise.all([stat(source), stat(target)])
  return t.mtimeMs >= s.mtimeMs
}

async function loadMeta(dir) {
  const file = path.join(dir, 'meta.json')
  if (!existsSync(file)) return {}
  return JSON.parse(await readFile(file, 'utf8'))
}

async function processImage(input, key) {
  const base = sharp(input, { failOn: 'none' }).rotate()
  // rotate() разворачивает кадр по EXIF, поэтому размеры берём уже повёрнутые
  const m = await sharp(input).metadata()
  const width = m.autoOrient?.width ?? m.width
  const height = m.autoOrient?.height ?? m.height
  const widths = [...new Set([...WIDTHS.filter((w) => w < width), Math.min(width, 1920)])].sort((a, b) => a - b)
  const srcset = {}
  for (const [fmt, encode] of Object.entries(FORMATS)) {
    const parts = []
    for (const w of widths) {
      const rel = `${key}-${w}.${fmt}`
      const target = path.join(OUT, rel)
      written.add(path.normalize(target))
      if (!(await isFresh(input, target))) {
        await mkdir(path.dirname(target), { recursive: true })
        await encode(base.clone().resize({ width: w, withoutEnlargement: true })).toFile(target)
      }
      parts.push(`/media/${rel} ${w}w`)
    }
    srcset[fmt] = parts.join(', ')
  }
  const lqipBuf = await base.clone().resize({ width: 24 }).webp({ quality: 40 }).toBuffer()
  const mid = widths.find((w) => w >= 1080) ?? widths[widths.length - 1]
  return {
    w: width,
    h: height,
    src: `/media/${key}-${mid}.jpg`,
    srcset,
    lqip: `data:image/webp;base64,${lqipBuf.toString('base64')}`,
  }
}

async function probe(input) {
  const { stdout } = await run(FFPROBE, [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height:stream_side_data=rotation:format=duration',
    '-of', 'json', input,
  ])
  const data = JSON.parse(stdout)
  const s = data.streams?.[0] ?? {}
  const rotation = Math.abs(Number(s.side_data_list?.[0]?.rotation ?? 0))
  const swap = rotation === 90 || rotation === 270
  return {
    w: swap ? s.height : s.width,
    h: swap ? s.width : s.height,
    duration: Number(Number(data.format?.duration ?? 0).toFixed(2)),
  }
}

/** posterAt — секунда кадра-обложки из meta.json; по умолчанию 0,5 с (у роликов с затемнением в начале кадр чёрный) */
async function processVideo(input, key, posterAt) {
  const info = await probe(input)
  const rel = `${key}.mp4`
  const target = path.join(OUT, rel)
  written.add(path.normalize(target))
  if (!(await isFresh(input, target))) {
    await mkdir(path.dirname(target), { recursive: true })
    // Длинная сторона не больше 1920, чётные размеры, H.264 + faststart: играет везде, грузится быстро
    await run(FFMPEG, [
      '-y', '-i', input,
      '-vf', "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))'",
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', target,
    ])
  }
  const posterSrc = path.join(CACHE, `${key}.poster-source.png`)
  written.add(path.normalize(posterSrc))
  await mkdir(path.dirname(posterSrc), { recursive: true })
  // meta.json правили позже постера — возможно, сменили posterAt: кадр пересобираем
  const metaFile = path.join(path.dirname(input), 'meta.json')
  const posterFresh = (await isFresh(input, posterSrc)) && (!existsSync(metaFile) || (await isFresh(metaFile, posterSrc)))
  if (!posterFresh) {
    const at = posterAt ?? 0.5
    await run(FFMPEG, ['-y', '-ss', String(Math.min(at, info.duration / 2)), '-i', input, '-frames:v', '1', posterSrc])
  }
  const poster = await processImage(posterSrc, `${key}.poster`)
  return { src: `/media/${rel}`, w: info.w, h: info.h, duration: info.duration, poster }
}

async function removeStale(dir) {
  if (!existsSync(dir)) return 0
  let removed = 0
  for (const file of await walk(dir)) {
    if (!written.has(path.normalize(file))) {
      await rm(file)
      removed++
    }
  }
  await removeEmptyDirs(dir)
  return removed
}

/** После переименования или слияния кейсов от старых папок остаются пустые каталоги — убираем их. */
async function removeEmptyDirs(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const sub = path.join(dir, entry.name)
    await removeEmptyDirs(sub)
    if ((await readdir(sub)).length === 0) await rmdir(sub) // rmdir удаляет только пустую папку
  }
}

async function main() {
  const files = (await walk(SRC)).filter((f) => {
    const ext = path.extname(f).toLowerCase()
    return IMAGE_EXT.has(ext) || VIDEO_EXT.has(ext)
  })
  const manifest = { images: {}, videos: {}, dirs: {} }
  const metaCache = new Map()

  for (const file of files.sort()) {
    const rel = toPosix(path.relative(SRC, file))
    const ext = path.extname(rel)
    const key = rel.slice(0, -ext.length)
    const dir = path.posix.dirname(key)
    const name = path.posix.basename(key)
    if (!metaCache.has(dir)) metaCache.set(dir, await loadMeta(path.dirname(file)))
    const meta = metaCache.get(dir)[name] ?? {}

    process.stdout.write(`• ${rel} … `)
    const entry = VIDEO_EXT.has(ext.toLowerCase()) ? await processVideo(file, key, meta.posterAt) : await processImage(file, key)
    if (meta.alt) entry.alt = meta.alt
    if (meta.title) entry.title = meta.title
    if (meta.kind) entry.kind = meta.kind
    if (VIDEO_EXT.has(ext.toLowerCase())) manifest.videos[key] = entry
    else manifest.images[key] = entry
    ;(manifest.dirs[dir] ??= []).push(key)
    console.log('ok')
  }

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
  const removed = await removeStale(OUT)
  await removeStale(CACHE)
  console.log(
    `\nГотово: ${Object.keys(manifest.images).length} изображений, ${Object.keys(manifest.videos).length} видео.` +
      (removed ? ` Удалено устаревших файлов: ${removed}.` : ''),
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
