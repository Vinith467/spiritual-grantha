import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Watch from './pages/Watch'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Shorts from './pages/Shorts'
import Music from './pages/Music'
import Account from './pages/Account'
import About from './pages/About'

function ProtectedRoute({ children }) {
  const subscribed = localStorage.getItem('subscribed') === 'true'
  return subscribed ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
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