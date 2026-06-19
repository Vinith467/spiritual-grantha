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
  const { isSubscribed, isAdmin } = useAuth()
  
  const [isStandalone, setIsStandalone] = useState(
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleChange = (e) => setIsStandalone(e.matches || window.navigator.standalone)
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  if (!isSubscribed) return <Navigate to="/" replace />
  
  if (!isStandalone) {
    return (
      <div className="bg-[#141414] min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 z-[99999] relative">
        <img src="/icon-192.png" alt="SDTV" className="w-24 h-24 rounded-full mb-6 border-2 border-[#FF9933] shadow-[0_0_20px_rgba(255,153,51,0.3)]" />
        <h1 className="text-2xl font-black text-white mb-2">App Only Access</h1>
        <p className="text-gray-400 max-w-sm mb-8 leading-relaxed">
          Sanatan Dharma TV is designed exclusively as a native app experience. <br/><br/>
          <strong className="text-[#FF9933]">Please close this browser tab and launch the app directly from your device's Home Screen to continue.</strong>
        </p>
      </div>
    )
  }

  return children
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
  const [installProgress, setInstallProgress] = useState(0)
  const [installState, setInstallState] = useState(() => {
    return sessionStorage.getItem('sdtv_just_installed') === 'true' ? 'success' : 'none'
  })

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    const handleAppInstalled = () => {
      setInstallState('installing')
      window.deferredPrompt = null

      let progress = 0
      const duration = 60000 // 1 minute
      const interval = 1000 // update every 1s
      const steps = duration / interval
      
      const timer = setInterval(() => {
        progress += (100 / steps)
        if (progress >= 100) {
          clearInterval(timer)
          setInstallState('none')
          sessionStorage.setItem('sdtv_just_installed', 'true')
        } else {
          setInstallProgress(progress)
        }
      }, interval)
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

      {/* App Installation States */}
      {installState === 'installing' && (
        <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#0a0a0a] p-6 animate-in fade-in duration-500 overflow-hidden">
          
          {/* Background Images (Changes every 25%) */}
          <div className="absolute inset-0 z-0 pointer-events-none bg-[#0a0a0a]">
            <img 
              src="/assets/vishnu_lakshmi.webp" 
              alt="Vishnu"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-in-out mix-blend-screen ${installProgress < 25 ? 'opacity-40 scale-100' : 'opacity-0 scale-105'}`} 
            />
            <img 
              src="/assets/ram_sita.webp" 
              alt="Ram"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-in-out mix-blend-screen ${installProgress >= 25 && installProgress < 50 ? 'opacity-40 scale-100' : 'opacity-0 scale-105'}`} 
            />
            <img 
              src="/assets/krishna_arjuna.webp" 
              alt="Krishna Arjuna"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-in-out mix-blend-screen ${installProgress >= 50 && installProgress < 75 ? 'opacity-40 scale-100' : 'opacity-0 scale-105'}`} 
            />
            <img 
              src="/assets/krishna_radha.webp" 
              alt="Krishna Radha"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-in-out mix-blend-screen ${installProgress >= 75 ? 'opacity-40 scale-100' : 'opacity-0 scale-105'}`} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#FF9933] rounded-3xl blur-2xl opacity-20 animate-pulse" />
              <img src="/icon-192.png" alt="SDTV" className="relative w-28 h-28 rounded-3xl shadow-2xl border border-white/10" />
            </div>
            
            <h2 className="text-2xl font-black text-white mb-2 tracking-wide">Installing SDTV</h2>
            <p className="text-gray-400 text-sm mb-10 font-medium">Setting up your spiritual journey...</p>
            
            {/* Progress Bar */}
            <div className="w-full max-w-xs bg-white/10 rounded-full h-3 mb-3 overflow-hidden border border-white/10 shadow-inner">
              <div 
                className="bg-gradient-to-r from-[#FF9933]/80 to-[#FF9933] h-full rounded-full transition-all duration-1000 ease-linear shadow-[0_0_15px_rgba(255,153,51,0.6)]"
                style={{ width: `${installProgress}%` }}
              />
            </div>
            <span className="text-[#FF9933] font-bold text-sm tracking-wider">{Math.floor(installProgress)}%</span>
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