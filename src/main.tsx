import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/manrope/wght.css'
import './index.css'
import { App } from './App'
import { localeFromPath } from './i18n/locales'

// Скрывать блоки до появления можно только когда JS точно работает — иначе без JS страница была бы пустой
document.documentElement.classList.add('js')

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App initialLocale={localeFromPath(window.location.pathname)} />
  </StrictMode>
)

// В собранной версии страница уже отрисована заранее (prerender) — React её «оживляет».
// В режиме разработки разметки нет — рисуем с нуля.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
