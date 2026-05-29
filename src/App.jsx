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
import OnboardingModal from './components/OnboardingModal'

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

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <>
      <ScrollToTop />
      {isOffline && <OfflineScreen />}
      {isSubscribed && <OnboardingModal />}

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