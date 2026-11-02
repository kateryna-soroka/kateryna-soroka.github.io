import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
}

export const ArrowUpRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

export const Check = (p: IconProps) => (
  <svg {...base} strokeWidth={2} {...p}>
    <path d="m6 12.5 4 4 8-9" />
  </svg>
)

export const Cross = (p: IconProps) => (
  <svg {...base} strokeWidth={1.75} {...p}>
    <path d="m7.5 7.5 9 9M16.5 7.5l-9 9" />
  </svg>
)

export const Plus = (p: IconProps) => (
  <svg {...base} strokeWidth={1.75} {...p}>
    <path d="M12 6v12M6 12h12" />
  </svg>
)

export const Play = (p: IconProps) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}>
    <path d="M8.5 6.2v11.6c0 .8.86 1.3 1.55.88l9.2-5.8a1.03 1.03 0 0 0 0-1.76l-9.2-5.8A1.03 1.03 0 0 0 8.5 6.2Z" />
  </svg>
)

export const ChevronLeft = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m15 5-7 7 7 7" />
  </svg>
)

export const ChevronRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m9 5 7 7-7 7" />
  </svg>
)

export const Close = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const ImageIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <circle cx="9" cy="10" r="1.75" />
    <path d="m20.5 16-4.8-4.8a1.5 1.5 0 0 0-2.1 0L5 19.5" />
  </svg>
)

export const VideoIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5.5" width="13" height="13" rx="2.5" />
    <path d="m16.5 10.5 4-2.5v8l-4-2.5" />
  </svg>
)

export const Pin = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.25" />
  </svg>
)

export const Telegram = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M20.6 4.4 3.4 11.1c-.9.35-.86 1.62.06 1.9l4.3 1.33 1.64 5.08c.27.84 1.34 1.08 1.94.43l2.32-2.5 4.2 3.1c.7.52 1.7.13 1.88-.72L22.1 5.8c.2-.95-.73-1.75-1.5-1.4Z" />
    <path d="m7.8 14.3 9.6-6.7-6.9 7.9" />
  </svg>
)

export const WhatsApp = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4.2 19.8 5.3 16A8.5 8.5 0 1 1 8.6 19l-4.4.8Z" />
    <path d="M9.2 8.4c.2-.4.6-.4.9-.4l.5.1c.2 0 .4.2.5.5l.6 1.5c.1.3 0 .6-.2.8l-.4.5c.6 1.2 1.6 2.2 2.9 2.8l.5-.5c.2-.2.5-.3.8-.2l1.5.6c.3.1.5.3.5.6v.5c0 .4-.2.8-.6 1-.6.3-1.4.4-2.3.1-2.4-.8-4.4-2.8-5.2-5.2-.3-.9-.2-1.7.1-2.3Z" />
  </svg>
)
