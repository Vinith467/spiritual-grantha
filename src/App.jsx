import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from './lib/AuthContext'
import ScrollToTop from './components/ScrollToTop'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Watch from './pages/Watch'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Shorts from './pages/Shorts'
import Music from './pages/Music'
import Account from './pages/Account'
import About from './pages/About'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'
import { AnimatePresence } from 'framer-motion'
import PageTransition from './components/PageTransition'
import OfflineScreen from './components/OfflineScreen'

function ProtectedRoute({ children }) {
  const { isSubscribed } = useAuth()
  return isSubscribed ? children : <Navigate to="/" replace />
}

function AdminRoute({ children }) {
  const { isSubscribed, isAdmin } = useAuth()
  if (!isSubscribed) return <Navigate to="/" replace />
  if (!isAdmin) return <Navigate to="/home" replace />
  return children
}

function App() {
  const location = useLocation()
  const { isSubscribed } = useAuth()
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [showInstallSuccess, setShowInstallSuccess] = useState(() => {
    return sessionStorage.getItem('sdtv_just_installed') === 'true'
  })

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    const handleAppInstalled = () => {
      setShowInstallSuccess(true)
      sessionStorage.setItem('sdtv_just_installed', 'true')
      window.deferredPrompt = null
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  return (
    <>
      <ScrollToTop />
      {isOffline && <OfflineScreen />}

      {/* App Installed Success Overlay */}
      {showInstallSuccess && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-in fade-in duration-500">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white mb-2 text-center tracking-wide">App Installed!</h2>
          <p className="text-gray-300 text-center text-sm mb-6 max-w-xs leading-relaxed">
            <strong className="text-[#FF9933]">Please close this browser window</strong> and open the SDTV app from your phone's home screen.
          </p>
          
          <div className="w-full max-w-[280px] bg-white/10 rounded-2xl p-2 mb-8 border border-white/20 shadow-2xl overflow-hidden">
            <img src="/assets/install-guide.jpg" alt="Install Guide" className="w-full h-auto rounded-xl object-cover" />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public routes — visible to everyone including Google bots */}
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />

          {/* Protected routes — require Google subscription */}
          <Route path="/home" element={
            <ProtectedRoute>
              <PageTransition>
                <Home />
              </PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/watch/:id" element={
            <ProtectedRoute>
              <PageTransition>
                <Watch />
              </PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/shorts" element={
            <ProtectedRoute>
              <PageTransition>
                <Shorts />
              </PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/music" element={
            <ProtectedRoute>
              <PageTransition>
                <Music />
              </PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/account" element={
            <ProtectedRoute>
              <PageTransition>
                <Account />
              </PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/about" element={
            <ProtectedRoute>
              <PageTransition>
                <About />
              </PageTransition>
            </ProtectedRoute>
          } />

          {/* Admin — requires both subscription AND admin role */}
          <Route path="/admin" element={
            <AdminRoute>
              <PageTransition>
                <Admin />
              </PageTransition>
            </AdminRoute>
          } />

          {/* 404 catch-all */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default App