import { WifiOutlined } from '@ant-design/icons'

export default function OfflineScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl px-6 py-12 text-center animate-fade-in">
      <div className="relative mb-8">
        {/* Glow Effects */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#FF9933]/30 to-[#FF6600]/30 blur-2xl animate-pulse" />
        
        {/* Disconnect Icon Container */}
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#FF9933]/10 to-[#FF6600]/10 border border-[#FF9933]/30 shadow-[0_0_30px_rgba(255,153,51,0.2)]">
          <WifiOutlined className="text-5xl text-[#FF9933] animate-pulse" />
          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-red-600 border-2 border-black flex items-center justify-center text-[10px] font-black text-white shadow-lg">
            !
          </div>
        </div>
      </div>

      {/* Main Title */}
      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide mb-4">
        Connection <span className="text-[#FF9933]">Lost</span>
      </h2>

      {/* Spiritual Reframing Quote */}
      <div className="max-w-md bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF9933] to-[#FF6600]" />
        <p className="text-gray-300 italic text-base sm:text-lg mb-3">
          "When the outer connection fails, it is time to connect within."
        </p>
        <p className="text-[10px] sm:text-xs text-[#FF9933] font-bold tracking-widest uppercase">
          Spiritual Wisdom
        </p>
      </div>

      {/* Status Info */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="text-sm text-gray-400 font-medium">
            Waiting for network reconnection...
          </span>
        </div>
        <p className="text-xs text-gray-500 max-w-xs">
          Please check your Wi-Fi or cellular connection. Omisha and the Inner Path will automatically resume once online.
        </p>
      </div>

      {/* Retry Action */}
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF9933] to-[#FF6600] text-black font-extrabold text-xs sm:text-sm tracking-wider uppercase hover:shadow-[0_0_20px_rgba(255,153,51,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 shadow-md"
      >
        Tap to Refresh
      </button>
    </div>
  )
}
