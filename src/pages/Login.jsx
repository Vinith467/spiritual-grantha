import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const YOUTUBE_CHANNEL_ID = 'UCxxxxxxxxxxxxxxxxxxxxxx' // replace with your channel ID

function Login() {
  const navigate = useNavigate()

  useEffect(() => {
    // If already subscribed, skip login
    if (localStorage.getItem('subscribed') === 'true') {
      navigate('/', { replace: true })
    }
  }, [navigate])

  function handleSubscribe() {
    // Open YouTube subscribe page
    window.open(
      `https://www.youtube.com/@Vinu_s_shetty467?sub_confirmation=1`,
      '_blank'
    )
  }

  function handleContinue() {
    localStorage.setItem('subscribed', 'true')
    navigate('/', { replace: true })
  }

  return (
    <div className="bg-[#141414] min-h-screen flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <h1 className="text-yellow-500 text-4xl font-extrabold tracking-wider mb-2">
        GRANTHA
      </h1>
      <p className="text-gray-400 text-sm mb-10">Stream the Eternal</p>

      {/* Card */}
      <div className="bg-[#1f1f1f] rounded-2xl p-6 w-full max-w-sm shadow-2xl">

        {/* Channel avatar placeholder */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center mb-3">
            <span className="text-3xl">🕉️</span>
          </div>
          <h2 className="text-white font-bold text-lg text-center">
            Sanatan Dharma
          </h2>
          <p className="text-gray-400 text-xs text-center mt-1">
            Subscribe to get free access to all spiritual content
          </p>
        </div>

        {/* Subscribe button */}
        <button
          onClick={handleSubscribe}
          className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mb-3"
        >
          Subscribe on YouTube
        </button>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          className="w-full bg-white/10 hover:bg-white/20 active:scale-95 text-white py-3 rounded-xl font-bold text-sm transition-all"
        >
          I've Subscribed — Continue
        </button>

        <p className="text-gray-500 text-xs text-center mt-4">
          Free forever for subscribers
        </p>
      </div>
    </div>
  )
}

export default Login