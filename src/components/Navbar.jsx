import InstallButton from './InstallButton'

function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black to-transparent px-4 md:px-8 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img
          src="/icon-192.png"
          alt="Sanatan Dharma Television"
          className="w-8 h-8 rounded-full object-cover border border-[#FF9933]/50 flex-shrink-0"
        />
        <h1 className="text-[#FF9933] text-base md:text-2xl font-extrabold tracking-wide leading-tight">
          Sanatan Dharma Television
        </h1>
      </div>
      <InstallButton />
    </nav>
  )
}

export default Navbar