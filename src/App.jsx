import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from './lib/AuthContext'
import { useActivityTracker } from './lib/useActivityTracker'
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

  if (!isSubscribed) {
    return isStandalone ? <Navigate to="/login" replace /> : <Navigate to="/" replace />
  }
  
  if (!isStandalone) {
    return (
      <div className="bg-[#141414] min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 z-[99999] relative">
        <img src="/icon-192.png" alt="Omisha" className="w-24 h-24 rounded-full mb-6 border-2 border-[#FF9933] shadow-[0_0_20px_rgba(255,153,51,0.3)]" />
        <h1 className="text-2xl font-black text-white mb-2">App Only Access</h1>
        <p className="text-gray-400 max-w-sm mb-8 leading-relaxed">
          Omisha and the Inner Path is designed exclusively as a native app experience. <br/><br/>
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
  useActivityTracker()
  const location = useLocation()
  
  // Save last visited path so we can restore it when the app reopens
  useEffect(() => {
    if (location.pathname !== '/' && location.pathname !== '/login') {
      localStorage.setItem('last_path', location.pathname + location.search)
    }
  }, [location.pathname, location.search])

  const { isSubscribed } = useAuth()
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [installState, setInstallState] = useState('none')
  const [bgIndex, setBgIndex] = useState(0)
  const [installProgress, setInstallProgress] = useState(0)
  
  const timerRef = useRef(null)
  const isInstallingFlowRef = useRef(false)

  // Loop background images every 2.5s while installing
  useEffect(() => {
    if (installState === 'installing') {
      const timer = setInterval(() => {
        setBgIndex(prev => (prev + 1) % 4)
      }, 2500)
      return () => clearInterval(timer)
    }
  }, [installState])

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    const showSuccess = () => {
      if (timerRef.current) clearInterval(timerRef.current)
      setInstallProgress(100)
      setInstallState('success')
      setTimeout(() => {
        setInstallState('none')
      }, 5000)
    }

    const handleStartInstall = () => {
      isInstallingFlowRef.current = true
      setInstallState('installing')
      setInstallProgress(0)

      if (timerRef.current) clearInterval(timerRef.current)

      // Fixed 20-second visual wait: 400 steps * 50ms = 20000ms
      // This guarantees the OS has enough time to finish the background install
      // before we show the "Success" screen.
      timerRef.current = setInterval(() => {
        setInstallProgress((prev) => {
          const next = prev + 0.25 // 0.25% per 50ms
          if (next >= 100) {
            showSuccess()
            return 100
          }
          return next
        })
      }, 50)
    }

    const handleAppInstalled = () => {
      // The appinstalled event fires the moment the user *accepts* the prompt,
      // NOT when the OS actually finishes writing the app to the home screen!
      // So if we started our visual loader, we ignore this event and force the 20s wait.
      if (!isInstallingFlowRef.current) {
        showSuccess()
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('start-install-animation', handleStartInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('start-install-animation', handleStartInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <>
      <ScrollToTop />
      {isOffline && <OfflineScreen />}

      {/* App Installation States */}
      {installState === 'installing' && (
        <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#0a0a0a] p-6 animate-in fade-in duration-500 overflow-hidden">
          
          {/* Background Images (Changes every 2.5s) */}
          <div className="absolute inset-0 z-0 pointer-events-none bg-[#0a0a0a]">
            <img 
              src="/assets/vishnu_lakshmi.webp" 
              alt="Vishnu"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-in-out mix-blend-screen ${bgIndex === 0 ? 'opacity-40 scale-100' : 'opacity-0 scale-105'}`} 
            />
            <img 
              src="/assets/ram_sita.webp" 
              alt="Ram"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-in-out mix-blend-screen ${bgIndex === 1 ? 'opacity-40 scale-100' : 'opacity-0 scale-105'}`} 
            />
            <img 
              src="/assets/krishna_arjuna.webp" 
              alt="Krishna Arjuna"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-in-out mix-blend-screen ${bgIndex === 2 ? 'opacity-40 scale-100' : 'opacity-0 scale-105'}`} 
            />
            <img 
              src="/assets/krishna_radha.webp" 
              alt="Krishna Radha"
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-in-out mix-blend-screen ${bgIndex === 3 ? 'opacity-40 scale-100' : 'opacity-0 scale-105'}`} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#FF9933] rounded-3xl blur-2xl opacity-20 animate-pulse" />
              <img src="/icon-192.png" alt="Omisha" className="relative w-28 h-28 rounded-3xl shadow-2xl border border-white/10 animate-bounce" />
            </div>
            
            <h2 className="text-2xl font-black text-white mb-2 tracking-wide">Installing Omisha</h2>
            <p className="text-gray-400 text-sm mb-10 font-medium">Setting up your spiritual journey...</p>
            
            {/* Progress Bar (Percentage text removed per user request) */}
            <div className="w-full max-w-xs bg-white/10 rounded-full h-3 mb-3 overflow-hidden border border-white/10 shadow-inner">
              <div 
                className="bg-gradient-to-r from-[#FF9933]/80 to-[#FF9933] h-full rounded-full transition-all duration-200 ease-linear shadow-[0_0_15px_rgba(255,153,51,0.6)]"
                style={{ width: `${installProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {installState === 'success' && (
        <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-in fade-in duration-500">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white mb-2 text-center tracking-wide">App Installed!</h2>
          <p className="text-gray-300 text-center text-sm mb-6 max-w-xs leading-relaxed">
            <strong className="text-[#FF9933]">Please close this browser window</strong> and open the Omisha app from your phone's home screen.
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
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
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