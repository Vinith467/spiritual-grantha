import { useCallback, useState } from 'react'

/**
 * Shared hook that proxies our custom LanguageSelector to Google Translate.
 * Eliminates the duplicate handleLanguageChange logic from Login.jsx and Account.jsx.
 */
export function useGoogleTranslate() {
  const [selectedLang, setSelectedLang] = useState(() => {
    try {
      const match =
        typeof document !== 'undefined'
          ? document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/)
          : null
      return match ? match[1] : 'hi'
    } catch {
      return 'hi'
    }
  })

  const handleLanguageChange = useCallback((newLang) => {
    setSelectedLang(newLang)
    const googleSelect = document.querySelector('.goog-te-combo')
    if (googleSelect) {
      googleSelect.value = newLang
      let event
      if (typeof window.Event === 'function') {
        event = new window.Event('change', { bubbles: true, cancelable: true })
      } else {
        event = document.createEvent('HTMLEvents')
        event.initEvent('change', true, true)
      }
      googleSelect.dispatchEvent(event)
    } else {
      document.cookie = `googtrans=/auto/${newLang}; path=/`
      document.cookie = `googtrans=/auto/${newLang}; path=/; domain=${window.location.hostname}`
      window.location.reload()
    }
  }, [])

  // The database content is exclusively in Hindi. 
  // Google Translate will translate this Hindi content to the user's selected language.
  const contentLang = 'hi'

  return { selectedLang, contentLang, handleLanguageChange }
}
