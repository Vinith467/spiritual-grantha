import { useState } from 'react'

const PASSWORD = 'grantha123'

function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')

  if (!authed) return (
    <div className="bg-[#141414] min-h-screen flex items-center justify-center text-white">
      <div className="bg-[#1f1f1f] p-8 rounded-lg w-80">
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>
        <input
          type="password"
          placeholder="Enter password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          className="w-full p-2 rounded bg-[#333] text-white mb-4"
        />
        <button
          onClick={() => pass === PASSWORD ? setAuthed(true) : alert('Wrong password')}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded font-bold"
        >
          Login
        </button>
      </div>
    </div>
  )

  return (
    <div className="bg-[#141414] min-h-screen text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <p className="text-gray-400">Series & episode management coming next!</p>
    </div>
  )
}

export default Admin