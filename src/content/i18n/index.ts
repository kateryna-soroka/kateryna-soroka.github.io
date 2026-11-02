import type { Locale } from '../../i18n/locales'
import { ru, type Dict } from './ru'
import { uk } from './uk'
import { en } from './en'

export type { Dict }
export const dictionaries: Record<Locale, Dict> = { ru, uk, en }
