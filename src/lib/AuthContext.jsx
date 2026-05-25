import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isSubscribed, setIsSubscribed] = useState(
    () => localStorage.getItem('subscribed') === 'true'
  )
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem('isAdmin') === 'true'
  )
  const [profile, setProfile] = useState(() => ({
    name: localStorage.getItem('profileName') || 'Devotee',
    email: localStorage.getItem('profileEmail') || '',
    avatar: localStorage.getItem('profileAvatar') || null,
    contact: localStorage.getItem('profileContact') || '',
  }))

  // Sync profile state to localStorage
  const updateProfile = useCallback((updates) => {
    setProfile(prev => {
      const next = { ...prev, ...updates }
      if (next.name) localStorage.setItem('profileName', next.name)
      if (next.email) localStorage.setItem('profileEmail', next.email)
      if (next.avatar) localStorage.setItem('profileAvatar', next.avatar)
      if (next.contact) localStorage.setItem('profileContact', next.contact)
      // Dispatch a custom event so BottomNavbar (and others) can react instantly
      window.dispatchEvent(new Event('profileUpdated'))
      return next
    })
  }, [])

  const signIn = useCallback(() => {
    localStorage.setItem('subscribed', 'true')
    setIsSubscribed(true)
  }, [])

  const setAdminStatus = useCallback((status) => {
    localStorage.setItem('isAdmin', String(status))
    setIsAdmin(status)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem('subscribed')
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('profileEmail')
    localStorage.removeItem('profileName')
    localStorage.removeItem('profileContact')
    localStorage.removeItem('profileAvatar')
    setIsSubscribed(false)
    setIsAdmin(false)
    setProfile({ name: 'Devotee', email: '', avatar: null, contact: '' })
  }, [])

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'subscribed') setIsSubscribed(e.newValue === 'true')
      if (e.key === 'isAdmin') setIsAdmin(e.newValue === 'true')
      if (e.key === 'profileAvatar') {
        setProfile(prev => ({ ...prev, avatar: e.newValue }))
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
    <AuthContext.Provider value={{
      isSubscribed, isAdmin, profile,
      signIn, signOut, setAdminStatus, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
