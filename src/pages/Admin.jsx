import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Admin() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    // Google SSO Admin Auto-Authorization
    if (localStorage.getItem('isAdmin') === 'true') {
      setAuthed(true)
    } else {
      alert('Access Denied: You are not authorized to view the Admin Dashboard.')
      navigate('/home')
    }
  }, [navigate])

  if (!authed) return (
    <div className="bg-[#141414] min-h-screen flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm font-semibold">Authorizing Session...</p>
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