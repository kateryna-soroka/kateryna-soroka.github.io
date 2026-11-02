/**
 * Контакты — единственное место, где они живут.
 * ТЗ §12: ровно два способа связи. Ссылки прислала Катя 01.11 (из WhatsApp-ссылки убран хвост «?s=p» от кнопки «поделиться»).
 * Пустое поле — на сайте пометка «Ссылка будет добавлена». Выдуманных адресов здесь быть не должно.
 */
export const contacts = {
  /** Формат: https://t.me/имя_пользователя */
  telegram: 'https://t.me/ekaterynaekateryna',
  /** Формат: https://wa.me/37360000000 — только цифры номера, без «+» и пробелов */
  whatsapp: 'https://wa.me/380664925296',
} as const satisfies Record<string, string>

export type ContactKey = keyof typeof contacts

/** Проверка формата ссылок: тест не даст собрать сайт с опечаткой в контакте. */
export const CONTACT_PATTERNS: Record<ContactKey, RegExp> = {
  telegram: /^https:\/\/t\.me\/[A-Za-z0-9_]{5,32}$/,
  whatsapp: /^https:\/\/wa\.me\/\d{8,15}$/,
}
