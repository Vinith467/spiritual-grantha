import { Routes, Route, Navigate } from 'react-router-dom'
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

function ProtectedRoute({ children }) {
  const subscribed = localStorage.getItem('subscribed') === 'true'
  return subscribed ? children : <Navigate to="/login" replace />
}

function App() {
  return (
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
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}

export default App