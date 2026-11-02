type L = { ru: string; uk: string; en: string }

/**
 * Портфолио (ТЗ §11). Папка на сайте = тип работы (правка Кати 01.11 ночью). Внутри два устройства:
 *
 * `slides` — папка-коллаж (правка Кати 01.11 днём: «чтобы на одном слайде было размещено по 2–4 фото/видео»,
 *   «чтобы сразу один сторителлинг был на одном слайде»). Слайд = кейс, файлы — в
 *   media-src/portfolio/<slug>/<dir>/, порядок — по имени файла (01-…, 02-…), как в её альбоме.
 *   Подпись под коллажем — проект слайда. Слайд из двух кейсов («оптика и кинолог соедини в одном слайде») —
 *   `projects`: проект каждой работы по порядку, подпись тогда под каждой.
 * `projects` — папка поштучно: работа = слайд, проект — подпапка media-src/portfolio/<slug>/<проект>/.
 *
 * `cover` — путь обложки внутри папки без расширения ('wow/01-hair'); по умолчанию первая работа.
 * `coverZoom` — приблизить обложку, когда квадратная обрезка цепляет подпись: во сколько раз и к какой
 *   точке кадра прижато (CSS transform-origin). Полноэкранный просмотр показывает файл целиком.
 * `coverImage` — обложка не из папки, а из media-src/covers/: кадр её же работы, вырезанный по центру и, где квадрат
 *   исходника режет строки, положенный на поля цвета фона (01.11: «Централизуй, чтобы красиво было»).
 * Названия заказчиков и ниш — только те, что назвала Катя.
 */
export const PROJECTS = {
  wow: {
    title: { ru: 'WOW Beauty Lab', uk: 'WOW Beauty Lab', en: 'WOW Beauty Lab' },
    about: { ru: 'Салон красоты на Кипре', uk: 'Салон краси на Кіпрі', en: 'Beauty salon in Cyprus' },
  },
  'anna-soul': {
    title: { ru: 'Anna Soul', uk: 'Anna Soul', en: 'Anna Soul' },
    about: { ru: 'Бренд детских кутюрных платьев', uk: 'Бренд дитячих кутюрних суконь', en: 'Kids’ couture dress brand' },
  },
  fashion: {
    title: { ru: 'Fashion', uk: 'Fashion', en: 'Fashion' },
  },
  sculpcher: {
    title: { ru: 'Sculpcher', uk: 'Sculpcher', en: 'Sculpcher' },
    about: { ru: 'Салон красоты', uk: 'Салон краси', en: 'Beauty salon' },
  },
  psychologist: {
    title: { ru: 'Психолог', uk: 'Психолог', en: 'Psychologist' },
  },
  inout: {
    title: { ru: 'InOut', uk: 'InOut', en: 'InOut' },
    about: { ru: 'Школа актёрского мастерства', uk: 'Школа акторської майстерності', en: 'Acting school' },
  },
  clinic: {
    title: { ru: 'Клиника репродуктивного здоровья', uk: 'Клініка репродуктивного здоров’я', en: 'Reproductive health clinic' },
  },
  // ответы Кати 01.11 днём
  numerologist: {
    title: { ru: 'Нумеролог', uk: 'Нумеролог', en: 'Numerologist' },
  },
  backstage: {
    title: { ru: 'Backstage', uk: 'Backstage', en: 'Backstage' },
  },
  ambitna: {
    title: { ru: 'Ambitna', uk: 'Ambitna', en: 'Ambitna' },
    about: { ru: 'Бренд женской одежды', uk: 'Бренд жіночого одягу', en: 'Women’s clothing brand' },
  },
  homewear: {
    title: { ru: 'Одежда для дома', uk: 'Одяг для дому', en: 'Homewear' },
  },
  'numerology-notebooks': {
    title: { ru: 'Нумерологические блокноты', uk: 'Нумерологічні блокноти', en: 'Numerology notebooks' },
  },
  sexologist: {
    title: { ru: 'Сексолог', uk: 'Сексолог', en: 'Sexologist' },
  },
  balensimaga: {
    title: { ru: 'Balensimaga', uk: 'Balensimaga', en: 'Balensimaga' },
    about: { ru: 'Бренд одежды', uk: 'Бренд одягу', en: 'Clothing brand' },
  },
  laser: {
    title: { ru: 'Лазерная эпиляция', uk: 'Лазерна епіляція', en: 'Laser hair removal' },
  },
  colorist: {
    title: { ru: 'Колорист', uk: 'Колорист', en: 'Hair colorist' },
  },
  cbt: {
    title: { ru: 'Центр КПТ', uk: 'Центр КПТ', en: 'CBT center' },
  },
  'dog-trainer': {
    title: { ru: 'Кинолог', uk: 'Кінолог', en: 'Dog trainer' },
  },
  optics: {
    title: { ru: 'Оптика', uk: 'Оптика', en: 'Optical store' },
  },
  'permanent-makeup': {
    title: { ru: 'Перманентный макияж', uk: 'Перманентний макіяж', en: 'Permanent makeup' },
  },
  'kids-tales': {
    title: { ru: 'Поздравления-сказки для детей', uk: 'Привітання-казки для дітей', en: 'Fairy-tale greetings for kids' },
  },
  investor: {
    title: { ru: 'Инвестор', uk: 'Інвестор', en: 'Investor' },
  },
  // 01.11 14:49: «собери ещё кейсы с этой статистикой, но не указывай бренды. Чисто описание. Это 3 отдельных проекта».
  // Ниши она не назвала — подпись = результат словами её же слайда (вопрос про нишу — Кате)
  'smm-reach-46': {
    title: { ru: 'Охваты ×46 за 30 дней без рекламы', uk: 'Охоплення ×46 за 30 днів без реклами', en: 'Reach ×46 in 30 days, no ads' },
  },
  'smm-reach-10': {
    title: { ru: 'Охваты почти ×10 за 30 дней без рекламы', uk: 'Охоплення майже ×10 за 30 днів без реклами', en: 'Reach almost ×10 in 30 days, no ads' },
  },
} satisfies Record<string, { title: L; about?: L }>

export type ProjectKey = keyof typeof PROJECTS

export interface SlideDef {
  /** подпапка слайда: media-src/portfolio/<slug>/<dir>/ */
  dir: string
  /** проект слайда — подпись под коллажем */
  project?: ProjectKey
  /** слайд из двух кейсов: проект каждой работы по порядку файлов */
  projects?: ProjectKey[]
  /** строка под подписью */
  note?: L
}

export interface PortfolioCase {
  slug: string
  title: L
  /** папка-коллаж: слайд = кейс из нескольких работ */
  slides?: SlideDef[]
  /** папка поштучно: работа = слайд, проект — подпапка */
  projects?: ProjectKey[]
  cover?: string
  /** ключ медиа в media-src/covers/ ('covers/identity'); главнее `cover` */
  coverImage?: string
  coverZoom?: { scale: number; origin: string }
  /** какая часть кадра попадает в квадрат превью (CSS object-position); по умолчанию середина */
  coverPosition?: string
}

export const PORTFOLIO_ITEMS: readonly PortfolioCase[] = [
  {
    slug: 'reels',
    title: { ru: 'Монтаж Reels', uk: 'Монтаж Reels', en: 'Reels editing' },
    // обложки папок выбрала Катя 01.11 15:42; монтаж 16:21 — «Сюда поставь вот с первого фото обложку»: первое видео Ambitna
    cover: 'ambitna/01-reel',
    // слайды в порядке, в каком Катя прислала «папку монтаж по слайдам»
    slides: [
      { dir: 'sculpcher', project: 'sculpcher' },
      // отзыв психолога — про монтаж её ролика, поэтому на одном слайде с роликом
      { dir: 'psychologist', project: 'psychologist' },
      // «указать ниже также, что тут была моя съёмка»; четвёртый ролик — «к этому слайду добавить ещё видео»
      {
        dir: 'wow',
        project: 'wow',
        note: { ru: 'Съёмка и монтаж — мои', uk: 'Зйомка та монтаж — мої', en: 'Shot and edited by me' },
      },
      { dir: 'fashion', project: 'fashion' },
      // «1 видео — кейс нумеролог, 2 видео — кейс backstage»
      { dir: 'numerologist-backstage', projects: ['numerologist', 'backstage'] },
      { dir: 'anna-soul-1', project: 'anna-soul' },
      { dir: 'anna-soul-2', project: 'anna-soul' },
      { dir: 'ambitna', project: 'ambitna' },
      { dir: 'homewear', project: 'homewear' },
    ],
  },
  {
    slug: 'stories',
    title: { ru: 'Stories', uk: 'Stories', en: 'Stories' },
    // «Обложка сторис» — ролик ANNA SOUL AW'25
    cover: 'anna-soul/01-stories-video',
    slides: [
      { dir: 'inout', project: 'inout' },
      // «один слайд (если сильно мелко — предложи альтернативу)»: она прислала три коллажа по три сторис, на телефоне
      // текст в них не читается — нарезаны на девять отдельных, раскладка 3 × 3 как у неё, каждую можно открыть крупно
      { dir: 'psychologist', project: 'psychologist' },
      { dir: 'clinic', project: 'clinic' },
      { dir: 'anna-soul', project: 'anna-soul' },
      // ролик с красным платьем стоял в монтаже, Катя: «это сторис». В её слайд Anna Soul он не вошёл — рядом, отдельно
      { dir: 'anna-soul-red-dress', project: 'anna-soul' },
      { dir: 'numerology-notebooks', project: 'numerology-notebooks' },
      // «папка сторис, один слайд»: брови 30/03 и педикюр 13/03 — по слайду на сторителлинг
      { dir: 'wow-brows', project: 'wow' },
      { dir: 'wow-pedicure', project: 'wow' },
    ],
  },
  {
    // «Сделать отдельно папку рекламных креативов»
    slug: 'ads',
    title: { ru: 'Рекламные креативы', uk: 'Рекламні креативи', en: 'Ad creatives' },
    // «Обложка креативы» — вебинар психолога. В квадрат — верх кадра: заголовок «Вебінар…» и цена целиком.
    // 17:19 «Сдвинь еще немного выше»: кадр 1080×1920 поднят на 168 px — низ квадрата режет фон между 2-м и 3-м
    // пунктом (текст 1147–1225 и 1267–1346 px), а не строку, заголовок начинается с 64 px
    cover: 'psychologist/01-ad',
    coverPosition: '50% 20%',
    slides: [
      { dir: 'sexologist', project: 'sexologist' },
      { dir: 'balensimaga', project: 'balensimaga' },
      { dir: 'psychologist', project: 'psychologist' },
      { dir: 'laser', project: 'laser' },
      { dir: 'ambitna', project: 'ambitna' },
      { dir: 'colorist', project: 'colorist' },
      // два альбома «КЕЙС Центр КПТ» — один кейс, один слайд
      { dir: 'cbt', project: 'cbt' },
      // «кейс оптика и кинолог соедини в одном слайде»
      { dir: 'dog-trainer-optics', projects: ['dog-trainer', 'optics'] },
      // бывший «Монтаж кейс бьюти»: «это тоже в папку рекламные креативы, кейс перманентный макияж»
      { dir: 'permanent-makeup', project: 'permanent-makeup' },
      { dir: 'kids-tales', project: 'kids-tales' },
      { dir: 'investor', project: 'investor' },
    ],
  },
  {
    // «Результаты smm ведения не должны быть вместе с монтажем рилс» — отдельная папка
    slug: 'smm-results',
    title: { ru: 'Статистика SMM', uk: 'Статистика SMM', en: 'SMM results' },
    // 01.11 15:53: «вырезать саму статистику… чтобы было в одном дизайне. Все кейсы по статистике» — из её
    // оформленных слайдов вырезаны карточки Instagram (find_cards: белые области на цветном фоне), слайд = кейс-коллаж,
    // как у WOW. Её слайды целиком — в brief/removed_2026-11-01_stats_designs
    // 16:22 «Централизуй, чтобы красиво было… нужна обложка какая-то, дай вариант» — блок «57 345 просмотров» со скрина
    // WOW за 30 дней по центру белого квадрата (фон скрина тоже белый). 17:04 она попробовала вариант 2 (рилс WOW
    // «80,6 тыс.»), 17:19 «Верни вариант 1 обложки в статистику»
    coverImage: 'covers/smm-results',
    slides: [
      {
        dir: 'anna-soul',
        project: 'anna-soul',
        // 15:36 «Плохое качество», 16:20 «Нет оригинала перегенерируй в хорошем качестве»: карточки пересобраны в вёрстке
        // старого экрана статистики Instagram с цифрами её слайда — brief/anna-soul-stats-recreated/cards.html
        note: { ru: 'Просмотры рилсов: 1,8 млн · 357 тыс. · 107 тыс.', uk: 'Перегляди рілс: 1,8 млн · 357 тис. · 107 тис.', en: 'Reel views: 1.8M · 357K · 107K' },
      },
      // «вот это все на один слайд, и это можно подписать что wow beauty кейс»
      { dir: 'wow', project: 'wow' },
      { dir: 'smm-reach-46', project: 'smm-reach-46' },
      { dir: 'smm-reach-10', project: 'smm-reach-10' },
    ],
  },
  {
    // ответ Кати 01.11: «это айдентика, фирменный стиль»
    slug: 'identity',
    title: { ru: 'Айдентика и фирменный стиль', uk: 'Айдентика і фірмовий стиль', en: 'Brand identity' },
    projects: ['wow'],
    // 16:22 «сделай красиво… лого на обложку или ресайз фото, чтобы оно полностью поместилось» — знак WOW с подписью из
    // левой панели 02-logo, квадрат по центру знака
    coverImage: 'covers/identity',
  },
  {
    slug: 'print',
    title: { ru: 'Полиграфия', uk: 'Поліграфія', en: 'Print design' },
    projects: ['anna-soul'],
  },
  {
    slug: 'ai-video',
    title: { ru: 'AI-видео', uk: 'AI-відео', en: 'AI video' },
    projects: [],
  },
]
