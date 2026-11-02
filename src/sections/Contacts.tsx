import { useI18n } from '../i18n/I18nProvider'
import { contacts, type ContactKey } from '../content/site'
import { ArrowUpRight, Telegram, WhatsApp } from '../components/icons'
import { trackPointer } from '../components/ui'

const CHANNELS: ReadonlyArray<{ key: ContactKey; Icon: typeof Telegram }> = [
  { key: 'telegram', Icon: Telegram },
  { key: 'whatsapp', Icon: WhatsApp },
]

/** Экран 09 (ТЗ §12): ровно Telegram и WhatsApp. Ни формы, ни почты, ни лишних призывов. */
export function Contacts() {
  const { t } = useI18n()
  return (
    <section id="contacts" className="section contacts" aria-labelledby="contacts-title">
      <div className="container">
        <div className="contacts__card" data-reveal>
          <span className="eyebrow eyebrow--light" aria-hidden="true">
            09
          </span>
          <h2 id="contacts-title" className="h-section">
            {t.contacts.title}
          </h2>
          <p className="contacts__text">{t.contacts.text}</p>
          <ul className="contacts__list">
            {CHANNELS.map(({ key, Icon }) => {
              const url = contacts[key]
              const label = t.contacts[key]
              return (
                <li key={key}>
                  {url ? (
                    <a className="contact-btn" href={url} target="_blank" rel="noopener noreferrer" onPointerMove={trackPointer}>
                      <Icon width={22} height={22} />
                      <span className="contact-btn__label">{label}</span>
                      <span className="sr-only"> ({t.contacts.opensInNewTab})</span>
                      <ArrowUpRight className="contact-btn__arrow" width={20} height={20} />
                    </a>
                  ) : (
                    <span className="contact-btn contact-btn--pending" data-placeholder="contact">
                      <Icon width={22} height={22} />
                      <span className="contact-btn__label">{label}</span>
                      <span className="contact-btn__note">{t.contacts.linkPending}</span>
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
