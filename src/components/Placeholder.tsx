import { useI18n } from '../i18n/I18nProvider'
import { ImageIcon, VideoIcon } from './icons'

interface Props {
  media: 'image' | 'video'
  className?: string
}

/** Явно подписанное место под материал Кати (ТЗ: «маркированные заменяемые плейсхолдеры»). */
export function Placeholder({ media, className = '' }: Props) {
  const { t } = useI18n()
  const Icon = media === 'video' ? VideoIcon : ImageIcon
  return (
    <span className={`placeholder ${className}`} data-placeholder={media}>
      <Icon className="placeholder__icon" />
      <span className="placeholder__label">{t.common.placeholder}</span>
    </span>
  )
}
