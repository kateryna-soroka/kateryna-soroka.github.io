import type { Dict } from './i18n'

/** ✓ включено · × не включено · + дополнительная услуга, обсуждается отдельно (ТЗ §7) */
export type Mark = 'yes' | 'no' | 'extra'
export type PackageId = 'base' | 'complete'
type RowId = keyof Dict['smm']['rows']

/**
 * Строки сравнения — в одном порядке для обоих пакетов.
 * Отметки для Base в строках «только Complete» выбраны по природе услуги (ТЗ: «× или +»):
 * съёмку ТЗ прямо разрешает согласовать отдельно → «+»; адаптация под TikTok/Shorts и Telegram —
 * самостоятельные работы, их можно докупить → «+»; стратегия, контент для продаж и углублённая
 * аналитика — суть пакета Complete → «×». Это предложение исполнителя, его подтверждает Катя.
 */
export const SMM_ROWS: ReadonlyArray<{ id: RowId; base: Mark; complete: Mark }> = [
  { id: 'audit', base: 'yes', complete: 'yes' },
  { id: 'competitors', base: 'yes', complete: 'yes' },
  { id: 'contentPlan', base: 'yes', complete: 'yes' },
  { id: 'clientEditing', base: 'yes', complete: 'yes' },
  { id: 'copywriting', base: 'yes', complete: 'yes' },
  { id: 'dailyDesign', base: 'yes', complete: 'yes' },
  { id: 'storiesReels', base: 'yes', complete: 'yes' },
  { id: 'trends', base: 'yes', complete: 'yes' },
  { id: 'expertContent', base: 'yes', complete: 'yes' },
  { id: 'regularPosts', base: 'yes', complete: 'yes' },
  { id: 'basicAnalytics', base: 'yes', complete: 'yes' },
  { id: 'strategy', base: 'no', complete: 'yes' },
  { id: 'salesContent', base: 'no', complete: 'yes' },
  { id: 'deepAnalytics', base: 'no', complete: 'yes' },
  { id: 'shooting', base: 'extra', complete: 'yes' },
  { id: 'crossposting', base: 'extra', complete: 'yes' },
  { id: 'telegram', base: 'extra', complete: 'yes' },
  { id: 'branding', base: 'extra', complete: 'extra' },
  { id: 'landings', base: 'extra', complete: 'extra' },
  { id: 'chatbots', base: 'extra', complete: 'extra' },
  { id: 'funnels', base: 'extra', complete: 'extra' },
]

export const PACKAGES: readonly PackageId[] = ['base', 'complete']
