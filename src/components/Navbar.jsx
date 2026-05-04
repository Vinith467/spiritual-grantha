import InstallButton from './InstallButton'

function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black to-transparent px-4 md:px-8 py-3 flex justify-between items-center">
      <h1 className="text-yellow-500 text-2xl md:text-3xl font-extrabold tracking-wider">
        GRANTHA
      </h1>
      <InstallButton />
    </nav>
  )
}

export default Navbar