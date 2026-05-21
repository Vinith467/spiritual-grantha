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
          Sanatan Dharma <span className="text-white">TV</span>
        </h1>
      </div>
      <div className="flex-shrink-0 ml-4 flex items-center gap-3 sm:gap-4">
        

        <InstallButton />
      </div>
    </nav>
  )
}

export default Navbar