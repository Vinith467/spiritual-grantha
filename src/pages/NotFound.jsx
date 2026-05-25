import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white flex flex-col items-center justify-center px-6 relative overflow-hidden selection:bg-[#FF9933]/30">

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-orange-950/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-md">
        <p className="text-8xl sm:text-9xl font-black text-[#FF9933] mb-4 drop-shadow-lg">404</p>
        <h1 className="text-2xl sm:text-3xl font-black mb-3">Page Not Found</h1>
        <p className="text-gray-400 text-sm sm:text-base mb-8 leading-relaxed">
          This path does not exist in the universe of Dharma. Let us guide you back to where the light shines.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/home')}
            className="bg-gradient-to-r from-[#FF9933] to-[#FF6600] text-black font-extrabold px-8 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_25px_rgba(255,153,51,0.3)]"
          >
            Go Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-white/10 border border-white/10 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/15 active:scale-95 transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
