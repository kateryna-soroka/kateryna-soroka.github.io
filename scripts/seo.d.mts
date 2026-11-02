export interface SeoLocale { code: 'uk' | 'ru' | 'en'; path: string; og: string }
export interface SeoMeta { title: string; description: string; ogAlt: string; siteName: string }
export interface SeoService { name: string; remote: boolean }
export type Area = { '@type': string; name: string }

export declare const LOCALES: readonly SeoLocale[]
export declare const REMOTE_AREA: readonly Area[]
export declare const SHOOT_AREA: readonly Area[]

export declare function headTags(o: {
  locale: SeoLocale
  meta: SeoMeta
  siteUrl?: string
  heroSrcset?: string
  fonts?: string[]
  ld?: object
}): string[]

export declare function jsonLd(o: {
  locale: SeoLocale
  siteUrl?: string
  name: string
  alternateName?: string[]
  jobTitle: string
  description: string
  sameAs?: string[]
  services?: SeoService[]
}): { '@context': string; '@graph': Record<string, unknown>[] }

export declare function robotsTxt(siteUrl?: string): string
export declare function sitemapXml(siteUrl: string | undefined, lastmod: string): string | null
