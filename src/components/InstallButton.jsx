import { useEffect, useState } from 'react'

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstall, setShowInstall] = useState(false)
  const [showSubscribe, setShowSubscribe] = useState(false)

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    })
  }, [])

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowInstall(false)
        setShowSubscribe(true)
      }
    }
  }

  if (showSubscribe) return (
    <a
    
      href={`https://www.youtube.com/channel/${import.meta.env.VITE_YOUTUBE_CHANNEL_ID || 'UCNIsckaXm3JOTRrmhQVGD2g'}?sub_confirmation=1`}
      target="_blank"
      rel="noreferrer"
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold text-sm"
    >
      Subscribe on YouTube
    </a>
  )

  if (showInstall) return (
    <button
      onClick={handleInstall}
      className="bg-white text-black px-4 py-2 rounded font-bold text-sm hover:bg-gray-200"
    >
      Install App
    </button>
  )

  return null
}

export default InstallButton