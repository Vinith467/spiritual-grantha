import InstallButton from './InstallButton'
import { YoutubeOutlined } from '@ant-design/icons'

function Navbar() {
  const channelId = 'UCzoylpvmDX_HoaBkgl4FTUQ'

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-[#FF9933]/10 px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex justify-between items-center transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <img
          src="/icon-192.png"
          alt="Sanatan Dharma Television"
          className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full object-cover border border-[#FF9933]/50 flex-shrink-0 shadow-[0_0_15px_rgba(255,153,51,0.2)]"
        />
        <h1 className="text-[#FF9933] text-sm sm:text-base md:text-lg lg:text-xl font-black tracking-wide leading-none truncate whitespace-nowrap">
          Sanatan Dharma <span className="text-white">TV</span>
        </h1>
      </div>
      <div className="flex-shrink-0 ml-4 flex items-center gap-2 sm:gap-3">
        {/* Beautiful YouTube Subscribe Button */}
        {channelId && (
          <a
            href={`https://www.youtube.com/channel/${channelId}?sub_confirmation=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-[10px] sm:text-xs px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-300 active:scale-95 animate-pulse-slow border border-red-500/20"
          >
            <YoutubeOutlined className="text-[11px] sm:text-sm" />
            <span className="tracking-wider">SUBSCRIBE NOW</span>
          </a>
        )}

        <InstallButton />
      </div>
    </nav>
  )
}

export default Navbar