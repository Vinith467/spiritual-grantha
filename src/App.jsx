import { Routes, Route, Navigate } from 'react-router-dom'
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

function ProtectedRoute({ children }) {
  const { isSubscribed } = useAuth()
  return isSubscribed ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { isSubscribed, isAdmin } = useAuth()
  if (!isSubscribed) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/home" replace />
  return children
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public routes — visible to everyone including Google bots */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Protected routes — require Google subscription */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/watch/:id" element={
          <ProtectedRoute>
            <Watch />
          </ProtectedRoute>
        } />
        <Route path="/shorts" element={
          <ProtectedRoute>
            <Shorts />
          </ProtectedRoute>
        } />
        <Route path="/music" element={
          <ProtectedRoute>
            <Music />
          </ProtectedRoute>
        } />
        <Route path="/account" element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />
        <Route path="/about" element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        } />

        {/* Admin — requires both subscription AND admin role */}
        <Route path="/admin" element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } />

        {/* 404 catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App