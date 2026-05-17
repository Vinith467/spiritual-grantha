import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

function Login() {
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('subscribed') === 'true') {
      navigate('/', { replace: true })
    }

    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/platform.js'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [navigate])

  function handleSubscribe() {
    window.open(
      'https://www.youtube.com/@Vinu_s_shetty467?sub_confirmation=1',
      '_blank'
    )
  }

  function handleContinue() {
    localStorage.setItem('subscribed', 'true')
    navigate('/', { replace: true })
  }

  return (
    <div className="bg-[#141414] min-h-screen flex flex-col items-center justify-center px-6">

      <h1 className="text-yellow-500 text-4xl font-extrabold tracking-wider mb-1">
        GRANTHA
      </h1>
      <p className="text-gray-400 text-sm mb-10">Stream the Eternal</p>

      <div className="bg-[#1f1f1f] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-white/5">

        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/50 flex items-center justify-center mb-3">
            <span className="text-4xl">🕉️</span>
          </div>
          <h2 className="text-white font-bold text-lg text-center">
            Welcome to Grantha
          </h2>
          <p className="text-gray-400 text-xs text-center mt-1 leading-relaxed">
            Subscribe to our YouTube channel to get free access to all spiritual content
          </p>
        </div>

        {/* Embedded subscribe button - works if signed in */}
        <div className="flex justify-center bg-white/5 rounded-xl py-4 mb-4">
          <div
            className="g-ytsubscribe"
            data-channelid="UCNIsckaXm3JOTRrmhQVGD2g"
            data-layout="full"
            data-count="default"
          />
        </div>

        {/* Fallback if not signed into Google */}
        <p className="text-gray-500 text-xs text-center mb-4">
          Button not working?
          <button
            onClick={handleSubscribe}
            className="text-yellow-500 underline ml-1"
          >
            Subscribe here
          </button>
        </p>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-gray-500 text-xs">then</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black py-3 rounded-xl font-bold text-sm transition-all"
        >
          I've Subscribed — Watch Now
        </button>

        <p className="text-gray-500 text-[10px] text-center mt-4">
          Free forever for subscribers. One time only.
        </p>
      </div>
    </div>
  )
}

export default Login