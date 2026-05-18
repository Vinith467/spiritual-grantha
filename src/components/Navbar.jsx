import InstallButton from './InstallButton'

function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black to-transparent px-4 md:px-8 py-3 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img
          src="/icon-192.png"
          alt="Sanatan Dharma Television"
          className="w-9 h-9 rounded-full object-cover border border-yellow-500/50"
        />
        <h1 className="text-yellow-500 text-2xl md:text-3xl font-extrabold tracking-wider">
          Sanatan Dharma Television
        </h1>
      </div>
      <InstallButton />
    </nav>
  )
}

export default Navbar