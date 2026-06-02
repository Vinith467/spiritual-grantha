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
      return match ? match[1] : 'en'
    } catch {
      return 'en'
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
      document.cookie = `googtrans=/en/${newLang}; path=/`
      document.cookie = `googtrans=/en/${newLang}; path=/; domain=${window.location.hostname}`
      window.location.reload()
    }
  }, [])

  const contentLang = ['en', 'hi', 'kn'].includes(selectedLang) ? selectedLang : 'hi'

  return { selectedLang, contentLang, handleLanguageChange }
}
