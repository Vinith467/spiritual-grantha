import InstallButton from './InstallButton'

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-[#FF9933]/10 px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex justify-between items-center transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <img
          src="/icon-192.png"
          alt="Sanatan Dharma Television"
          className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full object-cover border border-[#FF9933]/50 flex-shrink-0 shadow-[0_0_15px_rgba(255,153,51,0.2)]"
        />
        <h1 className="text-[#FF9933] text-sm sm:text-base md:text-lg lg:text-xl font-black tracking-wide leading-none truncate whitespace-nowrap">
          Sanatan Dharma <span className="text-white">Television</span>
        </h1>
      </div>
      <div className="flex-shrink-0 ml-4 flex items-center gap-3 sm:gap-4">
        
        {/* Custom Designed YouTube Subscribe Button */}
        <a
          href="https://www.youtube.com/@Vinu_s_shetty467?sub_confirmation=1"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 sm:gap-2 bg-[#FF0000] hover:bg-[#CC0000] text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs md:text-sm font-bold shadow-[0_0_10px_rgba(255,0,0,0.3)] hover:shadow-[0_0_15px_rgba(255,0,0,0.5)] transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span className="tracking-wide">Subscribe Now</span>
        </a>
        
        <InstallButton />
      </div>
    </nav>
  )
}

export default Navbar